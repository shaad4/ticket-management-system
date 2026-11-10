# Ticket Desk frontend

A small React + Vite + Tailwind frontend for the Django ticket management assignment. Lucide supplies the icons. No API client, router, or state library is needed for this demo.

## Run

Requires Node.js 20.19+ or 22.12+ (verified with Node 24).

```sh
cd frontend
npm ci
npm run dev
```

Open the local URL printed by Vite. Use **Try user demo** for Alex's tickets or **Try admin demo** for all tickets. Sign out to switch roles. Changes remain available when switching roles until the page reloads.

```sh
npm run lint
npm run build
npm run preview
```

## Demo behavior

- Login accepts any valid email and password of at least eight characters and opens the Alex demo account. No credentials are verified or stored.
- Registration checks the name, email, password length, and password confirmation, then opens a new local session with an empty dashboard. It does not create a persistent account.
- Users see their own tickets and can create, view, edit, and delete them. Deletion asks for confirmation.
- Admins see all tickets, filter by creator, and change status or assignment in ticket details. Admins can also create, edit, and delete tickets.
- Search and status/priority filters work together. Summary counts describe the whole visible workspace, independent of filters.
- Everything lives in React state. Reloading resets all changes. There are no backend requests, cookies, tokens, or browser storage.
- Role restrictions are demo UI behavior, not security enforcement. Real authorization belongs in Django when integration is added.

## Code map

- `src/App.jsx`: local session and shared ticket state.
- `src/data.js`: mock people/tickets and display helpers; field names match Django.
- `src/components/Auth.jsx`: login, registration, and demo entry points.
- `src/components/Workspace.jsx`: dashboard, filters, ticket details, and local CRUD.
- `src/components/TicketForm.jsx`: shared create/edit form.
- `src/components/AdminControls.jsx`: status and assignment controls.
- `src/components/Badge.jsx`: compact status/priority labels with icons.
- `src/styles.css`: restrained responsive styling alongside Tailwind's reset/utilities.

The screens use component state rather than URL routing to keep this machine task easy to explain. A later backend phase can replace state updates with Django requests and add actual authentication, CSRF handling, loading/error states, and persistent sessions. No backend files were changed.
