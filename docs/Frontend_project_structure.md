# Project Structure

```
project-root/
├── public/                      # Static assets (served directly)
│   ├── favicon.svg
│   └── icons.svg
│
├── src/                         # Application source code
│   ├── app/                     # App bootstrap layer
│   │   ├── providers.tsx        #   Global providers wrapper
│   │   ├── query-client.ts      #   React Query client config
│   │   └── router.tsx           #   Route definitions
│   │
│   ├── components/              # Shared/reusable components
│   │   ├── layout/              #   Layout components (shells, wrappers)
│   │   │   └── AppLayout.tsx
│   │   └── ui/                  #   Primitive UI components (atoms)
│   │       ├── Button.tsx
│   │       ├── Button.test.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       └── Spinner.tsx
│   │
│   ├── config/                  # App configuration
│   │   └── env.ts               #   Environment variables
│   │
│   ├── features/                # Feature modules (feature-based grouping)
│   │   ├── auth/                #   Feature: Authentication
│   │   │   ├── auth.api.ts      #     API calls
│   │   │   ├── auth.store.ts    #     State management (Zustand)
│   │   │   ├── auth.types.ts    #     TypeScript types
│   │   │   ├── LoginPage.tsx    #     Page component
│   │   │   └── ProtectedRoute.tsx
│   │   └── users/               #   Feature: User management
│   │       ├── users.api.ts
│   │       ├── users.queries.ts #     React Query hooks
│   │       ├── users.types.ts
│   │       ├── UsersListPage.tsx
│   │       └── UserFormDialog.tsx
│   │
│   ├── hooks/                   # Shared custom React hooks
│   │   └── useDebounce.ts
│   │
│   ├── lib/                     # Core utilities & 3rd-party integrations
│   │   ├── api/                 #   HTTP client layer
│   │   │   ├── http.ts          #     Axios instance / interceptors
│   │   │   └── token-storage.ts
│   │   └── i18n/                #   Internationalization
│   │       ├── index.ts
│   │       └── locales/
│   │           ├── en.json
│   │           └── vi.json
│   │
│   ├── pages/                   # Top-level route pages (thin wrappers)
│   │   ├── HomePage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── test/                    # Test infrastructure
│   │   └── setup.ts
│   │
│   ├── index.css                # Global styles (Tailwind imports)
│   ├── main.tsx                 # App entry point
│   └── vite-env.d.ts            # Vite type declarations
│
├── .editorconfig
├── .env                         # Local env vars (git-ignored)
├── .env.example                 # Env var template
├── .env.production              # Production env vars
├── .gitignore
├── .oxlintrc.json               # Linter config
├── .prettierrc.json             # Formatter config
├── .dockerignore
├── Dockerfile
├── nginx.conf                   # Nginx config for production deploy
├── index.html                   # Vite HTML entry
├── package.json
├── tsconfig.json                # Root TS config (references)
├── tsconfig.app.json            # App TS config
├── tsconfig.node.json           # Node/scripts TS config
└── vite.config.ts               # Vite config
```

## Technology Stack

| Category              | Technology                                      |
| --------------------- | ----------------------------------------------- |
| **Framework**         | React 19 + TypeScript 6                         |
| **Build tool**        | Vite 8                                          |
| **Routing**           | React Router v7                                 |
| **State management**  | Zustand 5 (client state)                        |
| **Server state**      | TanStack React Query 5                          |
| **HTTP client**       | Axios                                           |
| **Styling**           | Tailwind CSS 4                                  |
| **i18n**              | i18next + react-i18next                         |
| **Linter**            | Oxlint                                          |
| **Formatter**         | Prettier + prettier-plugin-tailwindcss          |
| **Testing**           | Vitest + Testing Library + jsdom                |
| **Containerization**  | Docker + Nginx                                  |
| **Environment**       | `.env` / `.env.production` via Vite             |

## Layered Architecture

| Layer        | Folder(s)              | Responsibility                                    |
| ------------ | ---------------------- | ------------------------------------------------- |
| **Bootstrap** | `src/app/`             | Providers, router, QueryClient setup              |
| **UI Primitives** | `src/components/ui/`   | Atom components (Button, Input, Card, Spinner)    |
| **Layout**   | `src/components/layout/`| Page shell / layout wrappers                     |
| **Features** | `src/features/*/`      | Feature modules: API, types, store, queries, pages|
| **Pages**    | `src/pages/`           | Thin page components (compose features)           |
| **Hooks**    | `src/hooks/`           | Shared custom React hooks                         |
| **Lib**      | `src/lib/`             | HTTP client, i18n, and other core utilities       |
| **Config**   | `src/config/`          | Environment variable access                       |

## Naming Conventions

- **Files**: `kebab-case.ts` for utilities, `PascalCase.tsx` for components
- **Feature files**: `feature-name.type.ts`, `feature-name.api.ts`, `feature-name.store.ts`
- **Tests**: Co-located next to source file: `Component.test.tsx`
- **Folders**: `kebab-case/` for directories

## Conventions per Layer

### Feature module `src/features/<name>/`
```
<name>.types.ts      – TypeScript interfaces & enums
<name>.api.ts        – API request functions
<name>.store.ts      – Zustand store (if stateful)
<name>.queries.ts    – React Query hooks (useQuery, useMutation)
<PageName>.tsx       – Feature page component
```

### UI components `src/components/ui/`
- One component per file
- File name matches component name: `Button.tsx` → `Button`
- Test file co-located: `Button.test.tsx`
- Accept `className` prop for Tailwind composition via `clsx`

### API layer `src/lib/api/`
- `http.ts`: Axios instance with base URL, interceptors, token injection
- `token-storage.ts`: Read/write access token (localStorage abstraction)
- Feature APIs call `http` instance, never raw Axios
