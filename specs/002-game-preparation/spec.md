# Feature Specification: Game Preparation for Moderators

**Feature Branch**: `002-game-preparation`
**Created**: 2025-11-10
**Status**: Draft
**Input**: User description: "#### 3.2. ゲーム準備機能（主に司会者）

ゲーム開始前に必要な設定機能。

* 司会者はゲームを作成することができる。
  * 各ゲームは一意のUUIDを持つ
  * 各ゲームは参加できるPlayer数を設定できる。
  * 各ゲームは複数の出題者（1〜10人）を持つことができる。
    * 各出題者は３つのエピソードを登録できる
    * 入力した3つのエピソードのうち、どれが「ウソ(Lie)」であるかをシステムに登録（選択）できる（この正解情報は他の参加者には非公開となる）。
  * 各ゲームは準備中、出題中、締切の３つのステータスを持つ
* 司会者は作成したゲームを一覧で確認することができる。
  * 一覧からゲーム作成画面に遷移できる
  * 一覧から選択したゲームを編集できる
  * 一覧から選択したゲームを削除できる

関連する画面

* ゲーム作成画面
* ゲーム一覧画面
* ゲーム編集画面"

## User Scenarios & Testing

### User Story 1 - Create New Game (Priority: P1)

As a moderator, I want to create a new game so that players can participate in the truth-or-lie guessing activity.

**Why this priority**: This is the foundation of the feature - without game creation, no other functionality is possible. This represents the core value delivery.

**Independent Test**: Can be fully tested by creating a game with basic required information (player limit) and verifying it's stored with a unique identifier. This delivers immediate value by enabling games to exist in the system.

**Acceptance Scenarios**:

1. **Given** I'm logged in as a moderator, **When** I navigate to the game creation screen and submit a new game with a game name and player limit of 10, **Then** a unique game is created with the specified name and I'm redirected to the game list showing my newly created game
2. **Given** I'm creating a game, **When** I specify a player limit between 1 and 100, **Then** the game is created with that exact limit
3. **Given** I'm creating a game, **When** I don't specify a player limit, **Then** I receive a validation error and the game is not created
4. **Given** I'm creating a game, **When** I provide a game name, **Then** the game is created with that name instead of using the UUID as the default
5. **Given** I'm creating a game, **When** I add presenters and their episodes during game creation, **Then** the game is created with the presenters and episodes already configured

---

### User Story 2 - Register Presenters and Episodes (Priority: P2)

As a moderator, I want to add presenters to a game and have them register their episodes so that players have content to evaluate.

**Why this priority**: This is the content creation layer - games need presenters and episodes to be playable. This builds on P1 by adding the actual gameplay content.

**Independent Test**: Can be tested by adding presenters to an existing game, having them register 3 episodes each, and marking one as a lie. Delivers value by making games playable.

**Acceptance Scenarios**:

1. **Given** I have a game in 準備中 status, **When** I add a presenter and they register 3 episodes with one marked as a lie, **Then** the episodes are stored with the lie marker kept confidential
2. **Given** a presenter is registering episodes, **When** they try to mark more than one episode as a lie, **Then** the system prevents this and shows an error
3. **Given** I have a game with 1 presenter, **When** I attempt to add an 11th presenter, **Then** the system prevents this and shows the maximum limit of 10 presenters
4. **Given** a presenter has registered 3 episodes, **When** they view their episodes, **Then** they can see all 3 episodes and which one they marked as a lie, but other users cannot see the lie marker

---

### User Story 3 - Manage Game Status (Priority: P2)

As a moderator, I want to change game status from preparation to accepting responses to closed so that I can control the game flow.

**Why this priority**: Status management is essential for controlling when players can join and respond. This enables the moderation workflow.

**Independent Test**: Can be tested by transitioning a game through all three statuses (準備中 → 出題中 → 締切) and verifying access changes at each stage.

**Acceptance Scenarios**:

1. **Given** I have a game in 準備中 status with at least one presenter and episodes, **When** I change the status to 出題中, **Then** the game becomes visible on the TOP page for players to join
2. **Given** I have a game in 出題中 status, **When** I change it to 締切, **Then** the game no longer appears on the TOP page and no new responses are accepted
3. **Given** I have a game in 準備中 status with no presenters or episodes, **When** I try to change it to 出題中, **Then** the system prevents this and shows validation errors

---

### User Story 4 - View and Manage Game List (Priority: P3)

As a moderator, I want to view all my created games in a list so that I can manage them efficiently.

**Why this priority**: This is a convenience feature for managing multiple games. While important for usability, games can still be created and played without a comprehensive list view.

**Independent Test**: Can be tested by creating multiple games and verifying they all appear in the list with correct information and action buttons.

**Acceptance Scenarios**:

1. **Given** I'm logged in as a moderator, **When** I view my game list, **Then** I see all games I've created with their status, player limit, and presenter count
2. **Given** I'm viewing the game list, **When** I click on a game, **Then** I can view and edit that game's details
3. **Given** I'm viewing the game list, **When** I see the list is empty, **Then** I see a message with a button to create my first game

---

### User Story 5 - Edit Existing Game (Priority: P3)

As a moderator, I want to edit game details before it starts accepting responses so that I can correct mistakes or update information.

**Why this priority**: Editing is important for flexibility but not critical for MVP. Games can function with their initial settings.

**Independent Test**: Can be tested by editing a game's player limit and presenter information and verifying changes are saved.

**Acceptance Scenarios**:

1. **Given** I have a game in 準備中 status, **When** I edit the player limit from 10 to 15, **Then** the change is saved and reflected immediately
2. **Given** I have a game in 準備中 status, **When** I remove a presenter, **Then** that presenter and their episodes are removed from the game
3. **Given** I have a game in 出題中 or 締切 status, **When** I try to edit presenter information, **Then** the system prevents this to maintain game integrity

---

### User Story 6 - Delete Game (Priority: P3)

As a moderator, I want to delete games I no longer need so that my game list stays organized.

**Why this priority**: Deletion is a maintenance feature - nice to have but not critical for core functionality.

**Independent Test**: Can be tested by deleting a game and verifying it no longer appears in any list or view.

**Acceptance Scenarios**:

1. **Given** I have a game in 準備中 status, **When** I delete it, **Then** it's permanently removed from the system
2. **Given** I have a game in 出題中 or 締切 status, **When** I attempt to delete it, **Then** the system shows a confirmation warning about active players or completed responses
3. **Given** I'm about to delete a game, **When** the confirmation dialog appears, **Then** I can cancel the deletion to prevent accidental removal

---

### Edge Cases

- What happens when a moderator tries to create a game with a player limit of 0 or negative number?
- How does the system handle a presenter registering only 2 episodes instead of 3?
- What happens if a presenter forgets to mark which episode is the lie?
- How does the system behave when a moderator tries to add an 11th presenter?
- What happens if a moderator tries to change status from 締切 back to 出題中?
- How does the system handle deleting a game that has active player responses?
- What happens when two moderators try to edit the same game simultaneously?
- How does the system handle very long episode text (e.g., 10,000 characters)?
- What happens if a game has 0 presenters when trying to change to 出題中 status?

## Requirements

### Functional Requirements

- **FR-001**: System MUST assign a unique UUID to each game upon creation
- **FR-001a**: System MUST allow moderators to specify a custom game name when creating a game
- **FR-001b**: System MUST use the game name as the display name if provided, otherwise fallback to UUID
- **FR-002**: System MUST allow moderators to specify a player limit between 1 and 100 when creating a game
- **FR-003**: System MUST allow moderators to add between 1 and 10 presenters to a game
- **FR-003a**: System MUST allow moderators to add presenters and their episodes during game creation, not just after
- **FR-004**: System MUST allow each presenter to register exactly 3 episodes
- **FR-005**: System MUST allow each presenter to mark exactly one of their 3 episodes as a lie
- **FR-006**: System MUST keep the lie marker confidential - visible only to the presenter who created it and the moderator
- **FR-007**: System MUST support three game statuses: 準備中 (Preparation), 出題中 (Accepting Responses), 締切 (Closed)
- **FR-008**: System MUST initialize new games with 準備中 status
- **FR-009**: System MUST allow moderators to transition game status from 準備中 to 出題中
- **FR-010**: System MUST allow moderators to transition game status from 出題中 to 締切
- **FR-011**: System MUST prevent transitioning to 出題中 status if the game has fewer than 1 presenter with complete episodes
- **FR-012**: System MUST display all moderator-created games in a list view
- **FR-013**: System MUST allow moderators to edit game details when status is 準備中
- **FR-014**: System MUST restrict editing of presenter information when game status is 出題中 or 締切
- **FR-015**: System MUST allow moderators to delete games
- **FR-016**: System MUST show a confirmation dialog before deleting a game with status 出題中 or 締切
- **FR-017**: System MUST validate that player limit is a positive integer before saving
- **FR-018**: System MUST validate that each presenter has exactly 3 episodes before allowing status change to 出題中
- **FR-019**: System MUST validate that each presenter has marked exactly one episode as a lie before allowing status change to 出題中
- **FR-020**: System MUST provide navigation from game list to game creation screen
- **FR-021**: System MUST provide navigation from game list to game edit screen for each game

### Key Entities

- **Game**: Represents a truth-or-lie game session with unique identifier, optional custom name, player limit, presenters, status, and metadata (creation/update timestamps)
- **Presenter**: A participant who creates episodes for players to evaluate, associated with a specific game, can register 3 episodes
- **Episode**: A story or statement created by a presenter, with text content and a hidden truth/lie marker
- **Game Status**: An enumeration of three possible states (準備中, 出題中, 締切) that controls game visibility and edit permissions

## Success Criteria

### Measurable Outcomes

- **SC-001**: Moderators can create a new game with game name, player limit, and optionally presenters/episodes in under 2 minutes
- **SC-002**: Presenters can register all 3 episodes and mark the lie in under 3 minutes
- **SC-003**: Game status transitions are reflected in the TOP page within 2 seconds
- **SC-004**: The game list loads and displays all games in under 1 second for moderators with up to 50 games
- **SC-005**: 95% of moderators successfully create their first game without errors or support
- **SC-006**: Zero incidents of lie markers being exposed to unauthorized users
- **SC-007**: Game creation completion rate is above 90% (users who start don't abandon)

## Out of Scope

The following are explicitly out of scope for this feature:

- Player participation and response submission (separate feature)
- Voting and scoring mechanisms (separate feature)
- Real-time collaboration between moderators on same game
- Game templates or duplication
- Bulk operations (delete multiple games, copy settings, etc.)
- Advanced permissions (co-moderators, role-based access)
- Game archiving or soft-delete functionality
- Export/import game data
- Analytics or statistics on games
- Notifications to presenters when added to a game

## Dependencies

This feature depends on:

- Session management system (001-session-top-page) for moderator authentication
- TOP page (001-session-top-page) for displaying games in 出題中 status

## Assumptions

1. A moderator is a user with session/nickname established through the existing session management feature
2. There is no distinction between "moderator" and regular users - anyone with a session/nickname can create and moderate games (no separate role or permission system required)
3. Episode text has a maximum length of 1000 characters (reasonable for a story/statement)
4. Game name is optional during creation - if not provided, UUID serves as identifier/display name
5. Game name has a maximum length of 100 characters when provided
6. There is no time limit between status transitions (moderator has full control)
7. Presenters are identified by their session nickname from the existing system
8. When a moderator adds a presenter during game creation, they input the presenter's nickname and the system looks them up
9. Editing a game in 準備中 status includes adding/removing presenters, changing player limit, and modifying game name
10. Games deleted from the system are hard-deleted (no recovery mechanism in MVP)
11. Only the game creator (moderator) can edit or delete their games (no shared ownership)
12. When adding presenters during game creation, moderators can add multiple presenters and configure all their episodes before submitting the game
