from django.contrib.auth import authenticate, get_user_model, login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import (
    csrf_protect,
    ensure_csrf_cookie,
)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.authentication import SessionAuthentication

from .serializers import RegisterSerializer, LoginSerializer

# Create your views here.


def user_data(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_staff": user.is_staff,
    }


# CSRF TOKEN
@method_decorator(ensure_csrf_cookie, name="dispatch")
class CSRFView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"message": "CSRF cookie set."})


# REGISTER
@method_decorator(csrf_protect, name="dispatch")
class RegisterView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        return Response(
            {"message": "Registration successful.", "user": user_data(user)},
            status=status.HTTP_201_CREATED,
        )


# LOGIN
@method_decorator(csrf_protect, name="dispatch")
class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        user = authenticate(
            request=request._request, username=username, password=password
        )

        if user is None:
            return Response(
                {"detail": "Invalid username or password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        login(request._request, user)

        return Response(
            {"message": "Login successful.", "user": user_data(user)},
            status=status.HTTP_200_OK,
        )


# LOGOUT
class LogoutView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request._request)

        return Response({"message": "Logout successful."}, status=status.HTTP_200_OK)


# CURRENT USER
class CurrentUserView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(user_data(request.user), status=status.HTTP_200_OK)


class UserListView(APIView):
    """Expose assignment choices only to staff members."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        users = get_user_model().objects.order_by("username").values("id", "username")

        return Response(list(users))
