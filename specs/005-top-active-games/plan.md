# Implementation Plan: TOP Active Games Display

**Branch**: `005-top-active-games` | **Date**: 2025-11-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-top-active-games/spec.md`

## Summary

Implement a TOP page (/) that displays a list of currently active games (出題中 status) with essential information including title, creation time, and player count. Users can click on any game to navigate to its detail page. The list should auto-refresh every 30 seconds to show the most current state.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode) / Node.js 20
**Primary Dependencies**: Next.js 16.0.1, React 19.2.0, Prisma 6.19.0, Tailwind CSS v4
**Storage**: SQLite via Prisma (existing database at `prisma/dev.db`)
**Testing**: Vitest 4.0.7 (unit/integration), Playwright 1.56.1 (E2E)
**Target Platform**: Web browser (responsive design)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Page load within 2 seconds, support 100 concurrent active games
**Constraints**: Auto-refresh within 30 seconds, no authentication required for viewing
**Scale/Scope**: Display up to 100 active games with pagination/scrolling

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Clean Architecture**: Will follow existing patterns with repository layer for data access
✅ **Component Architecture**: Page component in pages layer, domain components for game list items, UI components for reusable elements
✅ **Custom Hooks Architecture**: Will implement hooks for data fetching and auto-refresh logic
✅ **Test-Driven Development**: Tests will be written first for all components and hooks
✅ **Type Safety**: Full TypeScript with strict mode, DTOs for API responses
✅ **Documentation Standards**: References requirements from spec.md
✅ **Server Components First**: Will use Server Components for initial data fetch, Client Components only for interactivity

## Project Structure

### Documentation (this feature)

```text
specs/005-top-active-games/
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0: Technical decisions and patterns
├── data-model.md        # Phase 1: Entity definitions and relationships
├── quickstart.md        # Phase 1: Quick implementation guide
├── contracts/           # Phase 1: API contracts
│   └── active-games-api.yaml
└── tasks.md             # Phase 2: Prioritized implementation tasks
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── page.tsx                          # TOP page (Server Component)
│   └── actions/
│       └── games.ts                       # Server actions for game queries
├── components/
│   ├── pages/
│   │   └── TopPage/
│   │       ├── index.tsx                 # Page component
│   │       ├── TopPage.types.ts          # Type definitions
│   │       ├── TopPage.test.tsx          # Component tests
│   │       └── hooks/
│   │           └── useActiveGames.ts     # Auto-refresh logic (Client)
│   ├── domain/
│   │   └── game/
│   │       ├── ActiveGameCard.tsx        # Game list item display
│   │       └── ActiveGamesList.tsx       # Games list container
│   └── ui/
│       └── EmptyState.tsx                # Reusable empty state component
├── server/
│   ├── application/
│   │   └── use-cases/
│   │       └── games/
│   │           └── GetActiveGames.ts     # Use case for fetching active games
│   └── domain/
│       └── repositories/
│           └── GameRepository.ts         # Repository interface (existing)
└── types/
    └── game.ts                            # Shared type definitions

tests/
├── integration/
│   └── active-games.test.ts              # API integration tests
├── e2e/
│   └── top-page.spec.ts                  # E2E tests for TOP page
└── unit/
    └── use-cases/
        └── GetActiveGames.test.ts        # Use case unit tests
```

**Structure Decision**: Using existing Next.js App Router structure with clean separation between Server Components (initial data fetch) and Client Components (auto-refresh functionality). The TOP page will be modified from its current state to show only active games instead of all available games.

## Complexity Tracking

No constitution violations requiring justification.