# Implementation Plan: Game Status Transition

**Branch**: `004-status-transition` | **Date**: 2025-11-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-status-transition/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable game moderators to transition game status through three states (準備中→出題中→締切) with validation rules and UI feedback. The feature adds status transition buttons to the game detail page, validates presenter completeness before starting games, and requires confirmation for closing active games.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)  
**Primary Dependencies**: Next.js 16.0.1, React 19.2.0, Tailwind CSS v4, Zod 4.1.12  
**Storage**: SQLite via Prisma 6.19.0 (existing database at `prisma/dev.db`)  
**Testing**: Vitest 4.0.7, React Testing Library, Playwright 1.56.1  
**Target Platform**: Modern web browsers (Chrome 100+, Firefox 100+, Safari 15+, Edge 100+)
**Project Type**: web - Next.js App Router with Server Components  
**Performance Goals**: Status transitions complete in <5 seconds, UI updates in <1 second  
**Constraints**: Zero data loss during transitions, clear error messages within 2 seconds  
**Scale/Scope**: Single moderator per game, handling up to 100 concurrent games

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

✅ **0. Git commit and Code Formatting**: Will run Biome formatting on all modified files before commits
✅ **I. Clean Architecture**: Status transition logic in Use Cases, validation in Domain layer, UI in Presentation
✅ **II. Component Architecture**: Status transition UI in Domain components, buttons in UI layer  
✅ **III. Custom Hooks Architecture**: All state and transition logic will be in custom hooks
✅ **IV. Test-Driven Development**: Will write tests first for validation rules and UI behavior
✅ **V. Type Safety**: Full TypeScript with Zod schemas for validation
✅ **VI. Documentation Standards**: References requirements from docs/requirement.md
✅ **VII. Server Components First**: Game detail page remains Server Component, transitions via Server Actions

**GATE RESULT**: ✅ PASS - All constitution principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── actions/
│       └── game.ts                    # Server Actions for status transitions
├── components/
│   ├── pages/
│   │   └── GameDetailPage/
│   │       ├── index.tsx              # Updated with status transition UI
│   │       └── hooks/
│   │           └── useGameStatus.ts   # New hook for status management
│   └── domain/
│       └── game/
│           ├── GameStatusBadge.tsx    # Display current status
│           └── StatusTransitionButton.tsx # Transition action buttons
├── server/
│   ├── domain/
│   │   ├── schemas/
│   │   │   └── gameSchemas.ts        # Updated with transition schemas
│   │   └── errors/
│   │       └── StatusTransitionError.ts # New error type
│   ├── application/
│   │   └── use-cases/
│   │       └── games/
│   │           ├── ValidateStatusTransition.ts # New validation use case
│   │           └── ValidateStatusTransition.test.ts
│   └── infrastructure/
│       └── repositories/
│           └── PrismaGameRepository.ts # Already handles status updates

tests/
├── unit/
│   ├── components/
│   │   └── GameStatusBadge.test.tsx
│   └── hooks/
│       └── useGameStatus.test.ts
├── integration/
│   └── status-transition.test.ts
└── e2e/
    └── game-status-flow.spec.ts
```

**Structure Decision**: Using existing Next.js App Router structure with Clean Architecture. Status transition logic will be implemented as new Use Cases in the application layer, with UI components in the domain layer and Server Actions handling the HTTP interface.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
