# Feature Specification: TOP Active Games Display

**Feature Branch**: `005-top-active-games`
**Created**: 2025-11-18
**Status**: Draft
**Input**: User description: "* TOP画面 * /にアクセスすると表示される画面 * 現在、出題中のゲームの一覧が表示される"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Active Games (Priority: P1)

As a player visiting the application, I want to see all currently active games on the TOP page so that I can quickly find games to participate in without navigating through multiple pages.

**Why this priority**: This is the core functionality that provides immediate value by showing available games to players. Without this, users have no way to discover ongoing games.

**Independent Test**: Can be fully tested by accessing the TOP page (/) and verifying that games with "出題中" status are displayed while games with other statuses are not shown.

**Acceptance Scenarios**:

1. **Given** multiple games exist with "出題中" status, **When** a user accesses the TOP page (/), **Then** all games with "出題中" status are displayed in the list
2. **Given** games exist with mixed statuses (準備中, 出題中, 締切), **When** a user accesses the TOP page, **Then** only games with "出題中" status appear in the list
3. **Given** no games with "出題中" status exist, **When** a user accesses the TOP page, **Then** an informative empty state message is displayed

---

### User Story 2 - Game Information Display (Priority: P2)

As a player viewing the active games list, I want to see essential information about each game so that I can make an informed decision about which game to join.

**Why this priority**: Provides context for users to choose between multiple active games, improving user experience and engagement.

**Independent Test**: Can be tested by verifying that each game card/item in the list displays the required information fields clearly and accurately.

**Acceptance Scenarios**:

1. **Given** active games are displayed, **When** a user views the list, **Then** each game shows its title, creation date/time, and current player count
2. **Given** a game has a player limit set, **When** displayed in the list, **Then** the player capacity is shown (e.g., "5/10 players")

---

### User Story 3 - Navigate to Game Details (Priority: P2)

As a player browsing active games, I want to click on a game to view its full details and participate, enabling seamless navigation from discovery to participation.

**Why this priority**: Enables the primary user flow from game discovery to participation, essential for user engagement.

**Independent Test**: Can be tested by clicking on any game in the list and verifying navigation to the correct game detail page.

**Acceptance Scenarios**:

1. **Given** active games are displayed, **When** a user clicks on a game title or card, **Then** they are navigated to the game detail page for that specific game
2. **Given** a user is viewing the active games list, **When** they interact with a game entry, **Then** visual feedback indicates the interaction (hover states, click states)

---

### User Story 4 - Auto-refresh Active Games (Priority: P3)

As a player viewing the TOP page, I want the list of active games to automatically update so that I always see the most current available games without manual refresh.

**Why this priority**: Enhances user experience by keeping information current, but the core functionality works without it.

**Independent Test**: Can be tested by leaving the TOP page open while game statuses change in another session and verifying the list updates automatically.

**Acceptance Scenarios**:

1. **Given** a user is viewing the TOP page, **When** a game status changes from "準備中" to "出題中" elsewhere, **Then** the game appears in the list within 30 seconds without page refresh
2. **Given** a user is viewing the TOP page, **When** a game status changes from "出題中" to "締切" elsewhere, **Then** the game is removed from the list within 30 seconds without page refresh

---

### Edge Cases

- What happens when there are no active games (all games are in 準備中 or 締切 status)?
- How does the system handle when a large number of active games exist (more than can fit on screen)?
- What happens if a game status changes while a user is clicking on it?
- How does the system handle network connectivity issues during auto-refresh?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display only games with "出題中" (active/accepting responses) status on the TOP page
- **FR-002**: System MUST show game title for each active game in the list
- **FR-003**: System MUST show creation timestamp for each active game
- **FR-004**: System MUST display current player count for each active game
- **FR-005**: System MUST display player capacity when a limit is set (e.g., "5/10")
- **FR-006**: System MUST provide navigation from each game in the list to its detail page
- **FR-007**: System MUST display an informative message when no active games exist
- **FR-008**: System MUST order games by [NEEDS CLARIFICATION: ordering criteria not specified - newest first, most players, or alphabetical?]
- **FR-009**: Games list SHOULD automatically refresh every 30 seconds to show current state
- **FR-010**: System MUST handle pagination or scrolling when more than 20 active games exist

### Key Entities *(include if feature involves data)*

- **Game**: Represents a game session with status (準備中/出題中/締切), title, creation timestamp, creator, and player information
- **GameListItem**: Display representation of a game showing essential information (title, status, player count, creation time)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify and access an active game within 10 seconds of landing on the TOP page
- **SC-002**: The page loads and displays active games within 2 seconds on standard network connections
- **SC-003**: 95% of users successfully navigate from the TOP page to a game detail page on their first attempt
- **SC-004**: The system can display up to 100 active games simultaneously without performance degradation
- **SC-005**: Auto-refresh updates the game list within 30 seconds of status changes without user intervention
- **SC-006**: Empty state message is displayed within 1 second when no active games exist

## Assumptions

- Games have three possible statuses: 準備中 (preparation), 出題中 (active/accepting responses), and 締切 (closed)
- The TOP page is the root path (/) of the application
- Users can access the TOP page without authentication (public access)
- Game information is already available in the system from previously implemented features
- Default sorting order for games is by creation date (newest first) unless specified otherwise