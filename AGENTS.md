# AgriTrace Frontend

## Stack essentials

- React 18 + Vite 8 + TypeScript (strict). Entry: `src/main.tsx` → `src/app/providers.tsx`
- Routing: `react-router` v7 `createBrowserRouter` in `src/app/router.tsx` (NOT the legacy `BrowserRouter` in `src/App.tsx`)
- Server state: TanStack React Query 5. Client state: Zustand (auth). HTTP: Axios.
- Styling: Tailwind CSS v4 via `@tailwindcss/vite` Vite plugin. `@` import alias → `src/`.

## Commands

```bash
npm run dev          # Vite dev server
npm run build        # Vite production build
npm test             # vitest run --passWithNoTests
npm run generate-types  # openapi-typescript docs/swagger.yaml -> src/types/api.ts
```

CI (`.github/workflows/frontend-ci-cd.yml`): `npm install && npm test && npm run build` on push/PR to `main`.

## Mock system

Custom Axios interceptor-based (NOT MSW). Controlled by env vars:

```
VITE_ENABLE_MOCKS=true   # default: enabled
VITE_MOCK_<MODULE>=false  # disable per module (auth, batches, ...)
```

Mock adapter at `src/lib/api/mock-adapter.ts`. Routing table there maps URL patterns to handlers in `src/mocks/handlers/`. Specific routes must precede generic ones (e.g., split/merge before batches).

## Architecture conventions

- **Feature module** at `src/features/<name>/`: `<name>.types.ts`, `<name>.api.ts`, `<name>.queries.ts` (React Query hooks), `<PageName>.tsx`. Optionally `<name>.store.ts` (Zustand).
- **API calls** go through `src/lib/api/http.ts` helpers (`get`, `post`, `put`, `patch`, `del`). Never raw Axios.
- **Tests** co-located next to source: `Component.test.tsx`. Global setup: `src/test/setup.ts` (jest-dom import).
- **Atomic design**: `src/components/ui/` for primitives (one file per component, `className` prop for Tailwind composition via `clsx`), `src/components/layout/` for page shells.

## Environment

| Var | Default | Notes |
|-----|---------|-------|
| `VITE_API_BASE_URL` | `https://api.agritrace.vn/api/v1` | Copied from `.env.example` to `.env` |
| `VITE_ENABLE_MOCKS` | `true` | Set `false` to use real backend |

Auth token: localStorage key `agritrace_token`. Token refresh uses `/auth/refresh-token` with `withCredentials: true`. On refresh failure, redirects to `/login`.

## Routes

| Path | Component | Auth |
|------|-----------|------|
| `/login` | LoginPage | No (redirects to `/app/dashboard` if authed) |
| `/trace/:id` | PublicTracePage | No (public lot trace) |
| `/` | HomePage | No |
| `/app/*` | AppLayout → child routes | Yes (via ProtectedRoute in legacy, but new router uses layout pattern) |

`/app/` children: `dashboard`, `batches`, `batches/new`, `batches/:id`, `supply-chain`, `inspection`, `recall`, `reports`, `users`, `profile`, `products`, `products/:id`, `organizations`, `categories`.

## Generated code

`src/types/api.ts` is auto-generated from `docs/swagger.yaml` via `openapi-typescript`. Do not edit manually. Regenerate with `npm run generate-types`.
