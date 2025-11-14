# Implementation Plan: Inline Episode Registration for Presenters

**Branch**: `003-presenter-episode-inline` | **Date**: 2025-01-14 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-presenter-episode-inline/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Transform the current 2-step presenter registration process (register presenter → add 3 episodes separately) into a single-form process where presenters are registered with their 3 episodes (2 truths, 1 lie) in one atomic operation. This improves UX by reducing screen transitions to zero and cutting registration time by 50%.

## Technical Context

**Language/Version**: TypeScript 5 with strict mode enabled
**Primary Dependencies**: Next.js 16.0.1, React 19.2.0, Tailwind CSS v4, Zod 3.x for validation, nanoid 5.1.6 for ID generation
**Storage**: InMemoryGameRepository (singleton pattern for MVP)
**Testing**: Vitest for unit/integration tests, React Testing Library for component tests
**Target Platform**: Web browser (modern browsers supporting ES2020+)
**Project Type**: Web application (Next.js App Router with Server Components)
**Performance Goals**: Form submission < 500ms, instant validation feedback (< 50ms)
**Constraints**: Atomic save operations (all-or-nothing), exactly 3 episodes per presenter, exactly 1 lie marker
**Scale/Scope**: MVP supporting ~100 concurrent games, ~10 presenters per game

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **0. Git commit and Code Formatting** - Will apply Biome formatting before each commit
✅ **I. Clean Architecture** - Use case layer (AddPresenterWithEpisodes), domain entities (Presenter, Episode), repository pattern maintained
✅ **II. Component Architecture** - New component in domain layer (PresenterWithEpisodesForm), reuses UI layer components
✅ **III. Custom Hooks Architecture** - New usePresenterWithEpisodesForm hook for all form logic
✅ **IV. Test-Driven Development** - Tests will be written first for all new code
✅ **V. Type Safety** - Full TypeScript types for new DTOs and schemas
✅ **VI. Documentation Standards** - Feature spec created with prioritized user stories
✅ **VII. Server Components First** - Form requires client component for interactions, but parent page remains server component

**Compliance Status**: PASS - All constitution principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/003-presenter-episode-inline/
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
│       └── presenter.ts                    # New server action: addPresenterWithEpisodesAction
├── components/
│   └── domain/
│       └── game/
│           └── PresenterWithEpisodesForm.tsx  # New form component
├── hooks/
│   └── usePresenterWithEpisodesForm.ts     # New custom hook for form logic
├── server/
│   ├── application/
│   │   └── use-cases/
│   │       └── games/
│   │           └── AddPresenterWithEpisodes.ts  # New use case
│   └── domain/
│       └── schemas/
│           └── gameSchemas.ts               # Extended with AddPresenterWithEpisodesSchema
└── types/
    └── presenter.ts                         # New types for inline registration

tests/
├── unit/
│   ├── hooks/
│   │   └── usePresenterWithEpisodesForm.test.ts
│   ├── use-cases/
│   │   └── AddPresenterWithEpisodes.test.ts
│   └── schemas/
│       └── AddPresenterWithEpisodesSchema.test.ts
└── component/
    └── PresenterWithEpisodesForm.test.tsx
```

**Structure Decision**: Using existing Next.js App Router structure with Clean Architecture layers. New functionality integrates into existing domain/game module, maintaining separation between presentation (components/hooks), application (use cases), and domain (schemas) layers.

## Complexity Tracking

> **No violations - all constitution principles satisfied**

N/A - Feature follows all established patterns and principles.

## Phase 2: Implementation Tasks

**Next Step**: Run `/speckit.tasks` command to generate the prioritized task list for implementation.

### Key Implementation Milestones

1. **Backend Foundation** (Tasks will cover):
   - Zod schema with cross-field validation
   - Use case for atomic presenter+episodes creation
   - Repository method for transactional save
   - Server action with proper error handling

2. **Frontend Components** (Tasks will cover):
   - Custom hook for form state management
   - Unified form component with 3 episode inputs
   - Character counters and real-time validation
   - Success/error feedback UI

3. **Integration & Testing** (Tasks will cover):
   - Unit tests for use case and validation
   - Component tests for form interactions
   - Integration with existing presenter management page
   - Deprecation of old two-step flow

## Post-Design Constitution Re-check

✅ **All principles remain satisfied after design phase**

- Clean Architecture: Maintained with new use case and repository method
- Component Architecture: New form component properly placed in domain layer
- Custom Hooks: All logic extracted to usePresenterWithEpisodesForm hook
- TDD: Test specifications defined in quickstart.md
- Type Safety: Full TypeScript types defined in data-model.md
- Documentation: Complete specs with user stories and requirements
- Server Components: Form requires client component for interactions (justified)

**Final Status**: APPROVED - Ready for task generation and implementation
