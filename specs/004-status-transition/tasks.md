# Tasks: Game Status Transition

**Input**: Design documents from `/specs/004-status-transition/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests included per TDD requirement from constitution (Principle IV)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Project uses Next.js App Router with Clean Architecture

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and validation schemas

- [ ] T001 Verify existing GameStatus value object in src/server/domain/value-objects/GameStatus.ts
- [ ] T002 Create StatusTransitionError class in src/server/domain/errors/StatusTransitionError.ts
- [ ] T003 [P] Add transition validation schemas to src/server/domain/schemas/gameSchemas.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core validation logic that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create ValidateStatusTransition use case test in src/server/application/use-cases/games/ValidateStatusTransition.test.ts
- [ ] T005 Implement ValidateStatusTransition use case in src/server/application/use-cases/games/ValidateStatusTransition.ts
- [ ] T006 Verify existing StartAcceptingResponses use case in src/server/application/use-cases/games/StartAcceptingResponses.ts
- [ ] T007 Verify existing CloseGame use case in src/server/application/use-cases/games/CloseGame.ts
- [ ] T008 Add presenter validation methods to PrismaGameRepository in src/server/infrastructure/repositories/PrismaGameRepository.ts

**Checkpoint**: Validation logic ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Start Game from Preparation (Priority: P1) 🎯 MVP

**Goal**: Enable moderators to transition games from 準備中 to 出題中 with presenter validation

**Independent Test**: Create game with presenter, click start button, verify status changes to 出題中

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T009 [P] [US1] Unit test for startGame Server Action in src/app/actions/game.test.ts
- [ ] T010 [P] [US1] Component test for StatusTransitionButton in src/components/domain/game/StatusTransitionButton.test.tsx
- [ ] T011 [P] [US1] Hook test for useGameStatus in src/components/pages/GameDetailPage/hooks/useGameStatus.test.ts
- [ ] T012 [US1] Integration test for start game flow in tests/integration/status-transition.test.ts

### Implementation for User Story 1

- [ ] T013 [US1] Create startGame Server Action in src/app/actions/game.ts
- [ ] T014 [P] [US1] Create GameStatusBadge component in src/components/domain/game/GameStatusBadge.tsx
- [ ] T015 [P] [US1] Create StatusTransitionButton component in src/components/domain/game/StatusTransitionButton.tsx
- [ ] T016 [US1] Create useGameStatus hook in src/components/pages/GameDetailPage/hooks/useGameStatus.ts
- [ ] T017 [US1] Integrate status transition UI into GameDetailPage in src/components/pages/GameDetailPage/index.tsx
- [ ] T018 [US1] Add error handling and loading states to StatusTransitionButton
- [ ] T019 [US1] Implement optimistic UI updates in useGameStatus hook

**Checkpoint**: Start game functionality complete and independently testable

---

## Phase 4: User Story 2 - Close Game from Active State (Priority: P2)

**Goal**: Enable moderators to close games from 出題中 to 締切 with confirmation

**Independent Test**: Set game to 出題中, click close button, confirm dialog, verify status changes to 締切

### Tests for User Story 2 ⚠️

- [ ] T020 [P] [US2] Unit test for closeGame Server Action in src/app/actions/game.test.ts
- [ ] T021 [P] [US2] Component test for confirmation dialog in StatusTransitionButton.test.tsx
- [ ] T022 [US2] Integration test for close game flow with confirmation in tests/integration/status-transition.test.ts

### Implementation for User Story 2

- [ ] T023 [US2] Create closeGame Server Action in src/app/actions/game.ts
- [ ] T024 [US2] Add confirmation dialog logic to StatusTransitionButton component
- [ ] T025 [US2] Update useGameStatus hook to handle close game transition
- [ ] T026 [US2] Add confirmation state management to useGameStatus hook
- [ ] T027 [US2] Implement rollback on confirmation cancel

**Checkpoint**: Close game functionality complete with confirmation dialog

---

## Phase 5: User Story 3 - View Current Status and Available Actions (Priority: P3)

**Goal**: Clearly display current status and available transitions based on game state

**Independent Test**: View games in each status, verify correct buttons and badges are displayed

### Tests for User Story 3 ⚠️

- [ ] T028 [P] [US3] Component test for GameStatusBadge display states in GameStatusBadge.test.tsx
- [ ] T029 [P] [US3] Test conditional button rendering in StatusTransitionButton.test.tsx
- [ ] T030 [US3] E2E test for status visibility in tests/e2e/game-status-flow.spec.ts

### Implementation for User Story 3

- [ ] T031 [P] [US3] Add status-specific styling to GameStatusBadge component
- [ ] T032 [US3] Implement conditional rendering logic in StatusTransitionButton
- [ ] T033 [US3] Add status-based button text and icons to StatusTransitionButton
- [ ] T034 [US3] Update GameDetailPage to prominently display status badge
- [ ] T035 [US3] Add disabled state styling for unavailable transitions

**Checkpoint**: All status states properly displayed with correct available actions

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T036 [P] Add authorization checks to all Server Actions
- [ ] T037 Handle concurrent status change attempts with database locks
- [ ] T038 [P] Add telemetry/logging for status transitions
- [ ] T039 Performance optimization for presenter validation queries
- [ ] T040 [P] Add accessibility attributes to status transition buttons
- [ ] T041 Run quickstart.md validation scenarios
- [ ] T042 Format all files with Biome and commit changes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in priority order (P1 → P2 → P3)
  - P2 depends on P1 (needs startGame to test closeGame)
  - P3 can run in parallel with P1 and P2
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - MVP functionality
- **User Story 2 (P2)**: Requires US1 (needs games in 出題中 status to test)
- **User Story 3 (P3)**: Can start after Foundational - Independent UI work

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Server Actions before components
- Components before hooks
- Individual pieces before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- Once Foundational completes:
  - US1 and US3 can run in parallel (US3 is UI-only)
  - US2 must wait for US1
- All tests within a story marked [P] can run in parallel
- Component creation tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
npm test -- game.test.ts &
npm test -- StatusTransitionButton.test.tsx &
npm test -- useGameStatus.test.ts &

# Launch component creation together:
# Create GameStatusBadge.tsx
# Create StatusTransitionButton.tsx
# (both in different files, no conflicts)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T008)
3. Complete Phase 3: User Story 1 (T009-T019)
4. **STOP and VALIDATE**: Test start game functionality independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Validation ready
2. Add User Story 1 → Start game works → Deploy (MVP!)
3. Add User Story 2 → Close game works → Deploy
4. Add User Story 3 → Better UX → Deploy
5. Each story adds value without breaking previous functionality

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (start game)
   - Developer B: User Story 3 (UI enhancements)
   - After US1 done: Developer A helps with User Story 2
3. All developers: Polish phase

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story should be independently testable
- Follow TDD: tests fail → implement → tests pass
- Run Biome formatting before commits
- Validate with quickstart.md scenarios
- Authorization checks are critical for security