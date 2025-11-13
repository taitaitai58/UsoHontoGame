# Tasks: Game Preparation for Moderators

**Feature Branch**: `002-game-preparation`
**Created**: 2025-11-11
**Status**: Ready for Implementation

## Overview

This feature enables moderators to create and manage games with custom names, player limits, presenters (1-10), and episodes (3 per presenter with one marked as a lie). Games transition through three statuses: 準備中 → 出題中 → 締切. Implementation follows Clean Architecture with TDD, using SQLite/Prisma for persistence, React Server Components, and Server Actions for mutations.

**Key Updates**:
- Game name field (optional, max 100 chars) - FR-001a, FR-001b
- Presenters and episodes can be added during game creation - FR-003a
- Full CRUD operations with proper authorization
- Status transitions with business rule validation

## Dependency Graph

```
Phase 1: Setup → Phase 2: Foundational → Phase 3-8: User Stories (some parallel) → Phase 9: Polish

Phase 3 (US1 - P1): Create Game with Name & Presenters
   ↓
Phase 4 (US2 - P2): Register Presenters/Episodes (extends Phase 3)
   ↓
Phase 5 (US3 - P2): Manage Game Status (depends on Phase 4)
   ↓
Phase 6-8 (US4-6 - P3): List/Edit/Delete (depends on Phase 3-5)
   ↓
Phase 9: Integration & Polish
```

**Parallel Opportunities**:
- Phase 6 (US4 - List) can start after Phase 3 completes
- Phase 7 (US5 - Edit) and Phase 8 (US6 - Delete) can run in parallel after Phase 3-5

---

## Phase 1: Setup & Schema Migration

**Purpose**: Initialize project structure and update database schema for game name and presenter/episode entities.

- [X] T001 [P] Update Prisma schema to add `name` field to Game model at `/Users/ookura.keisuke/repos/UsoHontoGame/prisma/schema.prisma`
- [X] T002 [P] Add Presenter model to Prisma schema at `/Users/ookura.keisuke/repos/UsoHontoGame/prisma/schema.prisma`
- [X] T003 [P] Add Episode model to Prisma schema with cascade delete at `/Users/ookura.keisuke/repos/UsoHontoGame/prisma/schema.prisma`
- [X] T004 Create Prisma migration for game name, presenters, and episodes
- [X] T005 Run migration and verify schema changes in dev.db
- [ ] T006 [P] Create TypeScript types for Presenter at `/Users/ookura.keisuke/repos/UsoHontoGame/src/types/presenter.ts`
- [ ] T007 [P] Create TypeScript types for Episode at `/Users/ookura.keisuke/repos/UsoHontoGame/src/types/episode.ts`
- [ ] T008 Update existing Game types to include name and presenters at `/Users/ookura.keisuke/repos/UsoHontoGame/src/types/game.ts`

---

## Phase 2: Foundational Domain Layer

**Purpose**: Build core domain entities, value objects, repositories, and DTOs that all user stories depend on.

### Value Objects (TDD)

- [ ] T009 Write unit tests for GameName value object at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/unit/value-objects/GameName.test.ts`
- [ ] T010 Implement GameName value object (optional, max 100 chars) at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/domain/value-objects/GameName.ts`
- [ ] T011 [P] Write unit tests for PresenterId value object at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/unit/value-objects/PresenterId.test.ts`
- [ ] T012 [P] Implement PresenterId value object at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/domain/value-objects/PresenterId.ts`
- [ ] T013 [P] Write unit tests for EpisodeId value object at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/unit/value-objects/EpisodeId.test.ts`
- [ ] T014 [P] Implement EpisodeId value object at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/domain/value-objects/EpisodeId.ts`
- [ ] T015 [P] Write unit tests for EpisodeText value object at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/unit/value-objects/EpisodeText.test.ts`
- [ ] T016 [P] Implement EpisodeText value object (max 1000 chars) at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/domain/value-objects/EpisodeText.ts`

### Domain Entities (TDD)

- [X] T017 Write unit tests for Episode entity at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/unit/entities/Episode.test.ts`
- [X] T018 Implement Episode entity with isLie field at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/domain/entities/Episode.ts`
- [X] T019 Write unit tests for Presenter entity at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/unit/entities/Presenter.test.ts`
- [X] T020 Implement Presenter entity with episode management methods at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/domain/entities/Presenter.ts`
- [X] T021 Write unit tests for Game entity extensions (name, presenters) at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/unit/entities/Game.test.ts`
- [X] T022 Extend Game entity with name field and presenter management at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/domain/entities/Game.ts`
- [X] T023 Add status transition methods to Game entity (startAccepting, close) at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/domain/entities/Game.ts`

### Domain Errors

- [ ] T024 [P] Create PresenterLimitError at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/domain/errors/PresenterLimitError.ts`
- [ ] T025 [P] Create EpisodeLimitError at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/domain/errors/EpisodeLimitError.ts`
- [X] T026 [P] Create InvalidStatusTransitionError at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/domain/errors/InvalidStatusTransitionError.ts`

### Zod Validation Schemas

- [ ] T027 [P] Create Presenter validation schemas at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/domain/schemas/presenterSchemas.ts`
- [ ] T028 [P] Create Episode validation schemas at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/domain/schemas/episodeSchemas.ts`
- [X] T029 Extend Game validation schemas with name and presenters at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/domain/schemas/gameSchemas.ts`

### Repository Interfaces

- [ ] T030 [P] Create PresenterRepository interface at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/domain/repositories/PresenterRepository.ts`
- [ ] T031 [P] Create EpisodeRepository interface at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/domain/repositories/EpisodeRepository.ts`
- [X] T032 Extend GameRepository interface with presenter/episode methods at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/domain/repositories/GameRepository.ts`

### Infrastructure - Repositories (TDD)

- [ ] T033 Write integration tests for PrismaPresenterRepository at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/integration/repositories/PrismaPresenterRepository.test.ts`
- [ ] T034 Implement PrismaPresenterRepository at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/infrastructure/repositories/PrismaPresenterRepository.ts`
- [ ] T035 Write integration tests for PrismaEpisodeRepository at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/integration/repositories/PrismaEpisodeRepository.test.ts`
- [ ] T036 Implement PrismaEpisodeRepository with cascade delete at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/infrastructure/repositories/PrismaEpisodeRepository.ts`
- [X] T037 Write integration tests for PrismaGameRepository extensions at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/integration/repositories/PrismaGameRepository.test.ts`
- [X] T038 Extend PrismaGameRepository with presenter/episode operations at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/infrastructure/repositories/PrismaGameRepository.ts`

### DTOs

- [ ] T039 [P] Create EpisodeDto (public, no isLie) at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/application/dto/responses/EpisodeResponse.ts`
- [ ] T040 [P] Create EpisodeWithLieDto (private, with isLie) at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/application/dto/responses/EpisodeResponse.ts`
- [ ] T041 [P] Create PresenterResponse DTO at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/application/dto/responses/PresenterResponse.ts`
- [ ] T042 Extend GameResponse DTO with name and presenters at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/application/dto/responses/GameResponse.ts`

---

## Phase 3: User Story 1 (P1) - Create New Game

**Priority**: P1 - Foundation for all other functionality
**Acceptance Criteria**: Can create game with name, player limit, and optionally presenters/episodes during creation

### Use Cases (TDD)

- [X] T043 [US1] Write unit tests for CreateGame use case with name field at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/unit/use-cases/CreateGame.test.ts`
- [X] T044 [US1] Extend CreateGame use case to accept name and presenters at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/application/use-cases/games/CreateGame.ts`
- [ ] T045 [US1] Create CreateGameRequest DTO with name and presenters at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/application/dto/requests/CreateGameRequest.ts`

### Server Actions (TDD)

- [ ] T046 [US1] Write integration tests for createGameAction at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/integration/api/game-actions.test.ts`
- [X] T047 [US1] Implement createGameAction with name and presenter support at `/Users/ookura.keisuke/repos/UsoHontoGame/src/app/actions/game.ts`

### Custom Hooks (TDD)

- [ ] T048 [US1] Write unit tests for useGameForm hook at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/unit/hooks/useGameForm.test.ts`
- [ ] T049 [US1] Implement useGameForm hook with name field at `/Users/ookura.keisuke/repos/UsoHontoGame/src/components/pages/GameCreatePage/hooks/useGameForm.ts`
- [ ] T050 [US1] Write unit tests for usePresenterManager hook at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/unit/hooks/usePresenterManager.test.ts`
- [ ] T051 [US1] Implement usePresenterManager hook (add/remove presenters during creation) at `/Users/ookura.keisuke/repos/UsoHontoGame/src/components/pages/GameCreatePage/hooks/usePresenterManager.ts`

### Domain Components (TDD)

- [ ] T052 [US1] Write component tests for GameForm at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/component/domain/GameForm.test.tsx`
- [X] T053 [US1] Implement GameForm component with name input at `/Users/ookura.keisuke/repos/UsoHontoGame/src/components/domain/game/GameForm/GameForm.tsx`
- [ ] T054 [US1] Write component tests for PresenterManager at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/component/domain/PresenterManager.test.tsx`
- [ ] T055 [US1] Implement PresenterManager component (add/configure presenters) at `/Users/ookura.keisuke/repos/UsoHontoGame/src/components/domain/game/PresenterManager/PresenterManager.tsx`
- [ ] T056 [US1] Write component tests for EpisodeInput at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/component/domain/EpisodeInput.test.tsx`
- [ ] T057 [US1] Implement EpisodeInput component (text + lie marker) at `/Users/ookura.keisuke/repos/UsoHontoGame/src/components/domain/game/EpisodeInput/EpisodeInput.tsx`

### Page Components (TDD)

- [ ] T058 [US1] Write component tests for GameCreatePage at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/component/pages/GameCreatePage.test.tsx`
- [ ] T059 [US1] Implement GameCreatePage with name and presenter sections at `/Users/ookura.keisuke/repos/UsoHontoGame/src/components/pages/GameCreatePage/GameCreatePage.tsx`
- [ ] T060 [US1] Create Next.js page wrapper at `/Users/ookura.keisuke/repos/UsoHontoGame/src/app/games/create/page.tsx`

### E2E Tests

- [ ] T061 [US1] Write E2E test for creating game with name only at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/e2e/game-creation.spec.ts`
- [ ] T062 [US1] Write E2E test for creating game with name and presenters at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/e2e/game-creation.spec.ts`
- [ ] T063 [US1] Write E2E test for validation (invalid player limit, name too long) at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/e2e/game-creation.spec.ts`

**Independent Test Criteria**:
- ✅ Can create game with name and player limit (stores in DB)
- ✅ Can create game with name, player limit, and 1 presenter with 3 episodes
- ✅ Validation prevents invalid player limits (0, 101, negative)
- ✅ Validation prevents names over 100 characters
- ✅ Newly created game has status '準備中'

---

## Phase 4: User Story 2 (P2) - Register Presenters and Episodes

**Priority**: P2 - Content creation layer
**Dependencies**: Phase 3 (US1) must complete
**Acceptance Criteria**: Can add/update presenters with 3 episodes and one lie marker after game creation

### Use Cases (TDD)

- [X] T064 [US2] Write unit tests for AddPresenter use case at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/unit/use-cases/AddPresenter.test.ts`
- [X] T065 [US2] Implement AddPresenter use case with validation at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/application/use-cases/presenters/AddPresenter.ts`
- [ ] T066 [US2] Write unit tests for RemovePresenter use case at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/unit/use-cases/RemovePresenter.test.ts`
- [X] T067 [US2] Implement RemovePresenter use case at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/application/use-cases/presenters/RemovePresenter.ts`
- [ ] T068 [US2] Write unit tests for UpdatePresenterEpisodes use case at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/unit/use-cases/UpdatePresenterEpisodes.test.ts`
- [ ] T069 [US2] Implement UpdatePresenterEpisodes use case (exactly 3 episodes, 1 lie) at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/application/use-cases/presenters/UpdatePresenterEpisodes.ts`

### Server Actions (TDD)

- [ ] T070 [US2] Write integration tests for addPresenterAction at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/integration/api/game-actions.test.ts`
- [ ] T071 [US2] Implement addPresenterAction at `/Users/ookura.keisuke/repos/UsoHontoGame/src/app/actions/game.ts`
- [ ] T072 [US2] Write integration tests for removePresenterAction at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/integration/api/game-actions.test.ts`
- [ ] T073 [US2] Implement removePresenterAction at `/Users/ookura.keisuke/repos/UsoHontoGame/src/app/actions/game.ts`
- [ ] T074 [US2] Write integration tests for updatePresenterEpisodesAction at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/integration/api/game-actions.test.ts`
- [ ] T075 [US2] Implement updatePresenterEpisodesAction at `/Users/ookura.keisuke/repos/UsoHontoGame/src/app/actions/game.ts`

### Custom Hooks (TDD)

- [ ] T076 [US2] Write unit tests for usePresenterList hook at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/unit/hooks/usePresenterList.test.ts`
- [ ] T077 [US2] Implement usePresenterList hook at `/Users/ookura.keisuke/repos/UsoHontoGame/src/components/domain/game/PresenterList/hooks/usePresenterList.ts`
- [ ] T078 [US2] Write unit tests for useEpisodeInput hook at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/unit/hooks/useEpisodeInput.test.ts`
- [ ] T079 [US2] Implement useEpisodeInput hook with lie marker validation at `/Users/ookura.keisuke/repos/UsoHontoGame/src/components/domain/game/EpisodeInput/hooks/useEpisodeInput.ts`

### Domain Components (TDD)

- [ ] T080 [US2] Write component tests for PresenterList at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/component/domain/PresenterList.test.tsx`
- [ ] T081 [US2] Implement PresenterList component (display/manage presenters) at `/Users/ookura.keisuke/repos/UsoHontoGame/src/components/domain/game/PresenterList/PresenterList.tsx`

### E2E Tests

- [ ] T082 [US2] Write E2E test for adding presenter with 3 episodes at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/e2e/presenter-management.spec.ts`
- [ ] T083 [US2] Write E2E test for preventing >10 presenters at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/e2e/presenter-management.spec.ts`
- [ ] T084 [US2] Write E2E test for lie marker validation (exactly 1) at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/e2e/presenter-management.spec.ts`
- [ ] T085 [US2] Write E2E test for episode text length validation (max 1000) at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/e2e/presenter-management.spec.ts`

**Independent Test Criteria**:
- ✅ Can add presenter with 3 episodes to existing game
- ✅ Can mark exactly one episode as lie per presenter
- ✅ Cannot add more than 10 presenters
- ✅ Cannot mark 0 or 2+ episodes as lie
- ✅ Episode text validates max 1000 characters
- ✅ Lie marker is confidential (not exposed in public APIs)

---

## Phase 5: User Story 3 (P2) - Manage Game Status

**Priority**: P2 - Essential for game lifecycle
**Dependencies**: Phase 4 (US2) must complete
**Acceptance Criteria**: Can transition game status through 準備中 → 出題中 → 締切 with validation

### Use Cases (TDD)

- [ ] T086 [US3] Write unit tests for ChangeGameStatus use case at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/unit/use-cases/ChangeGameStatus.test.ts`
- [ ] T087 [US3] Implement ChangeGameStatus use case with precondition validation at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/application/use-cases/games/ChangeGameStatus.ts`

### Server Actions (TDD)

- [ ] T088 [US3] Write integration tests for changeGameStatusAction at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/integration/api/game-actions.test.ts`
- [X] T089 [US3] Implement changeGameStatusAction at `/Users/ookura.keisuke/repos/UsoHontoGame/src/app/actions/game.ts`

### Custom Hooks (TDD)

- [ ] T090 [US3] Write unit tests for useGameStatus hook at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/unit/hooks/useGameStatus.test.ts`
- [ ] T091 [US3] Implement useGameStatus hook (transition logic) at `/Users/ookura.keisuke/repos/UsoHontoGame/src/components/pages/GameEditPage/hooks/useGameStatus.ts`

### UI Components

- [ ] T092 [US3] Implement StatusBadge component for game status display at `/Users/ookura.keisuke/repos/UsoHontoGame/src/components/ui/StatusBadge/StatusBadge.tsx`
- [ ] T093 [US3] Write component tests for StatusBadge at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/component/ui/StatusBadge.test.tsx`

### E2E Tests

- [ ] T094 [US3] Write E2E test for status transition 準備中 → 出題中 at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/e2e/game-status-transition.spec.ts`
- [ ] T095 [US3] Write E2E test for status transition 出題中 → 締切 at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/e2e/game-status-transition.spec.ts`
- [ ] T096 [US3] Write E2E test for validation (cannot transition without presenters) at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/e2e/game-status-transition.spec.ts`
- [ ] T097 [US3] Write E2E test for validation (cannot transition with incomplete episodes) at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/e2e/game-status-transition.spec.ts`

**Independent Test Criteria**:
- ✅ Can transition from 準備中 to 出題中 when game has 1+ presenter with complete episodes
- ✅ Cannot transition to 出題中 without presenters
- ✅ Cannot transition to 出題中 if any presenter has <3 episodes
- ✅ Cannot transition to 出題中 if any presenter lacks lie marker
- ✅ Can transition from 出題中 to 締切 with no preconditions
- ✅ Status change reflects on TOP page within 2 seconds

---

## Phase 6: User Story 4 (P3) - View and Manage Game List

**Priority**: P3 - Convenience feature
**Dependencies**: Phase 3 (US1) must complete (can start in parallel with Phase 4-5)
**Acceptance Criteria**: Can view all created games with status, player limit, presenter count

### Use Cases (TDD)

- [ ] T098 [US4] Write unit tests for ListGames use case at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/unit/use-cases/ListGames.test.ts`
- [X] T099 [US4] Implement ListGames use case (filter by creator) at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/application/use-cases/games/ListGames.ts`
- [ ] T100 [US4] Write unit tests for GetGame use case at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/unit/use-cases/GetGame.test.ts`
- [X] T101 [US4] Implement GetGame use case with authorization at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/application/use-cases/games/GetGame.ts`

### Server Actions (TDD)

- [ ] T102 [US4] Write integration tests for listGamesAction at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/integration/api/game-actions.test.ts`
- [ ] T103 [US4] Implement listGamesAction at `/Users/ookura.keisuke/repos/UsoHontoGame/src/app/actions/game.ts`
- [ ] T104 [US4] Write integration tests for getGameAction at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/integration/api/game-actions.test.ts`
- [ ] T105 [US4] Implement getGameAction at `/Users/ookura.keisuke/repos/UsoHontoGame/src/app/actions/game.ts`

### Custom Hooks (TDD)

- [ ] T106 [US4] Write unit tests for useGameList hook at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/unit/hooks/useGameList.test.ts`
- [ ] T107 [US4] Implement useGameList hook (fetching, filtering) at `/Users/ookura.keisuke/repos/UsoHontoGame/src/components/pages/GameListPage/hooks/useGameList.ts`

### Domain Components (TDD)

- [ ] T108 [US4] Write component tests for GameCard at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/component/domain/GameCard.test.tsx`
- [ ] T109 [US4] Implement GameCard component (displays game summary) at `/Users/ookura.keisuke/repos/UsoHontoGame/src/components/domain/game/GameCard/GameCard.tsx`

### Page Components (TDD)

- [ ] T110 [US4] Write component tests for GameListPage at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/component/pages/GameListPage.test.tsx`
- [ ] T111 [US4] Implement GameListPage component at `/Users/ookura.keisuke/repos/UsoHontoGame/src/components/pages/GameListPage/GameListPage.tsx`
- [ ] T112 [US4] Create Next.js page wrapper at `/Users/ookura.keisuke/repos/UsoHontoGame/src/app/games/page.tsx`

### E2E Tests

- [ ] T113 [US4] Write E2E test for viewing game list with multiple games at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/e2e/game-list.spec.ts`
- [ ] T114 [US4] Write E2E test for empty state (no games created) at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/e2e/game-list.spec.ts`
- [ ] T115 [US4] Write E2E test for filtering by status at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/e2e/game-list.spec.ts`
- [ ] T116 [US4] Write E2E test for navigation to create/edit from list at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/e2e/game-list.spec.ts`

**Independent Test Criteria**:
- ✅ Game list displays all games created by current moderator
- ✅ Each game shows name, status, player limit, presenter count
- ✅ Empty state shows message with "Create Game" button
- ✅ Can filter by status (準備中/出題中/締切)
- ✅ List loads in under 1 second for 50 games

---

## Phase 7: User Story 5 (P3) - Edit Existing Game

**Priority**: P3 - Flexibility feature
**Dependencies**: Phase 3-5 must complete
**Acceptance Criteria**: Can edit game name, player limit, and presenters when status is 準備中

### Use Cases (TDD)

- [ ] T117 [US5] Write unit tests for UpdateGame use case at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/unit/use-cases/UpdateGame.test.ts`
- [X] T118 [US5] Implement UpdateGame use case with status validation at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/application/use-cases/games/UpdateGame.ts`

### Server Actions (TDD)

- [ ] T119 [US5] Write integration tests for updateGameAction at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/integration/api/game-actions.test.ts`
- [X] T120 [US5] Implement updateGameAction at `/Users/ookura.keisuke/repos/UsoHontoGame/src/app/actions/game.ts`

### Page Components (TDD)

- [ ] T121 [US5] Write component tests for GameEditPage at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/component/pages/GameEditPage.test.tsx`
- [ ] T122 [US5] Implement GameEditPage component (reuses GameForm, PresenterManager) at `/Users/ookura.keisuke/repos/UsoHontoGame/src/components/pages/GameEditPage/GameEditPage.tsx`
- [ ] T123 [US5] Create Next.js page wrapper at `/Users/ookura.keisuke/repos/UsoHontoGame/src/app/games/[id]/edit/page.tsx`

### E2E Tests

- [ ] T124 [US5] Write E2E test for editing game name and player limit at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/e2e/game-edit.spec.ts`
- [ ] T125 [US5] Write E2E test for adding/removing presenters in edit mode at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/e2e/game-edit.spec.ts`
- [ ] T126 [US5] Write E2E test for validation (cannot edit in 出題中/締切) at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/e2e/game-edit.spec.ts`
- [ ] T127 [US5] Write E2E test for authorization (only creator can edit) at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/e2e/game-edit.spec.ts`

**Independent Test Criteria**:
- ✅ Can edit game name and player limit when status is 準備中
- ✅ Can add/remove presenters when status is 準備中
- ✅ Cannot edit presenter info when status is 出題中 or 締切
- ✅ Only creator can access edit page (403 for others)
- ✅ Changes persist and reflect immediately in game list

---

## Phase 8: User Story 6 (P3) - Delete Game

**Priority**: P3 - Maintenance feature
**Dependencies**: Phase 3-5 must complete (can run parallel with Phase 7)
**Acceptance Criteria**: Can delete games with confirmation for active games

### Use Cases (TDD)

- [ ] T128 [US6] Write unit tests for DeleteGame use case at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/unit/use-cases/DeleteGame.test.ts`
- [X] T129 [US6] Implement DeleteGame use case with confirmation logic at `/Users/ookura.keisuke/repos/UsoHontoGame/src/server/application/use-cases/games/DeleteGame.ts`

### Server Actions (TDD)

- [ ] T130 [US6] Write integration tests for deleteGameAction at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/integration/api/game-actions.test.ts`
- [X] T131 [US6] Implement deleteGameAction with cascade delete at `/Users/ookura.keisuke/repos/UsoHontoGame/src/app/actions/game.ts`

### UI Components (TDD)

- [ ] T132 [US6] Write component tests for DeleteConfirmationModal at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/component/ui/DeleteConfirmationModal.test.tsx`
- [ ] T133 [US6] Implement DeleteConfirmationModal component at `/Users/ookura.keisuke/repos/UsoHontoGame/src/components/ui/Modal/DeleteConfirmationModal.tsx`

### E2E Tests

- [ ] T134 [US6] Write E2E test for deleting game in 準備中 status at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/e2e/game-deletion.spec.ts`
- [ ] T135 [US6] Write E2E test for confirmation modal for 出題中/締切 games at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/e2e/game-deletion.spec.ts`
- [ ] T136 [US6] Write E2E test for cascade delete (presenters/episodes removed) at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/e2e/game-deletion.spec.ts`
- [ ] T137 [US6] Write E2E test for authorization (only creator can delete) at `/Users/ookura.keisuke/repos/UsoHontoGame/tests/e2e/game-deletion.spec.ts`

**Independent Test Criteria**:
- ✅ Can delete game in 準備中 status without confirmation
- ✅ Confirmation modal appears for 出題中 or 締切 games
- ✅ Deletion cascades to remove all presenters and episodes
- ✅ Deleted game no longer appears in list
- ✅ Only creator can delete game (403 for others)

---

## Phase 9: Polish & Integration

**Purpose**: Final integration, performance optimization, error handling, and cross-feature testing.

### Integration & Performance

- [ ] T138 Run full test suite and ensure 95%+ coverage
- [ ] T139 Performance test: Verify game creation completes in <2 seconds
- [ ] T140 Performance test: Verify episode registration completes in <3 minutes
- [ ] T141 Performance test: Verify game list loads in <1 second for 50 games
- [ ] T142 Performance test: Verify status changes reflect on TOP page within 2 seconds

### Error Handling & Edge Cases

- [ ] T143 Add error boundaries for all page components at `/Users/ookura.keisuke/repos/UsoHontoGame/src/app/games/error.tsx`
- [ ] T144 Implement loading states for all async operations
- [ ] T145 Test edge case: Creating game with 0 or negative player limit
- [ ] T146 Test edge case: Adding 11th presenter (should fail)
- [ ] T147 Test edge case: Episode text exceeding 1000 characters
- [ ] T148 Test edge case: Presenter with only 2 episodes (should fail transition)
- [ ] T149 Test edge case: Presenter with 0 or 2+ lie markers (should fail)
- [ ] T150 Test edge case: Concurrent edits by multiple users

### Security Validation

- [ ] T151 Audit all Server Actions for proper authorization checks
- [ ] T152 Verify lie markers never exposed in public DTOs (EpisodeDto)
- [ ] T153 Test unauthorized access to edit/delete operations (403 responses)
- [ ] T154 Test session validation for all game operations

### Documentation & Code Quality

- [ ] T155 Add JSDoc comments to all public APIs and use cases
- [ ] T156 Update API documentation at `/Users/ookura.keisuke/repos/UsoHontoGame/specs/002-game-preparation/contracts/game-actions.yaml`
- [ ] T157 Run Biome linter and fix all issues
- [ ] T158 Review and refactor for code duplication

### Cross-Feature Integration

- [ ] T159 Verify games with status 出題中 appear on TOP page (from 001-session-top-page)
- [ ] T160 Test game visibility filtering on TOP page based on status
- [ ] T161 Verify session management integration (creator ID from cookies)
- [ ] T162 Test revalidation and cache invalidation for all mutations

---

## Task Summary

**Total Tasks**: 162
**By Phase**:
- Phase 1 (Setup): 8 tasks
- Phase 2 (Foundational): 34 tasks
- Phase 3 (US1 - P1): 21 tasks
- Phase 4 (US2 - P2): 22 tasks
- Phase 5 (US3 - P2): 12 tasks
- Phase 6 (US4 - P3): 19 tasks
- Phase 7 (US5 - P3): 11 tasks
- Phase 8 (US6 - P3): 10 tasks
- Phase 9 (Polish): 25 tasks

**Parallelizable Tasks**: 28 tasks marked with [P]

**Estimated Completion Time**:
- Phase 1: 1 day
- Phase 2: 3 days
- Phase 3: 2 days
- Phase 4: 2 days
- Phase 5: 1.5 days
- Phase 6: 2 days (can overlap with 4-5)
- Phase 7: 1.5 days
- Phase 8: 1 day (can overlap with 7)
- Phase 9: 2 days
**Total**: ~14-16 days with parallel execution

## Success Criteria Checklist

- [ ] SC-001: Game creation completes in under 2 minutes
- [ ] SC-002: Episode registration completes in under 3 minutes
- [ ] SC-003: Status changes reflect on TOP page within 2 seconds
- [ ] SC-004: Game list loads in under 1 second (up to 50 games)
- [ ] SC-005: 95%+ of moderators create first game without errors
- [ ] SC-006: Zero incidents of lie marker exposure
- [ ] SC-007: Game creation completion rate above 90%

## Notes

- All tasks follow TDD approach: tests written before implementation
- [P] marker indicates tasks that can be executed in parallel (different files, no dependencies)
- [US#] marker indicates which user story the task belongs to
- File paths are absolute from repository root
- Integration tests require database setup (Prisma with test database)
- E2E tests require running Next.js dev server
- Status transitions enforce business rules at domain entity level
- Confidential data (lie markers) protected by separate DTOs
- Cascade deletion handled at database level via Prisma
