# Data Model: 嘘当て回答機能

**Feature**: Answer submission for lie detection game
**Date**: 2025-01-19
**Status**: Design Complete

## Overview

This document defines the complete data model for the answer submission feature, including entities, value objects, relationships, and validation rules derived from the functional requirements in the feature specification.

## Entity Relationship Diagram

```
┌─────────────────┐
│      Game       │
│                 │
│  - id           │
│  - title        │
│  - status       │◄──────┐
│  - maxParticip..│       │
└─────────────────┘       │
         │                │
         │ 1              │
         │                │
         │ *              │
         ▼                │
┌─────────────────┐       │
│   Presenter     │       │
│                 │       │
│  - id           │       │
│  - gameId       │───────┘
│  - name         │
└─────────────────┘
         │
         │ 1
         │
         │ *
         ▼
┌─────────────────┐       ┌─────────────────┐
│    Episode      │       │     Answer      │
│                 │       │                 │
│  - id           │◄──┐   │  - id           │
│  - presenterId  │   │   │  - sessionId    │
│  - content      │   │   │  - gameId       │───────┐
│  - isLie        │   │   │  - nickname     │       │
└─────────────────┘   │   │  - selections   │       │
                      │   │  - createdAt    │       │
                      │   │  - updatedAt    │       │
                      │   └─────────────────┘       │
                      │            │                │
                      │            │ *              │
                      │            │                │
                      │            │ 1              │
                      │            ▼                │
                      │   ┌─────────────────┐       │
                      │   │ Participation   │       │
                      │   │                 │       │
                      │   │  - id           │       │
                      │   │  - sessionId    │       │
                      └───│  - gameId       │───────┘
                          │  - nickname     │
                          │  - joinedAt     │
                          └─────────────────┘

  selections: JSON { presenterId: episodeId }
```

## Domain Entities

### 1. Answer Entity

**Purpose**: Represents a participant's answer submission for a game, recording which episode they believe is a lie for each presenter.

**Source Requirements**: FR-006, FR-012, FR-013, SC-004

**Properties**:

| Property | Type | Required | Validation | Description |
|----------|------|----------|------------|-------------|
| id | string | Yes | cuid() | Unique identifier |
| sessionId | string | Yes | Non-empty | Session cookie identifier |
| gameId | string | Yes | Valid Game.id | Reference to game |
| nickname | string | Yes | Length 1-20 | Participant display name from session |
| selections | object | Yes | All presenters mapped | Map of presenterId to episodeId |
| createdAt | DateTime | Yes | Auto | Initial submission timestamp |
| updatedAt | DateTime | Yes | Auto | Last update timestamp |

**Invariants**:
- Selections must include exactly one episode per presenter in the game
- All presenter IDs in selections must be valid presenters for the game
- All episode IDs in selections must be valid episodes for their respective presenters
- sessionId + gameId combination must be unique (enforced at DB level)

**Business Rules** (from Use Case layer):
- Can only be created/updated when game status is "出題中" (FR-010, FR-014)
- Overwrites previous answer from same session (FR-013)
- Cannot be modified after game status changes to "締切"

**TypeScript Interface**:
```typescript
interface Answer {
  id: string;
  sessionId: string;
  gameId: string;
  nickname: string;
  selections: Record<string, string>; // { presenterId: episodeId }
  createdAt: Date;
  updatedAt: Date;
}

// Domain Entity Class
class AnswerEntity {
  private constructor(
    public readonly id: string,
    public readonly sessionId: string,
    public readonly gameId: string,
    public readonly nickname: string,
    public readonly selections: Map<string, string>,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(props: {
    sessionId: string;
    gameId: string;
    nickname: string;
    selections: Record<string, string>;
  }): AnswerEntity {
    // Validate selections not empty
    if (Object.keys(props.selections).length === 0) {
      throw new Error('Selections cannot be empty');
    }

    // Validate nickname
    if (props.nickname.length === 0 || props.nickname.length > 20) {
      throw new Error('Nickname must be between 1 and 20 characters');
    }

    return new AnswerEntity(
      cuid(),
      props.sessionId,
      props.gameId,
      props.nickname,
      new Map(Object.entries(props.selections)),
      new Date(),
      new Date()
    );
  }

  toJSON(): Answer {
    return {
      id: this.id,
      sessionId: this.sessionId,
      gameId: this.gameId,
      nickname: this.nickname,
      selections: Object.fromEntries(this.selections),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
```

### 2. Participation Entity

**Purpose**: Tracks participant enrollment in a game, separate from answer completion, to enforce participant limits accurately.

**Source Requirements**: FR-008, FR-009, User Story 2

**Properties**:

| Property | Type | Required | Validation | Description |
|----------|------|----------|------------|-------------|
| id | string | Yes | cuid() | Unique identifier |
| sessionId | string | Yes | Non-empty | Session cookie identifier |
| gameId | string | Yes | Valid Game.id | Reference to game |
| nickname | string | Yes | Length 1-20 | Participant display name |
| joinedAt | DateTime | Yes | Auto | Enrollment timestamp |

**Invariants**:
- sessionId + gameId combination must be unique (enforced at DB level)
- Nickname must match session nickname at time of joining

**Business Rules** (from Use Case layer):
- Created when participant first accesses answer screen (FR-002)
- Count of participations for a game must not exceed game.maxParticipants (FR-008)
- Once created, persists even if answer not submitted
- Cascade deleted when game is deleted

**TypeScript Interface**:
```typescript
interface Participation {
  id: string;
  sessionId: string;
  gameId: string;
  nickname: string;
  joinedAt: Date;
}

// Domain Entity Class
class ParticipationEntity {
  private constructor(
    public readonly id: string,
    public readonly sessionId: string,
    public readonly gameId: string,
    public readonly nickname: string,
    public readonly joinedAt: Date
  ) {}

  static create(props: {
    sessionId: string;
    gameId: string;
    nickname: string;
  }): ParticipationEntity {
    // Validate nickname
    if (props.nickname.length === 0 || props.nickname.length > 20) {
      throw new Error('Nickname must be between 1 and 20 characters');
    }

    return new ParticipationEntity(
      cuid(),
      props.sessionId,
      props.gameId,
      props.nickname,
      new Date()
    );
  }

  toJSON(): Participation {
    return {
      id: this.id,
      sessionId: this.sessionId,
      gameId: this.gameId,
      nickname: this.nickname,
      joinedAt: this.joinedAt
    };
  }
}
```

## Value Objects

### 1. SessionId

**Purpose**: Identifies a participant across requests using session cookie value.

**Source Requirements**: FR-012

**Properties**:
- value: string (nanoid format, 21 characters)

**Invariants**:
- Must be non-empty
- Must be valid nanoid format

**TypeScript**:
```typescript
class SessionId {
  private constructor(public readonly value: string) {}

  static create(value: string): SessionId {
    if (!value || value.length === 0) {
      throw new Error('SessionId cannot be empty');
    }
    // nanoid typically generates 21-character strings
    if (value.length !== 21) {
      throw new Error('Invalid SessionId format');
    }
    return new SessionId(value);
  }

  toString(): string {
    return this.value;
  }
}
```

### 2. EpisodeSelection

**Purpose**: Represents a single presenter-episode selection pair within an answer.

**Source Requirements**: FR-004, FR-005

**Properties**:
- presenterId: string
- episodeId: string

**Invariants**:
- Both IDs must be non-empty
- Episode must belong to the specified presenter (validated at use case layer)

**TypeScript**:
```typescript
class EpisodeSelection {
  private constructor(
    public readonly presenterId: string,
    public readonly episodeId: string
  ) {}

  static create(presenterId: string, episodeId: string): EpisodeSelection {
    if (!presenterId || !episodeId) {
      throw new Error('Presenter and Episode IDs must be provided');
    }
    return new EpisodeSelection(presenterId, episodeId);
  }
}
```

## Extended Models (from existing features)

### Game Entity (from 002-game-preparation)

**Relevant Properties for Answer Feature**:

| Property | Type | Description | Usage in Answer Feature |
|----------|------|-------------|-------------------------|
| id | string | Unique identifier | Foreign key in Answer, Participation |
| status | enum | 準備中/出題中/締切 | Validation for answer submission (FR-010, FR-014) |
| maxParticipants | number \| null | Participant limit | Enforcement of participation limit (FR-008, FR-009) |
| presenters | Presenter[] | Related presenters | Source of presenter data for answer screen |

**Status Transition Relevant to Answers**:
- 準備中 → 出題中: Answers become allowed
- 出題中 → 締切: Answers no longer accepted, existing answers locked

### Presenter Entity (from 003-presenter-episode-inline)

**Relevant Properties for Answer Feature**:

| Property | Type | Description | Usage in Answer Feature |
|----------|------|-------------|-------------------------|
| id | string | Unique identifier | Key in Answer.selections |
| gameId | string | Parent game | Validation of presenter belongs to game |
| name | string | Presenter name | Display in answer screen |
| episodes | Episode[] | Related episodes | Options for answer selection |

### Episode Entity (from 003-presenter-episode-inline)

**Relevant Properties for Answer Feature**:

| Property | Type | Description | Usage in Answer Feature |
|----------|------|-------------|-------------------------|
| id | string | Unique identifier | Value in Answer.selections |
| presenterId | string | Parent presenter | Validation of episode belongs to presenter |
| content | string | Episode text | Display in answer screen |
| isLie | boolean | Truth flag | **MUST NOT be exposed to client** |

**Security Note**: The `isLie` field must NEVER be included in API responses to clients during the "出題中" phase. Only moderators should see this after "締切".

## Database Schema (Prisma)

```prisma
// New models for answer feature

model Answer {
  id          String   @id @default(cuid())
  sessionId   String
  gameId      String
  nickname    String
  selections  Json     // { presenterId: episodeId }
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  game        Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)

  @@unique([sessionId, gameId])
  @@index([gameId])
  @@index([sessionId])
  @@map("answers")
}

model Participation {
  id          String   @id @default(cuid())
  sessionId   String
  gameId      String
  nickname    String
  joinedAt    DateTime @default(now())

  game        Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)

  @@unique([sessionId, gameId])
  @@index([gameId])
  @@map("participations")
}

// Existing Game model requires relation fields added
model Game {
  // ... existing fields ...
  answers       Answer[]        @relation
  participations Participation[] @relation
}
```

**Migration Notes**:
- Add relations to existing Game model
- Create new Answer table with composite unique constraint
- Create new Participation table with composite unique constraint
- Add indexes for efficient querying

## Repository Interfaces

### IAnswerRepository

**Purpose**: Data access abstraction for Answer entities.

**Methods**:

```typescript
interface IAnswerRepository {
  /**
   * Create or update answer for a session and game (upsert pattern)
   * Supports overwrite requirement (FR-013)
   */
  upsert(answer: AnswerEntity): Promise<AnswerEntity>;

  /**
   * Find answer by session and game
   * Returns null if not found
   */
  findBySessionAndGame(sessionId: string, gameId: string): Promise<AnswerEntity | null>;

  /**
   * Find all answers for a game
   * Used for result calculation (future feature)
   */
  findByGameId(gameId: string): Promise<AnswerEntity[]>;

  /**
   * Delete answer
   * Used when participant removes their submission
   */
  delete(id: string): Promise<void>;
}
```

### IParticipationRepository

**Purpose**: Data access abstraction for Participation entities.

**Methods**:

```typescript
interface IParticipationRepository {
  /**
   * Create participation record
   * Throws if duplicate (sessionId + gameId unique constraint)
   */
  create(participation: ParticipationEntity): Promise<ParticipationEntity>;

  /**
   * Check if session has already participated in game
   * Used to prevent duplicate enrollment
   */
  exists(sessionId: string, gameId: string): Promise<boolean>;

  /**
   * Count total participants for a game
   * Used to enforce maxParticipants limit (FR-008)
   */
  countByGameId(gameId: string): Promise<number>;

  /**
   * Find participation by session and game
   * Returns null if not found
   */
  findBySessionAndGame(sessionId: string, gameId: string): Promise<ParticipationEntity | null>;
}
```

## Validation Rules

### Answer Submission Validation (Use Case Layer)

**Pre-submission Checks**:

1. **Session Validation** (FR-012)
   - Session must exist (valid cookie)
   - Nickname must be present in session

2. **Game Validation** (FR-010, FR-014, FR-015)
   - Game must exist
   - Game status must be "出題中"
   - Game must have at least 1 presenter
   - Presenter count validation happens at access time

3. **Participation Validation** (FR-008, FR-009)
   - If not yet participated:
     - Current participant count < maxParticipants (if limit set)
   - If already participated:
     - Allowed to overwrite answer

4. **Selection Validation** (FR-004, FR-005)
   - Selections must include all presenters in game
   - Each episode ID must be valid for its presenter
   - No duplicate or missing presenters

**Validation Flow**:

```typescript
async function validateAnswerSubmission(
  sessionId: string,
  gameId: string,
  selections: Record<string, string>
): Promise<ValidationResult> {
  // 1. Validate session
  const session = await getSession();
  if (!session) {
    return { valid: false, error: 'INVALID_SESSION' };
  }

  // 2. Validate game
  const game = await gameRepository.findById(gameId);
  if (!game) {
    return { valid: false, error: 'GAME_NOT_FOUND' };
  }
  if (game.status !== '出題中') {
    return { valid: false, error: 'GAME_CLOSED' };
  }
  if (game.presenters.length === 0) {
    return { valid: false, error: 'NO_PRESENTERS' };
  }

  // 3. Validate participation limit
  const hasParticipated = await participationRepository.exists(sessionId, gameId);
  if (!hasParticipated) {
    if (game.maxParticipants !== null) {
      const participantCount = await participationRepository.countByGameId(gameId);
      if (participantCount >= game.maxParticipants) {
        return { valid: false, error: 'PARTICIPANT_LIMIT' };
      }
    }
  }

  // 4. Validate selections
  const presenterIds = new Set(game.presenters.map(p => p.id));
  const selectionPresenterIds = new Set(Object.keys(selections));

  if (presenterIds.size !== selectionPresenterIds.size) {
    return { valid: false, error: 'INCOMPLETE_ANSWERS' };
  }

  for (const presenterId of presenterIds) {
    if (!selectionPresenterIds.has(presenterId)) {
      return { valid: false, error: 'INCOMPLETE_ANSWERS' };
    }

    const episodeId = selections[presenterId];
    const presenter = game.presenters.find(p => p.id === presenterId);
    const episodeExists = presenter?.episodes.some(e => e.id === episodeId);

    if (!episodeExists) {
      return { valid: false, error: 'INVALID_EPISODE' };
    }
  }

  return { valid: true };
}
```

## State Transitions

### Participation Lifecycle

```
[No Record]
    │
    │ Access answer screen (FR-002)
    ▼
[Participated]
    │
    │ (Persists even without answer submission)
    │ (Cascade deleted with Game)
    ▼
[Deleted]
```

### Answer Lifecycle

```
[No Answer]
    │
    │ Submit answer (FR-006)
    ▼
[Answer Submitted]
    │
    │ Resubmit (FR-013, before deadline)
    ▼
[Answer Updated]
    │
    │ Game status → 締切
    ▼
[Answer Locked]
    │
    │ Game deleted
    ▼
[Deleted (cascade)]
```

### Game Status Impact on Answers

| Game Status | Can Access Screen | Can Submit Answer | Can Overwrite | Error Message |
|-------------|-------------------|-------------------|---------------|---------------|
| 準備中 | ❌ | ❌ | ❌ | "このゲームはまだ出題されていません" |
| 出題中 | ✅ | ✅ | ✅ (if already participated) | - |
| 締切 | ❌ | ❌ | ❌ | "このゲームは既に締め切られました" |

## Data Access Patterns

### 1. Answer Submission (Write)

```typescript
// Pattern: Upsert with participation tracking
async function submitAnswer(
  sessionId: string,
  gameId: string,
  nickname: string,
  selections: Record<string, string>
): Promise<AnswerEntity> {
  // Ensure participation record exists
  const hasParticipated = await participationRepository.exists(sessionId, gameId);
  if (!hasParticipated) {
    const participation = ParticipationEntity.create({ sessionId, gameId, nickname });
    await participationRepository.create(participation);
  }

  // Upsert answer
  const answer = AnswerEntity.create({ sessionId, gameId, nickname, selections });
  return await answerRepository.upsert(answer);
}
```

### 2. Game Data for Answer Screen (Read)

```typescript
// Pattern: Single denormalized query
async function getGameForAnswers(gameId: string): Promise<GameWithEpisodes> {
  return await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      presenters: {
        include: {
          episodes: {
            select: {
              id: true,
              content: true
              // isLie: false - NEVER expose to client!
            }
          }
        }
      }
    }
  });
}
```

### 3. Participant Count Check (Read)

```typescript
// Pattern: Indexed count query
async function canParticipate(sessionId: string, gameId: string): Promise<boolean> {
  const game = await gameRepository.findById(gameId);
  if (!game || !game.maxParticipants) {
    return true; // No limit
  }

  const hasParticipated = await participationRepository.exists(sessionId, gameId);
  if (hasParticipated) {
    return true; // Already enrolled
  }

  const count = await participationRepository.countByGameId(gameId);
  return count < game.maxParticipants;
}
```

## Performance Considerations

### Indexes

**Answer table**:
- Primary key: `id`
- Unique constraint: `(sessionId, gameId)` - Fast upsert
- Index: `gameId` - Fast lookup of all answers for a game
- Index: `sessionId` - Fast lookup of all answers by participant

**Participation table**:
- Primary key: `id`
- Unique constraint: `(sessionId, gameId)` - Prevent duplicates
- Index: `gameId` - Fast count query for participant limits

### Query Optimization

**Expected Query Patterns**:
- Answer submission (upsert): O(1) with unique constraint
- Participant count: O(1) with index on gameId
- Game data fetch: O(1) with join (single query)

**Potential Bottlenecks**:
- Large number of episodes per presenter (>50): Consider pagination
- High concurrent writes to same game: SQLite write lock (monitor and consider WAL mode)

## Security Considerations

### Data Exposure

**CRITICAL**: Never expose `Episode.isLie` to participants during "出題中" phase

**Safe query pattern**:
```typescript
// ✅ CORRECT
const episodes = await prisma.episode.findMany({
  select: {
    id: true,
    content: true
    // isLie intentionally omitted
  }
});

// ❌ WRONG - exposes answer
const episodes = await prisma.episode.findMany(); // Includes isLie!
```

### Session Integrity

- Session ID must be validated on every request
- Nickname must match session at submission time
- Cannot submit on behalf of other sessions

### Data Integrity

- Cascade delete: Answers and Participations deleted with Game
- Foreign key constraints ensure referential integrity
- Unique constraints prevent duplicate submissions

## Testing Data Requirements

### Test Fixtures

**Games**:
- Game with status "準備中"
- Game with status "出題中" (0 participants)
- Game with status "出題中" (max participants reached)
- Game with status "締切"
- Game with 0 presenters
- Game with 1 presenter (1 episode)
- Game with multiple presenters (3+ episodes each)

**Sessions**:
- Valid session (nickname set)
- Invalid session (no nickname)
- Multiple distinct sessions

**Existing Answers**:
- No existing answer for session+game
- Existing answer for session+game (for overwrite test)

### Example Test Data

```typescript
const testGame = {
  id: 'game-1',
  title: 'Test Game',
  status: '出題中',
  maxParticipants: 5,
  presenters: [
    {
      id: 'presenter-1',
      name: 'Presenter A',
      episodes: [
        { id: 'episode-1-1', content: 'Episode 1', isLie: false },
        { id: 'episode-1-2', content: 'Episode 2', isLie: true },
        { id: 'episode-1-3', content: 'Episode 3', isLie: false }
      ]
    },
    {
      id: 'presenter-2',
      name: 'Presenter B',
      episodes: [
        { id: 'episode-2-1', content: 'Episode 1', isLie: false },
        { id: 'episode-2-2', content: 'Episode 2', isLie: false },
        { id: 'episode-2-3', content: 'Episode 3', isLie: true }
      ]
    }
  ]
};

const testSession = {
  sessionId: 'session-123',
  nickname: 'TestUser'
};

const testSelections = {
  'presenter-1': 'episode-1-2', // Correct lie
  'presenter-2': 'episode-2-3'  // Correct lie
};
```

## Migration Strategy

### Phase 1: Schema Migration

1. Add Answer and Participation tables to Prisma schema
2. Add relations to existing Game model
3. Generate and run Prisma migration
4. Verify foreign key constraints

### Phase 2: Repository Implementation

1. Implement PrismaAnswerRepository
2. Implement PrismaParticipationRepository
3. Add repository factory functions
4. Write integration tests with test database

### Phase 3: Use Case Implementation

1. Implement SubmitAnswer use case
2. Implement ValidateGameForAnswers use case
3. Implement GetGameForAnswers use case
4. TDD: Tests first, then implementation

## References

- Feature Specification: [spec.md](./spec.md)
- Research Document: [research.md](./research.md)
- Implementation Plan: [plan.md](./plan.md)
- Prisma Documentation: https://www.prisma.io/docs
- Clean Architecture Patterns: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
