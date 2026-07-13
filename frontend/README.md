# Valentein Chocolate — frontend

Internal employee and inventory management frontend for Valentein
Chocolate, a chocolate manufacturing company. React + TypeScript + Vite + Tailwind CSS.

## Run

```sh
cd frontend
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # type-check + production build
```

Sign in with the demo account `mvandenberg` / `Truffle!2026` (see
`src/data/mock.ts` for all mock users).

## Structure

- `src/pages/` — Login, Dashboard, Employees, Stock, Orders, Customers, CustomerDetail
- `src/components/` — Layout (sidebar), DataTable (sortable), SearchableSelect,
  ErrorBoundary, ui (buttons, form fields, side panel, confirm dialog, status badge, empty state)
- `src/store.tsx` — in-memory data store with CRUD, seeded from `src/data/mock.ts`
- `src/types.ts` — entity types and the low-stock threshold

All data is mock/in-memory; there is no backend integration yet. See
[`../BACKEND-TODO.md`](../BACKEND-TODO.md) for the API contract — swapping
the store's state setters for API calls is the only material change needed.
