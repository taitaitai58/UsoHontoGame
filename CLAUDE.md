# UsoHontoGame Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-11

## Active Technologies
- TypeScript 5 (strict mode) + Next.js 16.0.1, React 19.2.0, Prisma 6.19.0, Zod 4.1.12 (002-game-preparation)
- SQLite via Prisma (existing database at `prisma/dev.db`) (002-game-preparation)

**Language & Framework**:
- TypeScript 5 with strict mode enabled
- Next.js 16.0.1 (App Router)
- React 19.2.0

**Styling**:
- Tailwind CSS v4

**Database & Persistence**:
- SQLite (file-based database via Prisma)
- Prisma 6.19.0 (ORM)
- Database location: `prisma/dev.db`

**Validation & ID Generation**:
- Zod 4.1.12 (runtime validation)
- nanoid 5.1.6 (ID generation)

**Testing**:
- Vitest 4.0.7 (unit & integration tests)
- Playwright 1.56.1 (E2E tests)
- Testing Library (React component testing)

**Code Quality**:
- Biome 2.3.4 (linting & formatting)
- ESLint 9 (additional linting)

## Architecture

**Clean Architecture with Domain-Driven Design**:
- Domain Layer: Entities, Value Objects, Repositories (interfaces)
- Application Layer: Use Cases, DTOs
- Infrastructure Layer: Prisma repositories, API routes
- Presentation Layer: Next.js pages, React components

**Key Patterns**:
- Repository Pattern (with SQLite/Prisma implementation)
- Server Actions (Next.js 16)
- Cookie-based session management

## Project Structure

```text
src/
├── app/                          # Next.js App Router pages
│   ├── actions/                  # Server Actions
│   └── games/                    # Game-related pages
├── components/
│   ├── domain/                   # Domain-specific components
│   │   ├── game/                 # Game management components
│   │   └── session/              # Session components
│   ├── pages/                    # Page-level components (with co-located tests)
│   │   └── MyPage/
│   │       ├── index.tsx         # Component implementation
│   │       ├── MyPage.test.tsx   # Unit tests
│   │       └── hooks/            # Component-specific hooks
│   └── ui/                       # Reusable UI components
├── hooks/                        # React custom hooks
├── lib/                          # Utility functions
├── server/
│   ├── application/              # Use Cases & DTOs (with co-located tests)
│   │   ├── dto/
│   │   └── use-cases/
│   │       ├── session/
│   │       │   ├── CreateSession.ts
│   │       │   ├── CreateSession.test.ts    # Co-located tests
│   │       │   └── ...
│   │       └── games/
│   │           ├── CreateGame.ts
│   │           ├── CreateGame.test.ts       # Co-located tests
│   │           └── ...
│   ├── domain/                   # Domain entities & logic (with co-located tests)
│   │   ├── entities/
│   │   │   ├── Game.ts
│   │   │   ├── Game.test.ts                # Co-located tests
│   │   │   └── ...
│   │   ├── value-objects/
│   │   │   ├── GameId.ts
│   │   │   ├── GameId.test.ts              # Co-located tests
│   │   │   └── ...
│   │   ├── schemas/
│   │   │   ├── gameSchemas.ts
│   │   │   ├── gameSchemas.test.ts         # Co-located tests
│   │   │   └── ...
│   │   ├── errors/
│   │   └── repositories/
│   └── infrastructure/           # External interfaces
│       └── repositories/
├── generated/                    # Generated Prisma Client
└── types/                        # TypeScript type definitions

tests/
├── e2e/                          # Playwright E2E tests
├── integration/                  # Integration tests
└── utils/                        # Test utilities (mocks, helpers)

prisma/
├── schema.prisma                 # Database schema
├── migrations/                   # Database migrations
└── dev.db                        # SQLite database file
```

## Commands

**Development**:
```bash
npm run dev          # Start development server
npm run build        # Build production bundle
npm start            # Start production server
```

**Database**:
```bash
npx prisma migrate dev     # Run migrations (development)
npx prisma studio          # Open Prisma Studio (DB GUI)
npx prisma generate        # Generate Prisma Client
```

**Testing**:
```bash
npm test                   # Run unit tests (Vitest)
npm run test:ui            # Run tests with UI
npm run test:coverage      # Run tests with coverage report
npm run test:e2e           # Run E2E tests (Playwright)
npm run test:e2e:ui        # Run E2E tests with UI
npm run test:e2e:debug     # Debug E2E tests
```

**Test Organization**:
- **All Unit Tests**: Co-located with their implementation files using `.test.ts` or `.test.tsx` extension
  - Component tests: `src/components/pages/MyPage/MyPage.test.tsx`
  - Domain entity tests: `src/server/domain/entities/Game.test.ts`
  - Value object tests: `src/server/domain/value-objects/GameId.test.ts`
  - Schema tests: `src/server/domain/schemas/gameSchemas.test.ts`
  - Use case tests: `src/server/application/use-cases/games/CreateGame.test.ts`
- **E2E Tests**: `tests/e2e/` directory (Playwright)
- **Integration Tests**: `tests/integration/` directory
- **Test Utilities**: `tests/utils/` for shared mocks and helpers

**Code Quality**:
```bash
npm run lint               # Lint with ESLint
npm run lint:biome         # Lint with Biome
npm run format             # Format with Biome
npm run format:check       # Check formatting
npm run check              # Lint and format with Biome
```

## Code Style

- TypeScript strict mode enabled
- Follow Clean Architecture principles
- Use domain-driven design patterns
- Server-side rendering by default (Next.js App Router)
- Use Server Actions for mutations
- Zod schemas for runtime validation at API boundaries
- Repository pattern for data access

## Component Separation Pattern

**App Router Pages** (`src/app/`)：
- **Thin wrappers** (10-30 lines)
- Responsibilities:
  - Extract route params
  - Data fetching (Server Components only)
  - Session/auth checks
  - Delegate to page components
- Example:
  ```typescript
  export default async function Page({ params }: PageProps) {
    const { id } = await params;
    const data = await fetchData(id);
    return <MyPageComponent data={data} />;
  }
  ```

**Page Components** (`src/components/pages/`):
- **Pure presentational** components
- Structure:
  ```
  src/components/pages/MyPage/
  ├── index.tsx                    # Presentational component
  ├── MyPage.types.ts              # Type definitions
  ├── MyPage.test.tsx              # Unit tests (co-located)
  └── hooks/                       # Custom hooks (Client Components only)
      └── useMyPage.ts
  ```
- Responsibilities:
  - Layout and UI composition
  - Domain/UI component orchestration
  - Call custom hooks for business logic
  - No direct data fetching or state logic
- Testing:
  - Unit tests are co-located with components
  - Test files use `.test.tsx` extension
  - Vitest + React Testing Library for component testing

**Custom Hooks** (`components/pages/*/hooks/`):
- **Business logic encapsulation**
- For Client Components only
- Located within component directory
- Responsibilities:
  - State management
  - Data fetching/mutations
  - Event handlers
  - Side effects

**Pattern Examples**:

1. **Client Component** (213 → 22 lines):
   - Before: `/app/games/[id]/presenters/page.tsx` (logic + UI mixed)
   - After:
     - `/app/games/[id]/presenters/page.tsx` (22 lines - wrapper)
     - `/components/pages/PresenterManagementPage/index.tsx` (UI)
     - `/components/pages/PresenterManagementPage/hooks/usePresenterManagementPage.ts` (logic)

2. **Server Component** (150 → 44 lines):
   - Before: `/app/games/[id]/page.tsx` (data fetch + UI mixed)
   - After:
     - `/app/games/[id]/page.tsx` (44 lines - data fetch + wrapper)
     - `/components/pages/GameDetailPage/index.tsx` (UI only)

**Benefits**:
- ✅ Clear separation of concerns
- ✅ Improved testability
- ✅ Better reusability
- ✅ Easier maintenance
- ✅ Follows architecture.md patterns

## Database

**Connection**:
- Default: SQLite file-based database
- Location: `prisma/dev.db`
- Connection string: `file:./dev.db` (relative to prisma directory)

**Repository Pattern**:
- Default: PrismaGameRepository (SQLite)
- Fallback: InMemoryGameRepository (for testing)
- Configuration: Set `REPOSITORY_TYPE=memory` to use in-memory storage

## Features Implemented

1. **Session Management** (001-session-top-page)
   - Cookie-based session storage
   - Nickname registration
   - Session persistence

2. **Game Preparation** (002-game-preparation)
   - Create games with player limits (1-100)
   - View game list (moderator view)
   - Edit game settings (preparation status only)
   - Delete games with cascade deletion
   - SQLite persistence with Prisma
   - Game status management (準備中/出題中/締切)

## Recent Changes
- 002-game-preparation: Added TypeScript 5 (strict mode) + Next.js 16.0.1, React 19.2.0, Prisma 6.19.0, Zod 4.1.12

- 2025-11-11: Migrated from in-memory to SQLite persistence
  - Added Prisma ORM integration
  - Database schema with migrations
  - Repository pattern with SQLite implementation
- 2025-11-10: Completed game preparation feature
  - Game CRUD operations
  - Status management
  - Authorization checks
  - Next.js 16 with App Router
  - Clean Architecture structure
  - Session management


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
