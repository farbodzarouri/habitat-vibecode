# Backend TODO — Valentein Chocolate internal tool

The frontend is complete and runs entirely on an in-memory mock store.
Everything the backend must provide is already modeled in the frontend —
use these two files as the contract:

- [`src/types.ts`](src/types.ts) — entity shapes the UI expects
- [`src/store.tsx`](src/store.tsx) — the CRUD operations to replace with API calls
- [`src/data/mock.ts`](src/data/mock.ts) — realistic sample data (useful as seed data)

## 1. Database schema

Five tables, matching `src/types.ts`:

| Table | Columns | Notes |
|---|---|---|
| `admins` | id, username, password, email, phone_number, role | username and email UNIQUE; password stored as **hash** (bcrypt/argon2), never plaintext; role ∈ Admin / Manager / Operator |
| `categories` | id, name | currently read-only in the UI (5 fixed categories) — CRUD optional |
| `stock` | id, name, amount, type, category_id → categories, code | code UNIQUE; amount ≥ 0 integer |
| `customers` | id, name, address | |
| `orders` | id, stock_id → stock, date, amount, customer_id → customers, admin_id → admins | amount > 0 integer |

Decisions needed:
- [ ] Delete behavior for referenced rows (customer/stock/admin with orders):
      restrict, cascade, or soft-delete? The UI currently allows the delete and
      shows "they have N orders" in the confirmation — pick one and we'll align the UI.
- [ ] Should placing an order decrement `stock.amount`? The UI does **not**
      assume this today, but it shows live quantity in the order form.

## 2. Auth

A login page already exists at [`src/pages/Login.tsx`](src/pages/Login.tsx):
username + password form, inline error on bad credentials, and a sign-out
button in the sidebar. It currently authenticates against the mock admin list
in `store.tsx` (`login()` / `logout()` there are the functions to rewire).

- [ ] `POST /auth/login` (username + password) issuing a session/JWT —
      on failure return 401; the UI shows "Incorrect username or password."
- [ ] `POST /auth/logout` (if session-based)
- [ ] `GET /me` — the frontend needs the logged-in admin to auto-fill
      `admin_id` on new orders and show "signed in as" in the sidebar;
      also needed to restore the session on page reload (the mock version
      forgets the login on refresh — a real token/cookie fixes this)
- [ ] Password hashing + verification
- [ ] Rate-limit / lockout on repeated failed logins
- [ ] Role checks if desired (e.g. only Admin manages employees) — the UI has
      roles but currently gates nothing on them
- [ ] Remove the demo-credentials hint from the login page once real auth lands

## 3. REST endpoints

Standard CRUD for each entity. The frontend performs these operations today
against local state:

- `GET/POST /admins`, `PUT/DELETE /admins/:id` — responses must **never**
  include the password/hash field, even though the frontend `Admin` type has
  one (it exists only for the mock login; the UI never displays it)
- `GET /categories`
- `GET/POST /stock`, `PUT/DELETE /stock/:id`
- `GET/POST /customers`, `PUT/DELETE /customers/:id`
- `GET/POST /orders`, `PUT/DELETE /orders/:id`

Query parameters worth supporting server-side (the UI filters client-side now,
fine for small data, but these become necessary as data grows):

- [ ] `GET /orders?customer_id=&date_from=&date_to=` (Orders page filters)
- [ ] `GET /orders?customer_id=` (customer detail page)
- [ ] `GET /stock?category_id=&type=&search=` (Stock page filters)
- [ ] Pagination on all list endpoints (the UI has no pager yet — tell us the
      response envelope you choose and we'll add one)

## 4. Server-side validation (mirror the client rules)

The frontend validates these but the server must enforce them — client
validation is UX, not security:

- [ ] Unique username, unique email (admins); unique code (stock)
- [ ] Email format; password strength (≥8 chars, mixed case, digit, symbol)
- [ ] Stock amount: integer ≥ 0 · Order amount: integer > 0
- [ ] Order references (stock_id, customer_id) must exist
- [ ] `admin_id` on order creation comes from the session, **not** the request body
- [ ] Return validation errors as field-keyed messages, e.g.
      `{ "errors": { "username": "This username is already taken." } }` —
      the forms already render per-field errors in exactly this shape

## 5. Dashboard aggregates

The dashboard computes these client-side from full lists; a single endpoint
would avoid shipping all rows:

- [ ] `GET /dashboard` → active employee count, low-stock items
      (amount < threshold, currently 25 — see `LOW_STOCK_THRESHOLD` in
      `src/types.ts`), orders today, orders this month, 8 most recent orders
- [ ] Decide where the low-stock threshold lives (global config vs. per-item
      column). Per-item was already flagged as a likely future need.

## 6. Ops

- [ ] Seed script from `src/data/mock.ts` (minus plaintext passwords)
- [ ] CORS for the Vite dev origin (http://localhost:5173) or serve the built
      `dist/` from the backend
- [ ] If serving `dist/`: SPA history fallback — unknown paths must return
      `index.html` (client-side routing handles them), or deep links like
      `/customers/3` will 404 on refresh
- [ ] Environment config for the frontend: we'll read the API base URL from
      `import.meta.env.VITE_API_URL` once endpoints exist

## Frontend integration point

When the API is ready, the only frontend file that changes materially is
[`src/store.tsx`](src/store.tsx): its `useState` + setter functions get
replaced by fetch calls (or React Query). Component code stays as-is because
everything consumes the store through the `useStore()` hook.
