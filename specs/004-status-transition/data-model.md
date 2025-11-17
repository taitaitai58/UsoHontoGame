# Data Model: Game Status Transition

**Feature**: Game Status Transition  
**Date**: 2025-11-17

## Entities

### Game (Enhanced)

**Existing Entity - No Schema Changes Required**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String (UUID) | Required | Unique game identifier |
| status | String | Required | One of: 準備中, 出題中, 締切 |
| creatorId | String | Required | Session ID of game moderator |
| playerLimit | Integer | Required | Max players (1-100) |
| createdAt | DateTime | Required | Creation timestamp |
| updatedAt | DateTime | Required | Last update timestamp |

**Status Transitions**:
- 準備中 → 出題中 (requires presenter validation)
- 出題中 → 締切 (requires confirmation)
- 締切 → (no transitions allowed)

### Presenter (Reference)

**Existing Entity - Used for Validation**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Required | Unique presenter ID |
| gameId | String | Required, Foreign Key | Reference to parent Game |
| nickname | String | Required | Presenter display name |
| episodes | Episode[] | Required | Must have exactly 3 |

### Episode (Reference)

**Existing Entity - Used for Validation**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Required | Unique episode ID |
| presenterId | String | Required, Foreign Key | Reference to parent Presenter |
| text | String | Required | Episode content (1-1000 chars) |
| isLie | Boolean | Required | Whether this is the lie episode |

## Validation Rules

### Status Transition Validation

1. **準備中 → 出題中**:
   - Game must have at least 1 presenter
   - Each presenter must have exactly 3 episodes
   - Each presenter must have exactly 1 episode where isLie = true
   - Requester must be game creator (session validation)

2. **出題中 → 締切**:
   - Current status must be 出題中
   - Confirmation required (UI level)
   - Requester must be game creator

3. **締切 → Any**:
   - No transitions allowed
   - Returns error: "締切状態のゲームは変更できません"

## State Machine

```
┌─────────┐     Valid Presenters    ┌─────────┐      Confirmation      ┌─────────┐
│ 準備中  │ ───────────────────────> │ 出題中  │ ───────────────────> │  締切   │
└─────────┘                          └─────────┘                       └─────────┘
     │                                    │                                 │
     │ No Presenters                      │ No Confirmation                 │
     ↓ Error                              ↓ Remains                         │
  "出題者が必要です"                    "出題中"                          No transitions
```

## Error Codes

| Code | Message | Context |
|------|---------|---------|
| INVALID_STATUS_TRANSITION | 無効なステータス遷移です | Attempting invalid transition |
| NO_PRESENTERS | ゲームを開始するには出題者が必要です | 準備中→出題中 with no presenters |
| INCOMPLETE_PRESENTER | 出題者 {nickname} のエピソードが不完全です | Presenter missing episodes |
| INVALID_LIE_COUNT | 出題者 {nickname} はウソを1つ選択する必要があります | Not exactly 1 lie |
| GAME_ALREADY_CLOSED | 締切状態のゲームは変更できません | Attempting to change 締切 game |
| UNAUTHORIZED | このゲームを変更する権限がありません | Non-creator attempting change |

## Database Operations

### Read Operations
- `findGameById(gameId)` - Get current game state
- `findPresentersByGameId(gameId)` - Get all presenters for validation
- `findEpisodesByPresenterId(presenterId)` - Get episodes for validation

### Write Operations  
- `updateGameStatus(gameId, newStatus)` - Atomic status update
- No cascade operations required (status change only)

## Transaction Requirements

Status updates must be atomic:
1. Validate current status
2. Validate transition rules
3. Update status field
4. Update updatedAt timestamp
5. Commit or rollback entire operation

## Performance Considerations

- Validation queries should use indexes on gameId and presenterId
- Status field should be indexed for filtering
- Presenter/Episode validation can be cached during game session
- Expected < 100ms for validation, < 500ms for complete transition