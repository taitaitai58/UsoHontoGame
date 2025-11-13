# Implementation Plan: Game Preparation for Moderators

**Branch**: `002-game-preparation` | **Date**: 2025-11-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-game-preparation/spec.md`

## Summary

This feature enables moderators to create and manage games for the UsoHontoGame (Two Truths and a Lie) platform. Moderators can create games with custom names and player limits, add presenters with their three episodes (marking one as a lie), manage game status through three phases (準備中/出題中/締切), and perform full CRUD operations on games. The feature includes the ability to set game names and configure presenters/episodes during the initial game creation flow, streamlining the game setup process.

The implementation follows Clean Architecture with React Server Components, uses SQLite for persistence via Prisma, and leverages Next.js 16 App Router with Server Actions for mutations.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)
**Primary Dependencies**: Next.js 16.0.1, React 19.2.0, Prisma 6.19.0, Zod 4.1.12
**Storage**: SQLite via Prisma (existing database at `prisma/dev.db`)
**Testing**: Vitest 4.0.7 (unit), Playwright 1.56.1 (E2E), React Testing Library (component)
**Target Platform**: Web application (Next.js App Router)
**Project Type**: Web (Next.js monorepo with frontend/backend unified)
**Performance Goals**:
- Game creation < 2 seconds
- Game list load < 1 second for 50 games
- Status transitions reflect on TOP page within 2 seconds
**Constraints**:
- Player limit: 1-100 per game
- Presenters: 1-10 per game
- Episodes: exactly 3 per presenter
- Game name: max 100 characters (optional)
- Episode text: max 1000 characters
**Scale/Scope**: MVP supporting up to 50 games per moderator, 100 players per game

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

✅ **I. Clean Architecture (NON-NEGOTIABLE)**
- Domain Layer: Game, Presenter, Episode entities with value objects
- Application Layer: CreateGame, UpdateGame, DeleteGame, AddPresenter use cases
- Infrastructure Layer: PrismaGameRepository, PrismaPresenterRepository
- Presentation Layer: Server Actions in `app/actions/game.ts`, page components

✅ **II. Component Architecture (NON-NEGOTIABLE)**
- Pages Layer: GameListPage, GameCreatePage, GameEditPage
- Domain Layer: GameForm, GameCard, PresenterList, EpisodeInput components
- UI Layer: Button, Input, Select, Modal (existing reusable components)

✅ **III. Custom Hooks Architecture (NON-NEGOTIABLE)**
- `useGameForm`: Form state and validation for game creation/editing
- `usePresenterManager`: Managing presenters and episodes during creation
- `useGameList`: Game list state and filtering
- All logic extracted from components into testable hooks

✅ **IV. Test-Driven Development (NON-NEGOTIABLE)**
- Unit tests for all use cases, entities, value objects
- Integration tests for Server Actions and repository operations
- Component tests for all UI components with hooks
- E2E tests for complete user flows (create, edit, delete)

✅ **V. Type Safety (NON-NEGOTIABLE)**
- All functions explicitly typed
- DTOs defined for all Server Actions (CreateGameDTO, UpdateGameDTO, etc.)
- Zod schemas for runtime validation
- No `any` types

✅ **VI. Documentation Standards**
- Feature spec in `specs/002-game-preparation/spec.md`
- Implementation plan in `specs/002-game-preparation/plan.md`
- Tasks in `specs/002-game-preparation/tasks.md`
- User stories with acceptance criteria in Given-When-Then format

✅ **VII. Server Components First**
- GameListPage, GameCreatePage, GameEditPage: Server Components for data fetching
- GameForm, PresenterManager: Client Components for interactivity
- Clear `"use client"` boundaries

### Technology Stack Compliance

✅ **Frontend Stack**
- Next.js 16 App Router: Using existing setup
- React 19: Using existing setup
- TypeScript 5 strict: Enabled in tsconfig.json
- Tailwind CSS v4: Using existing setup
- Biome: Using existing setup

✅ **Backend Stack**
- Server Actions: For all mutations (create/update/delete)
- Clean Architecture: Following existing patterns in `src/server/`
- Repository Pattern: Extending existing PrismaGameRepository
- Use Case Pattern: Following existing CreateGameUseCase pattern

✅ **Testing Stack**
- Vitest: Using existing setup
- React Testing Library: Using existing setup
- Playwright: Using existing setup
- TDD: Red-Green-Refactor cycle

**GATE RESULT**: ✅ **PASS** - All constitution checks satisfied, no violations to justify

## Project Structure

### Documentation (this feature)

```text
specs/002-game-preparation/
├── spec.md              # Feature specification (user stories, requirements)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (technical research)
├── data-model.md        # Phase 1 output (entities, relationships)
├── quickstart.md        # Phase 1 output (developer guide)
├── contracts/           # Phase 1 output (API contracts)
│   ├── game-actions.yaml    # Server Actions contracts
│   └── domain-schemas.yaml  # Domain entity schemas
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/                          # Next.js App Router (Presentation Layer)
│   ├── actions/                  # Server Actions
│   │   └── game.ts              # Game-related mutations (create, update, delete, status)
│   └── games/                    # Game pages
│       ├── page.tsx             # Game list page (Server Component)
│       ├── create/
│       │   └── page.tsx         # Game creation page (Server Component wrapper)
│       └── [id]/
│           ├── page.tsx         # Game detail/edit page (Server Component wrapper)
│           └── edit/
│               └── page.tsx     # Game edit page (Server Component wrapper)
├── components/
│   ├── pages/                    # Page-level components
│   │   ├── GameListPage/
│   │   │   ├── GameListPage.tsx
│   │   │   └── hooks/
│   │   │       └── useGameList.ts
│   │   ├── GameCreatePage/
│   │   │   ├── GameCreatePage.tsx
│   │   │   └── hooks/
│   │   │       ├── useGameForm.ts
│   │   │       └── usePresenterManager.ts
│   │   └── GameEditPage/
│   │       ├── GameEditPage.tsx
│   │       └── hooks/
│   │           ├── useGameForm.ts
│   │           └── usePresenterManager.ts
│   ├── domain/                   # Domain-specific components
│   │   └── game/
│   │       ├── GameCard/
│   │       │   ├── GameCard.tsx
│   │       │   └── hooks/
│   │       │       └── useGameCard.ts
│   │       ├── GameForm/
│   │       │   ├── GameForm.tsx
│   │       │   └── hooks/
│   │       │       └── useGameFormValidation.ts
│   │       ├── PresenterList/
│   │       │   ├── PresenterList.tsx
│   │       │   └── hooks/
│   │       │       └── usePresenterList.ts
│   │       ├── PresenterManager/
│   │       │   ├── PresenterManager.tsx
│   │       │   └── hooks/
│   │       │       └── usePresenterManager.ts
│   │       └── EpisodeInput/
│   │           ├── EpisodeInput.tsx
│   │           └── hooks/
│   │               └── useEpisodeInput.ts
│   └── ui/                       # Reusable UI components (existing)
│       ├── Button/
│       ├── Input/
│       ├── Select/
│       ├── Modal/
│       └── Card/
├── server/                       # Backend (Clean Architecture)
│   ├── domain/                   # Domain Layer
│   │   ├── entities/
│   │   │   ├── Game.ts          # Existing - extend with name field
│   │   │   ├── Presenter.ts     # New entity
│   │   │   └── Episode.ts       # New entity
│   │   ├── value-objects/
│   │   │   ├── GameId.ts        # Existing
│   │   │   ├── PlayerId.ts      # Existing
│   │   │   ├── GameName.ts      # New - validates game name (optional, max 100 chars)
│   │   │   ├── PresenterId.ts   # New
│   │   │   ├── EpisodeId.ts     # New
│   │   │   ├── EpisodeText.ts   # New - validates episode text (max 1000 chars)
│   │   │   └── GameStatus.ts    # Existing - extend with 準備中/出題中/締切
│   │   ├── repositories/         # Repository interfaces
│   │   │   ├── GameRepository.ts     # Existing - extend with new methods
│   │   │   ├── PresenterRepository.ts # New interface
│   │   │   └── EpisodeRepository.ts   # New interface
│   │   ├── errors/
│   │   │   ├── GameNotFoundError.ts   # Existing
│   │   │   ├── PresenterLimitError.ts # New
│   │   │   ├── EpisodeLimitError.ts   # New
│   │   │   └── InvalidStatusTransitionError.ts # New
│   │   └── schemas/              # Zod validation schemas
│   │       ├── gameSchemas.ts   # Existing - extend
│   │       ├── presenterSchemas.ts # New
│   │       └── episodeSchemas.ts   # New
│   ├── application/              # Application Layer
│   │   ├── use-cases/
│   │   │   ├── games/
│   │   │   │   ├── CreateGame.ts      # Existing - extend with name, presenters
│   │   │   │   ├── UpdateGame.ts      # New
│   │   │   │   ├── DeleteGame.ts      # New
│   │   │   │   ├── ListGames.ts       # New
│   │   │   │   ├── GetGame.ts         # New
│   │   │   │   └── ChangeGameStatus.ts # New
│   │   │   └── presenters/
│   │   │       ├── AddPresenter.ts    # New
│   │   │       ├── RemovePresenter.ts # New
│   │   │       └── UpdatePresenterEpisodes.ts # New
│   │   └── dto/
│   │       ├── requests/
│   │       │   ├── CreateGameRequest.ts     # Extend with name, presenters
│   │       │   ├── UpdateGameRequest.ts     # New
│   │       │   ├── AddPresenterRequest.ts   # New
│   │       │   └── ChangeStatusRequest.ts   # New
│   │       └── responses/
│   │           ├── GameResponse.ts          # Extend with presenters
│   │           ├── PresenterResponse.ts     # New
│   │           └── EpisodeResponse.ts       # New
│   └── infrastructure/           # Infrastructure Layer
│       └── repositories/
│           ├── PrismaGameRepository.ts      # Existing - extend
│           ├── PrismaPresenterRepository.ts # New
│           └── PrismaEpisodeRepository.ts   # New
├── hooks/                        # Shared custom hooks
│   └── useSession.ts            # Existing - for creator ID
└── types/                        # TypeScript type definitions
    ├── game.ts                  # Extend with name, presenters
    ├── presenter.ts             # New
    └── episode.ts               # New

prisma/
├── schema.prisma                # Extend Game, add Presenter, Episode models
├── migrations/                  # New migration for presenters/episodes
└── dev.db                       # Existing SQLite database

tests/
├── unit/
│   ├── entities/
│   │   ├── Game.test.ts        # Extend with name tests
│   │   ├── Presenter.test.ts   # New
│   │   └── Episode.test.ts     # New
│   ├── value-objects/
│   │   ├── GameName.test.ts    # New
│   │   └── EpisodeText.test.ts # New
│   ├── use-cases/
│   │   ├── CreateGame.test.ts  # Extend with name, presenters
│   │   ├── UpdateGame.test.ts  # New
│   │   ├── DeleteGame.test.ts  # New
│   │   └── AddPresenter.test.ts # New
│   └── hooks/
│       ├── useGameForm.test.ts
│       └── usePresenterManager.test.ts
├── integration/
│   ├── api/
│   │   └── game-actions.test.ts # Test Server Actions
│   └── repositories/
│       ├── PrismaGameRepository.test.ts
│       └── PrismaPresenterRepository.test.ts
├── component/
│   ├── pages/
│   │   ├── GameListPage.test.tsx
│   │   ├── GameCreatePage.test.tsx
│   │   └── GameEditPage.test.tsx
│   └── domain/
│       ├── GameForm.test.tsx
│       ├── PresenterManager.test.tsx
│       └── GameCard.test.tsx
└── e2e/
    ├── game-creation.spec.ts
    ├── game-edit.spec.ts
    ├── game-deletion.spec.ts
    └── game-status-transition.spec.ts
```

**Structure Decision**: This is a web application using Next.js 16 App Router with unified frontend/backend. The structure follows Clean Architecture with clear layer separation in the `src/server/` directory. Components follow the three-layer hierarchy (pages/domain/ui), and all component logic is extracted into custom hooks. The existing codebase already has session management (001-session-top-page) and basic game creation, which this feature extends with presenters, episodes, game names, and full CRUD operations.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All implementation follows constitution principles without exceptions.
