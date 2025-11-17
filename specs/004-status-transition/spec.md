# Feature Specification: Game Status Transition

**Feature Branch**: `004-status-transition`  
**Created**: 2025-11-17  
**Status**: Draft  
**Input**: User description: "以下の要件の通り、ゲームのステータスを変更する機能をゲーム詳細画面に追加してください。
    * ゲーム編集画面からステータスを変更することができる。
      * 準備中の場合は出題中にだけ変更することができる
      * 出題中の場合は締切にだけ変更することができる
      * 締切の場合はステータスの変更ができない"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start Game from Preparation (Priority: P1)

As a game moderator, I want to transition my game from "準備中" (preparing) to "出題中" (accepting responses) so that players can start participating in the game.

**Why this priority**: This is the primary flow that enables games to become playable. Without this transition, prepared games cannot accept player responses.

**Independent Test**: Can be fully tested by creating a game in 準備中 status and verifying the transition to 出題中 status occurs successfully.

**Acceptance Scenarios**:

1. **Given** a game is in 準備中 status and has at least one complete presenter, **When** the moderator clicks the status change button, **Then** the game transitions to 出題中 status
2. **Given** a game is in 準備中 status with no presenters, **When** the moderator attempts to change status, **Then** an error message explains that presenters are required
3. **Given** a game is in 準備中 status with incomplete presenter data, **When** the moderator attempts to change status, **Then** an error message identifies what is missing

---

### User Story 2 - Close Game from Active State (Priority: P2)

As a game moderator, I want to transition my game from "出題中" (accepting responses) to "締切" (closed) so that I can end the game and prevent further responses.

**Why this priority**: Allows moderators to control when games end, essential for managing game sessions and preventing late submissions.

**Independent Test**: Can be tested by setting a game to 出題中 status and verifying it can be transitioned to 締切 status.

**Acceptance Scenarios**:

1. **Given** a game is in 出題中 status, **When** the moderator clicks the close game button, **Then** a confirmation dialog appears
2. **Given** a game is in 出題中 status, **When** the moderator confirms closure, **Then** the game transitions to 締切 status
3. **Given** a game is in 出題中 status, **When** the moderator cancels the closure dialog, **Then** the game remains in 出題中 status

---

### User Story 3 - View Current Status and Available Actions (Priority: P3)

As a game moderator, I want to clearly see my game's current status and what transitions are available so that I understand what actions I can take.

**Why this priority**: Provides clear visual feedback about game state and prevents confusion about available actions.

**Independent Test**: Can be tested by viewing games in each status and verifying correct UI elements are displayed.

**Acceptance Scenarios**:

1. **Given** a game is in 準備中 status, **When** viewing the game detail page, **Then** only the "Start Game" transition button is visible
2. **Given** a game is in 出題中 status, **When** viewing the game detail page, **Then** only the "Close Game" transition button is visible
3. **Given** a game is in 締切 status, **When** viewing the game detail page, **Then** no status transition buttons are visible
4. **Given** any game status, **When** viewing the game detail page, **Then** the current status is prominently displayed

---

### Edge Cases

- What happens when multiple moderators try to change status simultaneously?
- How does system handle status changes when players are actively submitting responses?
- What happens if a status change request fails due to network issues?
- How are in-progress player sessions handled when a game is closed?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display current game status prominently on the game detail page
- **FR-002**: System MUST only allow status transition from 準備中 to 出題中
- **FR-003**: System MUST only allow status transition from 出題中 to 締切
- **FR-004**: System MUST prevent any status changes when game is in 締切 status
- **FR-005**: System MUST validate that game has at least one complete presenter before allowing 準備中 to 出題中 transition
- **FR-006**: System MUST validate that each presenter has exactly 3 episodes with exactly 1 marked as lie before allowing status transition
- **FR-007**: System MUST show confirmation dialog before transitioning from 出題中 to 締切
- **FR-008**: System MUST provide clear error messages when status transition is not allowed
- **FR-009**: System MUST update UI immediately after successful status change
- **FR-010**: System MUST prevent status changes by non-moderators
- **FR-011**: System MUST handle concurrent status change attempts gracefully
- **FR-012**: System MUST preserve all game data when status changes

### Key Entities *(include if feature involves data)*

- **Game Status**: Represents the current state of a game (準備中, 出題中, or 締切)
- **Status Transition**: Represents a change from one valid status to another with timestamp and moderator information
- **Transition Validation**: Business rules that determine if a status transition is allowed

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Moderators can change game status from 準備中 to 出題中 in under 5 seconds
- **SC-002**: Moderators can close a game (出題中 to 締切) with confirmation in under 10 seconds
- **SC-003**: 100% of invalid transition attempts display clear error messages within 2 seconds
- **SC-004**: Status changes reflect in the UI within 1 second of confirmation
- **SC-005**: Zero data loss occurs during status transitions
- **SC-006**: 95% of moderators successfully complete status transitions on first attempt

## Assumptions

- Moderators are already authenticated and authorized to manage their games
- Games have a single moderator who created them
- Status transitions are permanent and cannot be reversed
- Network connectivity is generally stable
- Browser supports modern web standards
- Status validation rules are consistent across all game types

## Out of Scope

- Bulk status changes for multiple games
- Scheduled or automatic status transitions
- Status change notifications to players
- Rollback or undo functionality for status changes
- Custom status types beyond the three specified
- Status change history or audit log viewing