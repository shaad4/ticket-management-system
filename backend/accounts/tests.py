import json

from django.contrib.auth import get_user_model
from django.test import Client, TestCase
from django.urls import reverse

from tickets.models import Ticket


class FrontendAPIIntegrationTests(TestCase):
    """Exercise the session and ticket contracts used by the React frontend."""

    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        self.user = get_user_model().objects.create_user(
            username="owner", password="Test-only-password-830!"
        )
        self.other_user = get_user_model().objects.create_user(username="other")
        self.admin = get_user_model().objects.create_user(
            username="manager", password="Test-only-password-830!", is_staff=True
        )

    def csrf(self):
        self.client.get(reverse("csrf"))
        return self.client.cookies["csrftoken"].value

    def mutate(self, method, url, data=None):
        # Read a fresh token, as the browser does after Django rotates it on login.
        return getattr(self.client, method)(
            url,
            data=json.dumps(data or {}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf(),
            HTTP_ORIGIN="http://localhost:5173",
        )

    def login(self, username="owner"):
        response = self.mutate(
            "post",
            reverse("login"),
            {
                "username": username,
                "password": "Test-only-password-830!",
            },
        )
        self.assertEqual(response.status_code, 200)
        return response

    def test_registration_login_session_and_logout(self):
        self.assertEqual(self.client.get(reverse("current-user")).status_code, 403)

        response = self.mutate(
            "post",
            reverse("register"),
            {
                "username": "new-user",
                "email": "new@example.com",
                "password": "Test-only-password-830!",
                "confirm_password": "Test-only-password-830!",
            },
        )
        self.assertEqual(response.status_code, 201)
        self.assertFalse(response.json()["user"]["is_staff"])
        self.assertEqual(self.client.get(reverse("current-user")).status_code, 403)

        self.login("new-user")
        self.assertEqual(
            self.client.get(reverse("current-user")).json()["username"], "new-user"
        )
        self.assertEqual(self.mutate("post", reverse("logout")).status_code, 200)
        self.assertEqual(self.client.get(reverse("current-user")).status_code, 403)

    def test_csrf_and_validation_failures(self):
        response = self.client.post(
            reverse("login"), {"username": "owner", "password": "anything"}
        )
        self.assertEqual(response.status_code, 403)

        response = self.mutate(
            "post", reverse("login"), {"username": "owner", "password": "incorrect"}
        )
        self.assertEqual(response.status_code, 400)

        response = self.mutate(
            "post",
            reverse("register"),
            {
                "username": "owner",
                "email": "bad",
                "password": "short",
                "confirm_password": "different",
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("username", response.json())

    def test_user_crud_and_ownership(self):
        other_ticket = Ticket.objects.create(
            title="Private", description="Other user", user=self.other_user
        )
        self.login()

        response = self.mutate(
            "post",
            reverse("ticket-list-create"),
            {
                "title": "Real API ticket",
                "description": "Saved in the database",
                "priority": "high",
            },
        )
        self.assertEqual(response.status_code, 201)
        ticket = response.json()
        self.assertEqual(ticket["user"], self.user.id)
        self.assertEqual(ticket["user_username"], "owner")
        self.assertIsNone(ticket["assigned_to_username"])

        url = reverse("ticket-detail", args=[ticket["id"]])
        self.assertEqual(self.client.get(url).status_code, 200)
        self.assertEqual(len(self.client.get(reverse("ticket-list-create")).json()), 1)
        self.assertEqual(
            self.client.get(
                reverse("ticket-detail", args=[other_ticket.id])
            ).status_code,
            404,
        )
        self.assertEqual(
            self.mutate(
                "patch",
                reverse("ticket-detail", args=[other_ticket.id]),
                {"title": "No"},
            ).status_code,
            404,
        )
        self.assertEqual(
            self.mutate(
                "delete", reverse("ticket-detail", args=[other_ticket.id])
            ).status_code,
            404,
        )
        self.assertEqual(self.client.get(reverse("user-list")).status_code, 403)
        self.assertEqual(
            self.mutate("patch", url, {"status": "resolved"}).status_code, 400
        )
        self.assertEqual(
            self.mutate("patch", url, {"assigned_to": self.admin.id}).status_code, 400
        )

        self.assertEqual(
            self.mutate("patch", url, {"title": "Updated"}).json()["title"], "Updated"
        )
        self.assertEqual(self.mutate("delete", url).status_code, 204)
        self.assertEqual(self.client.get(url).status_code, 404)

    def test_admin_assignment_and_status(self):
        ticket = Ticket.objects.create(
            title="Assign me", description="Request", user=self.user
        )
        self.login("manager")
        users = self.client.get(reverse("user-list"))
        self.assertEqual(users.status_code, 200)
        self.assertEqual(set(users.json()[0]), {"id", "username"})
        self.assertEqual(len(self.client.get(reverse("ticket-list-create")).json()), 1)

        url = reverse("ticket-detail", args=[ticket.id])
        response = self.mutate(
            "patch", url, {"status": "in-progress", "assigned_to": self.admin.id}
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["assigned_to_username"], "manager")
        self.assertEqual(response.json()["status"], "in-progress")
        self.assertEqual(
            self.mutate("patch", url, {"status": "invalid"}).status_code, 400
        )
        self.assertEqual(
            self.mutate("patch", url, {"assigned_to": 99999}).status_code, 400
        )
        self.assertIsNone(
            self.mutate("patch", url, {"assigned_to": None}).json()["assigned_to"]
        )
