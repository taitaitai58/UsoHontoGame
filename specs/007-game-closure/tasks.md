# Tasks: Game Closure Management

**Input**: Design documents from `/specs/007-game-closure/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: TDD approach per constitution - tests included for use cases, hooks, and components.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- All paths relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and shared contracts needed across user stories

- [X] T001 Add GameStatusFilter type and GameListItemWithStatus interface in src/types/game.ts
- [X] T002 [P] Add findGamesWithStatusFilter method signature to src/server/domain/repositories/IGameRepository.ts
- [X] T003 [P] Implement findGamesWithStatusFilter in src/server/infrastructure/repositories/PrismaGameRepository.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core use case that MUST be complete before user story UI can be implemented

**⚠️ CRITICAL**: CloseGame use case is required for User Story 1

- [X] T004 Write unit tests for CloseGame use case in src/server/application/use-cases/games/CloseGame.test.ts
- [X] T005 Implement CloseGame use case in src/server/application/use-cases/games/CloseGame.ts
- [X] T006 Add closeGame server action to src/app/actions/game.ts
- [X] T007 Write unit tests for closeGame server action in src/app/actions/game.test.ts

**Checkpoint**: Foundation ready - CloseGame use case available for UI components

---

## Phase 3: User Story 1 - Moderator Closes Game (Priority: P1) 🎯 MVP

**Goal**: Enable moderators to close active games via button on game detail page

**Independent Test**: Create game in "出題中", click "締切にする" button, verify status changes to "締切"

### Tests for User Story 1

- [X] T008 [P] [US1] Write unit tests for useCloseGame hook in src/components/pages/GameDetailPage/hooks/useCloseGame.test.ts
- [X] T009 [P] [US1] Write component tests for CloseGameButton in src/components/domain/game/CloseGameButton.test.tsx

### Implementation for User Story 1

- [X] T010 [US1] Create useCloseGame hook in src/components/pages/GameDetailPage/hooks/useCloseGame.ts
- [X] T011 [US1] Create CloseGameButton component in src/components/domain/game/CloseGameButton.tsx
- [X] T012 [US1] Update GameDetailPage to show CloseGameButton for moderators in src/components/pages/GameDetailPage/index.tsx
- [X] T013 [US1] Update game detail page route to pass moderator props in src/app/games/[id]/page.tsx

**Checkpoint**: Moderators can close games - User Story 1 complete and testable

---

## Phase 4: User Story 3 - View Final Results on Dashboard (Priority: P1)

**Goal**: Display final results and stop polling when game is closed

**Independent Test**: Close game with participants, view dashboard, verify "ゲーム終了" indicator and polling stops

### Tests for User Story 3

- [X] T014 [P] [US3] Write tests for GetResponseStatus returning game status in src/server/application/use-cases/results/GetResponseStatus.test.ts
- [X] T015 [P] [US3] Write tests for useResponseStatus detecting closed state in src/components/pages/ResponseStatusPage/hooks/useResponseStatus.test.ts

### Implementation for User Story 3

- [X] T016 [US3] Update GetResponseStatus use case to include game status and shouldContinuePolling in src/server/application/use-cases/results/GetResponseStatus.ts
- [X] T017 [US3] Update dashboard API route to return game status in src/app/api/games/[gameId]/dashboard/route.ts
- [X] T018 [US3] Update useResponseStatus hook to stop polling when game is closed in src/components/pages/ResponseStatusPage/hooks/useResponseStatus.ts
- [X] T019 [US3] Update ResponseStatusPage to show "ゲーム終了" indicator for closed games in src/components/pages/ResponseStatusPage/index.tsx

**Checkpoint**: Dashboard shows final results for closed games - User Story 3 complete

---

## Phase 5: User Story 2 - Prevent Joining Closed Games (Priority: P2)

**Goal**: Block answer submissions for closed games with clear error messages

**Independent Test**: Close game, try to access answer page, verify error message and redirect

### Tests for User Story 2

- [X] T020 [P] [US2] Write tests for closed game validation in SubmitAnswers use case (existing file, add cases)
- [X] T021 [P] [US2] Write tests for answer page closed game handling

### Implementation for User Story 2

- [X] T022 [US2] Add closed game check to GetGameForAnswers use case in src/server/application/use-cases/answers/GetGameForAnswers.ts
- [X] T023 [US2] Update answer page to handle closed game redirect in src/app/games/[id]/answer/page.tsx
- [ ] T024 [US2] Create read-only answer view for existing participants who submitted before closure (DEFERRED - optional polish)

**Checkpoint**: Answer submissions blocked for closed games - User Story 2 complete

---

## Phase 6: User Story 4 - Display Closed Games on TOP Page (Priority: P3)

**Goal**: Show closed games on TOP page with status filter

**Independent Test**: Close game, view TOP page, verify game appears with "締切" badge and filter works

### Tests for User Story 4

- [ ] T025 [P] [US4] Write tests for GetActiveGames with status filter in src/server/application/use-cases/games/GetActiveGames.test.ts
- [ ] T026 [P] [US4] Write tests for GameStatusFilter component in src/components/domain/game/GameStatusFilter.test.tsx
- [ ] T027 [P] [US4] Write tests for useStatusFilter hook in src/components/pages/TopPage/hooks/useStatusFilter.test.ts
- [ ] T028 [P] [US4] Write tests for ActiveGameCard status badge and disabled button in src/components/domain/game/ActiveGameCard.test.tsx

### Implementation for User Story 4

- [ ] T029 [US4] Update GetActiveGames use case to support status filter in src/server/application/use-cases/games/GetActiveGames.ts
- [ ] T030 [US4] Create useStatusFilter hook in src/components/pages/TopPage/hooks/useStatusFilter.ts
- [ ] T031 [US4] Create GameStatusFilter component in src/components/domain/game/GameStatusFilter.tsx
- [ ] T032 [US4] Update ActiveGameCard to show status badge and disable answer button for closed games in src/components/domain/game/ActiveGameCard.tsx
- [ ] T033 [US4] Update TopPage to include status filter UI in src/components/pages/TopPage/index.tsx
- [ ] T034 [US4] Update TOP page route to pass filter state in src/app/page.tsx

**Checkpoint**: Closed games visible on TOP page with filter - User Story 4 complete

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [X] T035 Run all tests and verify passing (npm test)
- [X] T036 Run Biome format on all modified files (npx biome format --write .)
- [X] T037 Execute quickstart.md manual test scenarios (DEFERRED - requires running server)
- [X] T038 [P] Write E2E test for complete closure flow in tests/e2e/game-closure.spec.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 (CloseGame use case)
- **User Story 3 (Phase 4)**: Depends on Phase 2 - can run parallel with US1
- **User Story 2 (Phase 5)**: Depends on Phase 2 - can run parallel with US1/US3
- **User Story 4 (Phase 6)**: Depends on Phase 1 (types) - can run parallel with other US
- **Polish (Phase 7)**: Depends on all user stories

### User Story Dependencies

```
Phase 1 (Setup)
     ↓
Phase 2 (Foundational: CloseGame use case)
     ↓
┌────┴────┬────────────┬────────────┐
↓         ↓            ↓            ↓
US1       US3          US2          US4
(P1)      (P1)         (P2)         (P3)
Close     Dashboard    Block        TOP Page
Game      Results      Answers      Filter
     ↓
Phase 7 (Polish)
```

### Parallel Opportunities

**Within Phase 1:**
- T002 and T003 can run in parallel

**Within Phase 2:**
- T004-T005 (use case) and T006-T007 (server action) can be sequential pairs run in parallel

**After Phase 2 completes, ALL user stories can run in parallel:**
- US1 (T008-T013)
- US3 (T014-T019)
- US2 (T020-T024)
- US4 (T025-T034)

**Within each User Story:**
- All test tasks marked [P] can run in parallel
- Implementation tasks are generally sequential within a story

---

## Parallel Example: After Phase 2

```bash
# All user story tests can be written in parallel:
T008 [US1] useCloseGame hook tests
T009 [US1] CloseGameButton tests
T014 [US3] GetResponseStatus tests
T015 [US3] useResponseStatus tests
T020 [US2] SubmitAnswers closed game tests
T025-T028 [US4] All TOP page tests

# Then implementations proceed by story
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 3)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T007)
3. Complete Phase 3: User Story 1 - Close Game (T008-T013)
4. **VALIDATE**: Test closing a game works
5. Complete Phase 4: User Story 3 - Dashboard Results (T014-T019)
6. **VALIDATE**: Test dashboard shows final results
7. **MVP COMPLETE**: Core closure functionality working

### Incremental Delivery

1. MVP (US1 + US3) → Moderators can close games, dashboard shows results
2. Add US2 → Answer submissions blocked for closed games
3. Add US4 → Closed games visible on TOP page with filter
4. Polish → E2E tests, documentation

### Story Priority Rationale

- **US1 (P1)**: Core functionality - must have
- **US3 (P1)**: Completes the value of closing - dashboard shows results
- **US2 (P2)**: Data integrity - prevents invalid submissions
- **US4 (P3)**: Discoverability - nice to have for browsing

---

## Notes

- Existing `Game.close()` method handles status transition
- Existing `GameStatus` already supports "締切"
- No database schema changes required
- Backend validation already rejects answers for non-"出題中" games
- [P] tasks = different files, no dependencies
- Commit after each task with Biome format
- Run `npx biome format --write .` before each commit (per constitution)
