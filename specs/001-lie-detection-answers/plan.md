# Implementation Plan: 嘘当て回答機能

**Branch**: `001-lie-detection-answers` | **Date**: 2025-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-lie-detection-answers/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement answer submission functionality for participants to guess which episodes are lies in published games. Participants select one lie episode per presenter, submit their answers, and the system tracks submissions with session-based identification, participant limits, and game status validation. Core features include answer overwrite capability (until deadline), strict game status enforcement, and presenter count validation.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)
**Primary Dependencies**: Next.js 16.0.1 (App Router), React 19.2.0, Prisma 6.19.0, Zod 4.1.12
**Storage**: SQLite via Prisma (file: `prisma/dev.db`)
**Testing**: Vitest 4.0.7 (unit/integration), Playwright 1.56.1 (E2E), React Testing Library
**Target Platform**: Web (Next.js SSR + Client Components)
**Project Type**: Web (Full-stack Next.js application)
**Performance Goals**: <200ms response time for answer submission, <100ms for game list retrieval
**Constraints**: Session-based authentication (cookies), no external auth provider, offline selection preservation (localStorage)
**Scale/Scope**: ~5-10 screens (TOP page, answer screen, error states), 10-100 concurrent participants per game

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

✅ **Clean Architecture**: Feature will follow established pattern with Use Cases, Repositories, Entities
- Answer submission use case in `src/server/application/use-cases/answers/`
- Answer repository interface in `src/server/domain/repositories/`
- Prisma implementation in `src/server/infrastructure/repositories/`

✅ **Component Architecture**: Three-layer hierarchy will be maintained
- Pages: AnswerSubmissionPage in `src/components/pages/`
- Domain: GameAnswerForm, PresenterEpisodeList in `src/components/domain/`
- UI: Existing primitives (Button, Input, EmptyState) reused

✅ **Custom Hooks Architecture**: All state and logic in hooks
- `useAnswerSubmission` for submission logic
- `useParticipantSession` for session management
- `useGameValidation` for status/presenter checks
- Co-located in component `hooks/` directories

✅ **Test-Driven Development**: TDD workflow required for all implementation
- Tests written first for use cases, hooks, components
- Integration tests for answer submission flow
- E2E tests for full participant journey

✅ **Type Safety**: TypeScript strict mode, explicit types
- Answer DTOs defined in `src/server/application/dto/`
- Zod schemas for runtime validation
- No `any` types unless documented

✅ **Documentation Standards**: Feature spec references requirements
- Spec includes prioritized user stories (P1-P3)
- Acceptance criteria in Given-When-Then format
- Traceability from requirements to implementation

✅ **Server Components First**: Appropriate use of Server vs Client Components
- Game list page: Server Component (data fetching)
- Answer submission page: Client Component (user interaction, form state)
- Session validation: Server-side in Server Actions

### Technology Standards Compliance

✅ **Frontend Stack**: Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, Biome
✅ **Backend Stack**: Next.js API Routes/Server Actions, Clean Architecture, Repository Pattern
✅ **Testing Stack**: Vitest, React Testing Library, TDD workflow

### Project Structure Compliance

✅ **Follows established structure**:
```
src/
├── app/                    # Next.js pages and Server Actions
├── components/             # Three-layer component architecture
├── server/                 # Clean Architecture backend
├── hooks/                  # Custom React hooks
└── types/                  # TypeScript definitions
```

### Gate Result: ✅ PASS

All constitution principles are satisfied. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-lie-detection-answers/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output - in progress)
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (to be generated)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/                          # Next.js App Router
│   ├── actions/
│   │   └── answers.ts            # Server Actions for answer submission
│   └── games/
│       └── [id]/
│           └── answer/
│               └── page.tsx      # Answer submission page (thin wrapper)
├── components/
│   ├── pages/
│   │   └── AnswerSubmissionPage/ # Main answer submission page component
│   │       ├── index.tsx
│   │       ├── AnswerSubmissionPage.types.ts
│   │       ├── AnswerSubmissionPage.test.tsx
│   │       └── hooks/
│   │           ├── useAnswerSubmission.ts
│   │           ├── useAnswerSubmission.test.ts
│   │           ├── useGameValidation.ts
│   │           └── useGameValidation.test.ts
│   ├── domain/
│   │   └── answer/               # Domain components for answer submission
│   │       ├── GameAnswerForm/
│   │       ├── PresenterEpisodeList/
│   │       └── EpisodeSelector/
│   └── ui/                       # Reuse existing primitives (Button, Input, EmptyState)
├── server/
│   ├── application/
│   │   ├── dto/
│   │   │   ├── requests/
│   │   │   │   └── SubmitAnswerRequest.ts
│   │   │   └── responses/
│   │   │       └── AnswerResponse.ts
│   │   └── use-cases/
│   │       └── answers/
│   │           ├── SubmitAnswer.ts
│   │           ├── SubmitAnswer.test.ts
│   │           ├── ValidateGameForAnswers.ts
│   │           ├── ValidateGameForAnswers.test.ts
│   │           └── GetGameForAnswers.ts
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Answer.ts
│   │   │   ├── Answer.test.ts
│   │   │   ├── Participation.ts
│   │   │   └── Participation.test.ts
│   │   ├── repositories/
│   │   │   ├── IAnswerRepository.ts
│   │   │   └── IParticipationRepository.ts
│   │   └── schemas/
│   │       ├── answerSchemas.ts
│   │       └── answerSchemas.test.ts
│   └── infrastructure/
│       └── repositories/
│           ├── PrismaAnswerRepository.ts
│           ├── PrismaAnswerRepository.test.ts
│           ├── PrismaParticipationRepository.ts
│           └── PrismaParticipationRepository.test.ts
├── hooks/                        # Shared hooks
│   ├── useParticipantSession.ts
│   └── useParticipantSession.test.ts
└── types/
    └── answer.ts                 # Shared type definitions

prisma/
└── schema.prisma                 # Add Answer and Participation models

tests/
├── e2e/
│   └── answer-submission.spec.ts # E2E test for full answer flow
├── integration/
│   └── answer-submission.test.ts # Integration test for answer use cases
└── utils/
    └── mockAnswerData.ts         # Test utilities for answer data
```

**Structure Decision**: Full-stack Next.js web application following Clean Architecture. Frontend uses three-layer component hierarchy (Pages/Domain/UI) with custom hooks for logic. Backend follows Domain/Application/Infrastructure layers with Repository pattern and Use Cases.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. All constitution principles satisfied.

## Post-Design Constitution Re-check

**Gate Result**: ✅ PASS (Re-evaluated after Phase 1 design)

All constitution principles remain satisfied after completing design artifacts:

✅ **Clean Architecture**: Design maintains strict layer separation
- Domain entities (Answer, Participation) defined with invariants
- Use cases encapsulate business logic
- Repositories provide clean abstraction
- Infrastructure implements via Prisma

✅ **Component Architecture**: Three-layer hierarchy maintained
- Page components: AnswerSubmissionPage
- Domain components: GameAnswerForm, PresenterEpisodeList, EpisodeSelector
- UI components: Reusing existing primitives

✅ **Custom Hooks**: Logic extracted to hooks
- useAnswerSubmission for form state and submission
- useGameValidation for access validation
- useParticipantSession for session management

✅ **Type Safety**: Full type coverage
- DTOs defined for all requests/responses
- Zod schemas for runtime validation
- TypeScript strict mode compliance

✅ **TDD**: Quickstart guide includes TDD workflow
- Tests first, implementation second
- Red-Green-Refactor cycle documented
- Test strategy defined for all layers

✅ **Documentation**: Comprehensive documentation generated
- research.md: Technical decisions
- data-model.md: Entity design
- contracts/: API contracts
- quickstart.md: Implementation guide

## Phase 0 & 1 Artifacts Generated

### Phase 0: Research ✅
- [research.md](./research.md) - All technical decisions documented

### Phase 1: Design ✅
- [data-model.md](./data-model.md) - Complete entity and schema design
- [contracts/README.md](./contracts/README.md) - API contract overview
- [contracts/submit-answer.md](./contracts/submit-answer.md) - Submit answer contract
- [contracts/get-game-for-answers.md](./contracts/get-game-for-answers.md) - Get game contract
- [contracts/validate-game-for-answers.md](./contracts/validate-game-for-answers.md) - Validate game contract
- [quickstart.md](./quickstart.md) - Developer implementation guide
- CLAUDE.md updated with new technologies

## Next Steps

**Planning Complete**: `/speckit.plan` workflow finished.

**Next Command**: `/speckit.tasks` to generate dependency-ordered implementation tasks.

This will create `tasks.md` with concrete, actionable tasks based on the design artifacts generated in this planning phase.
