# Ticket Desk frontend

React + Vite + Tailwind frontend connected to the Django session-authenticated API. Icons come from Lucide. State stays in ordinary React components; requests use the browser's built-in `fetch`.

## Run locally

Requires Python 3.12+, PostgreSQL, and Node.js 20.19+ or 22.12+.

Create a PostgreSQL database and user. From the repository root, create the Python environment and install dependencies:

```sh
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` with your database name, user, and password before continuing:

```sh
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

In another terminal:

```sh
cd frontend
npm ci
npm run dev
```

Open http://localhost:5173. Register an account, then sign in with its **username and password**. Staff accounts see the admin workspace automatically; there is no demo role switch. To create an administrator, run `python manage.py createsuperuser` from the backend directory.

Vite proxies `/api` to `http://127.0.0.1:8000`. To change the target, copy `frontend/.env.example` to `frontend/.env` and set `API_TARGET`, then restart Vite. The dev and preview servers use port 5173 with `strictPort` so the CSRF origin stays predictable. If you change the frontend port, add its full origin to `CSRF_TRUSTED_ORIGINS` in `backend/.env` and restart Django.

## What is connected

| Action | Endpoint |
| --- | --- |
| Set CSRF cookie | `GET /api/auth/csrf/` |
| Register | `POST /api/auth/register/` |
| Login / logout | `POST /api/auth/login/`, `POST /api/auth/logout/` |
| Restore session | `GET /api/auth/me/` |
| Admin assignment choices | `GET /api/auth/users/` (staff only) |
| Ticket list / create | `GET /api/tickets/`, `POST /api/tickets/` |
| Ticket detail / edit / delete | `GET`, `PATCH`, `DELETE /api/tickets/:id/` |

There are no mock users or tickets. New accounts start with an empty dashboard. Django persists changes and enforces permissions. Refresh restores the session from the HTTP-only session cookie. The frontend reads the CSRF cookie for each mutation, including after login rotates it. Credentials and session tokens are not stored in localStorage.

Tickets use Django page-number pagination (`count`, `next`, `previous`, and `results`). Previous/Next loads one page at a time. Status, priority, and creator filters are sent to Django and reset the list to page 1. Search and the status summary apply only to the current page and are labeled accordingly. Refresh reloads the active page. Returning from ticket changes reloads the page so totals and filtered results stay accurate. Deleting the last ticket on a page returns to the preceding page. Detail views fetch the latest ticket. Save and delete controls wait for successful API responses; failed saves preserve the form. Registration displays backend validation errors and returns to sign-in after success.

## Code map

- `src/api.js`: small shared request helper and named API calls.
- `src/App.jsx`: session restoration, login state, and logout.
- `src/components/Auth.jsx`: login and registration forms.
- `src/components/Workspace.jsx`: loading tickets and coordinating API operations.
- `src/components/TicketList.jsx`: summary, search, filters, and ticket table.
- `src/components/TicketDetail.jsx`: ticket information and delete confirmation.
- `src/components/TicketForm.jsx`: shared create/edit form.
- `src/components/AdminControls.jsx`: status and assignment controls.
- `src/components/Badge.jsx`: status and priority labels with icons.
- `src/ticketUtils.js`: label constants and date formatting, no sample data.
- `src/styles.css`: responsive styling.

## Checks

```sh
npm run lint
npm run build
npm run preview
```

Backend test files are retained as empty placeholders for now.

For deployment, serve the frontend and `/api` on the same origin through your web server. Vite's development proxy is not a production server. Configure Django's deployment settings and exact trusted origins for your deployment.
