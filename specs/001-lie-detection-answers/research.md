# Research & Design Decisions: 嘘当て回答機能

**Feature**: Answer submission for lie detection game
**Date**: 2025-01-19
**Status**: Research Complete

## Overview

This document consolidates technical research and design decisions for implementing the answer submission feature. All technical unknowns from the planning phase have been resolved based on existing project patterns and best practices.

## Technical Decisions

### 1. Session Management Pattern

**Decision**: Cookie-based session with nanoid for session IDs

**Rationale**:
- Existing pattern in project (001-session-top-page already uses cookies)
- No external authentication required
- Lightweight and sufficient for participant tracking
- Works with Next.js Server Components and Server Actions
- Session persists across page refreshes

**Alternatives Considered**:
- JWT tokens: Unnecessary complexity for simple session tracking
- Database sessions: Adds storage overhead, cookies sufficient for this use case
- localStorage only: Won't work with Server Components, no server-side validation

**Implementation Notes**:
- Use existing `getSession()` and `setSession()` utilities
- Session includes: sessionId (nanoid), nickname
- Cookie name: `session` (consistent with existing implementation)

### 2. Answer Storage & Overwrite Strategy

**Decision**: Upsert pattern with composite unique constraint

**Rationale**:
- Supports answer overwrite requirement (FR-013)
- Ensures one answer per session per game
- Atomic operation prevents race conditions
- Prisma provides built-in upsert support

**Database Schema**:
```prisma
model Answer {
  id          String   @id @default(cuid())
  sessionId   String
  gameId      String
  nickname    String
  selections  Json     // { presenterId: episodeId }
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  game        Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)

  @@unique([sessionId, gameId]) // Ensures one answer per session per game
  @@index([gameId])
  @@index([sessionId])
}
```

**Alternatives Considered**:
- Separate versioning table: Too complex for overwrite-only requirement
- Soft delete old answers: Unnecessary history tracking
- Multiple answers with "active" flag: Complicates queries

### 3. Participant Limit Tracking

**Decision**: Separate Participation table with count check

**Rationale**:
- Separates concern of "participation" from "answer submission"
- Allows participation tracking before complete answer
- Enables accurate count even if answers incomplete/deleted
- Clear audit trail

**Database Schema**:
```prisma
model Participation {
  id          String   @id @default(cuid())
  sessionId   String
  gameId      String
  nickname    String
  joinedAt    DateTime @default(now())

  game        Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)

  @@unique([sessionId, gameId]) // One participation record per session per game
  @@index([gameId])
}
```

**Alternatives Considered**:
- Count answers directly: Doesn't handle incomplete submissions
- Store count in Game model: Requires manual synchronization, prone to inconsistency
- Track in memory/cache: Loses data on restart, not suitable for participant limits

### 4. Game Status Validation Timing

**Decision**: Validate at both access time and submission time

**Rationale**:
- Access time validation (FR-010): Prevents wasted user effort
- Submission time re-validation (FR-014): Ensures data integrity (status may change during selection)
- Defense in depth approach
- Aligns with clarification Q3 (strict cutoff)

**Implementation Pattern**:
```typescript
// Access time (Server Component / Server Action - page load)
const game = await validateGameForAnswers(gameId);
if (game.status !== '出題中') {
  redirect('/') // or show error
}

// Submission time (Server Action)
const game = await getGame(gameId);
if (game.status !== '出題中') {
  return { error: 'このゲームは既に締め切られました' };
}
```

**Alternatives Considered**:
- Access time only: Risk of stale data, race condition
- Submission time only: Poor UX, user wastes effort
- Optimistic locking with version field: Unnecessarily complex for this use case

### 5. Client-Side Selection Persistence

**Decision**: localStorage with game-scoped key

**Rationale**:
- Satisfies clarification Q5 (Option B - browser persistence)
- Survives page refresh and temporary network loss
- No server communication overhead during selection
- Simple implementation with clear lifecycle

**Implementation Pattern**:
```typescript
// Key format: `answer-draft-${gameId}`
const STORAGE_KEY = (gameId: string) => `answer-draft-${gameId}`;

// Save on each selection
function handleEpisodeSelect(presenterId: string, episodeId: string) {
  const draft = { ...selections, [presenterId]: episodeId };
  setSelections(draft);
  localStorage.setItem(STORAGE_KEY(gameId), JSON.stringify(draft));
}

// Restore on page load
useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY(gameId));
  if (saved) {
    setSelections(JSON.parse(saved));
  }
}, [gameId]);

// Clear after successful submission
function handleSuccess() {
  localStorage.removeItem(STORAGE_KEY(gameId));
}
```

**Alternatives Considered**:
- No persistence: Poor UX, loses work on refresh
- Server-side draft saving: Adds complexity, requires network for each selection
- IndexedDB: Overkill for simple key-value storage

### 6. Presenter & Episode Data Fetching

**Decision**: Single denormalized query with presenters and episodes

**Rationale**:
- Reduces round trips (1 query vs N+1)
- Prisma supports nested includes
- Episode count validation (FR-015) done in same query
- Data locality for faster rendering

**Query Pattern**:
```typescript
const game = await prisma.game.findUnique({
  where: { id: gameId },
  include: {
    presenters: {
      include: {
        episodes: {
          select: { id: true, content: true, isLie: false } // Don't expose isLie!
        }
      }
    }
  }
});

// Validate presenter count
if (game.presenters.length === 0) {
  throw new Error('このゲームには出題者がいません');
}
```

**Alternatives Considered**:
- Separate queries: Multiple round trips, slower
- GraphQL: Not in project stack, unnecessary for this use case
- Presenter count stored in Game: Synchronization overhead, computed is simpler

### 7. Validation Strategy

**Decision**: Layered validation (Zod schema → Use Case → Domain Entity)

**Rationale**:
- Aligns with existing project patterns
- Zod at API boundary for runtime validation
- Use Case for business rules (limits, status, presenter count)
- Entity for invariants (answer completeness, selection validity)

**Validation Layers**:
```typescript
// Layer 1: Zod schema (API boundary)
const SubmitAnswerSchema = z.object({
  gameId: z.string(),
  selections: z.record(z.string(), z.string()) // { presenterId: episodeId }
});

// Layer 2: Use Case (business rules)
class SubmitAnswer {
  async execute(request: SubmitAnswerRequest) {
    // Validate game status
    // Validate participant limit
    // Validate presenter count
    // Check all presenters have selection
  }
}

// Layer 3: Entity (invariants)
class Answer {
  static create(props) {
    // Validate selections not empty
    // Validate episode IDs exist for each presenter
  }
}
```

**Alternatives Considered**:
- Single validation layer: Mixes concerns, hard to test
- Validation in components: Business logic leaks into UI
- Database constraints only: Late validation, poor error messages

### 8. Error Handling & User Feedback

**Decision**: Typed error responses with user-friendly Japanese messages

**Rationale**:
- Consistent with FR-011 (clear error messages)
- Type-safe error handling
- Japanese messages for user-facing errors
- English for developer logs

**Error Pattern**:
```typescript
type AnswerSubmissionError =
  | { type: 'GAME_NOT_FOUND'; message: 'ゲームが見つかりません' }
  | { type: 'GAME_CLOSED'; message: 'このゲームは既に締め切られました' }
  | { type: 'PARTICIPANT_LIMIT'; message: '参加人数が上限に達しました' }
  | { type: 'NO_PRESENTERS'; message: 'このゲームには出題者がいません' }
  | { type: 'INCOMPLETE_ANSWERS'; message: '全ての出題者の嘘を選択してください' };

type SubmitAnswerResult =
  | { success: true; answerId: string }
  | { success: false; error: AnswerSubmissionError };
```

**Alternatives Considered**:
- Exception throwing: Hard to type, uncaught exceptions possible
- String error messages: Not type-safe, prone to typos
- Error codes only: Poor DX, requires lookup table

## Integration Points

### 1. Existing Game Management (002-game-preparation)

**Integration**: Use existing Game entity and repository

**Dependencies**:
- `IGameRepository.findById()` - Fetch game with presenters/episodes
- Game entity `status` field - Validate game state
- Game entity `maxParticipants` field - Check participant limits

**No Changes Required**: Game management feature remains unchanged, answer feature reads from existing data

### 2. Session Management (001-session-top-page)

**Integration**: Use existing session utilities

**Dependencies**:
- `getSession()` from session utils - Read participant session
- `sessionId` and `nickname` from session cookie
- Session middleware for authenticated routes

**No Changes Required**: Session feature remains unchanged

### 3. TOP Page (001-session-top-page)

**Integration**: Filter game list to show only "出題中" games

**Changes Required**: Update game list query to filter by status

**Implementation**:
```typescript
// Update in TopPage or game list component
const games = await gameRepository.findAll({
  where: { status: '出題中' }
});
```

## Performance Considerations

### Query Optimization

**Answer Submission**:
- Single upsert operation: O(1)
- Indexed by sessionId and gameId: Fast lookups
- Cascade delete with Game: Automatic cleanup

**Participation Count**:
- Count query with index: O(1) with proper indexing
- `@@index([gameId])` on Participation model

**Game Fetch**:
- Single query with nested includes: 1 round trip
- Episode data cached in component state during selection

### Expected Performance

Based on Technical Context goals:
- Answer submission: <200ms (upsert + validation)
- Game list retrieval: <100ms (indexed query + filter)
- Answer screen load: <300ms (game fetch + episodes)

**Bottlenecks to Monitor**:
- Large number of episodes per game (>20): Consider pagination
- High concurrent submissions: SQLite write lock contention

## Testing Strategy

### Unit Tests
- Answer entity validation
- Use case business logic (status, limits, presenter checks)
- Hook logic (selection state, localStorage sync)
- Repository methods (upsert, count, find)

### Integration Tests
- Full answer submission flow (session → validate → upsert)
- Participant limit enforcement
- Answer overwrite behavior
- Status transition during submission

### E2E Tests
- Complete participant journey (TOP → answer screen → submit)
- Error states (closed game, no presenters, limit reached)
- Selection persistence across refresh

### Test Data Requirements
- Games in different states (準備中, 出題中, 締切)
- Games with varying participant limits (0, 5, 100)
- Games with 0, 1, multiple presenters
- Sessions with and without existing answers

## Open Questions & Risks

### Resolved Questions (from clarifications)

✅ Q: How to handle duplicate submissions? → A: Overwrite until deadline (FR-013)
✅ Q: How to identify participants? → A: Session-based with cookies (FR-012)
✅ Q: Status change during submission? → A: Strict cutoff, reject with error (FR-014)
✅ Q: Game with no presenters? → A: Block access with validation (FR-015)
✅ Q: Network loss during selection? → A: localStorage persistence (clarification Q5)

### Remaining Edge Cases

⚠️ **Long session duration** (Edge case): Participant stays on answer screen for >1 hour
- **Risk**: Session expiration, lost work
- **Mitigation**: Consider session refresh on activity, or accept as edge case (participants should complete quickly)

⚠️ **Concurrent presenter deletion** (Edge case): Moderator deletes presenter while participant is selecting
- **Risk**: Invalid episode selection references
- **Mitigation**: Validate episode IDs at submission time, show error if invalid

⚠️ **SQLite write contention** (Performance): Multiple concurrent answer submissions
- **Risk**: Database locked errors
- **Mitigation**: Monitor performance, consider WAL mode for SQLite, or migrate to PostgreSQL if needed

### Assumptions

1. **Presenter/episode data is stable during game "出題中" state**: Moderators do not modify presenters/episodes after publishing
2. **Session cookies are secure and tamper-proof**: Using httpOnly, secure flags
3. **Participant limits are soft constraints**: Minor race condition acceptable (e.g., 101 participants in 100-limit game)
4. **Answer data does not require audit trail**: Overwrite is acceptable, no history needed

## Next Steps

1. ✅ Research complete - All technical decisions documented
2. **Phase 1**: Generate data-model.md with full entity specifications
3. **Phase 1**: Generate API contracts in contracts/ directory
4. **Phase 1**: Generate quickstart.md for developer onboarding
5. **Phase 1**: Update CLAUDE.md with new technologies (if any)
6. **Phase 2**: Generate tasks.md with dependency-ordered implementation tasks

## References

- Feature Specification: [spec.md](./spec.md)
- Implementation Plan: [plan.md](./plan.md)
- Constitution: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)
- Existing patterns: Game management (002-game-preparation), Session management (001-session-top-page)
