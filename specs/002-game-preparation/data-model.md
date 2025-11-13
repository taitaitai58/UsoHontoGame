# Data Model: Game Preparation for Moderators

**Feature**: 002-game-preparation
**Date**: 2025-11-10
**Purpose**: Domain entities, value objects, and data relationships for game preparation

## Entity Definitions

### Game

**Description**: Represents a truth-or-lie game session with configuration and status tracking.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | GameId (UUID) | Required, Unique | System-generated unique identifier (FR-001) |
| name | String | Optional, Max 100 chars | Custom game name - defaults to UUID if not provided (FR-001a, FR-001b) |
| creatorId | String | Required | Session ID of the moderator who created the game |
| playerLimit | Integer | Required, 1-100 | Maximum number of players allowed (FR-002) |
| status | GameStatus | Required | Current game state: 準備中, 出題中, or 締切 (FR-007) |
| presenters | Presenter[] | 1-10 items | Collection of presenters for this game (FR-003, FR-003a) |
| createdAt | DateTime | Required, Auto | Timestamp when game was created |
| updatedAt | DateTime | Required, Auto | Timestamp when game was last modified |

**Invariants**:
- `playerLimit` must be between 1 and 100 (FR-002, FR-017)
- `presenters` length must be between 0 and 10 (FR-003)
- New games always initialize with status = 準備中 (FR-008)
- Cannot transition to 出題中 if presenters.length < 1 or any presenter lacks complete episodes (FR-011, FR-018, FR-019)

**Methods**:
- `startAccepting()`: Transition from 準備中 to 出題中 (FR-009)
- `close()`: Transition from 出題中 to 締切 (FR-010)
- `addPresenter(presenter)`: Add a presenter to the game (FR-003)
- `removePresenter(presenterId)`: Remove a presenter from the game (FR-014)
- `updatePlayerLimit(limit)`: Change player limit when status is 準備中 (FR-013)
- `canStartAccepting()`: Validate if game can transition to 出題中 (FR-011)

### Presenter

**Description**: A participant who creates episodes for players to evaluate within a specific game.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String (UUID) | Required, Unique | System-generated unique identifier |
| gameId | String (UUID) | Required, Foreign Key | Reference to parent Game |
| nickname | String | Required | Session nickname of presenter |
| episodes | Episode[] | Exactly 3 items | Collection of presenter's episodes (FR-004) |
| createdAt | DateTime | Required, Auto | Timestamp when presenter was added |

**Invariants**:
- `episodes` length must be exactly 3 (FR-004, FR-018)
- Exactly one episode must have `isLie = true` (FR-005, FR-019)
- Cannot modify episodes when game status is 出題中 or 締切 (FR-014)

**Methods**:
- `addEpisode(episode)`: Add an episode (max 3)
- `removeEpisode(episodeId)`: Remove an episode
- `markLie(episodeId)`: Mark exactly one episode as the lie (FR-005)
- `hasCompleteEpisodes()`: Check if presenter has 3 episodes with lie marked

### Episode

**Description**: A story or statement created by a presenter, with a hidden truth/lie marker.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String (UUID) | Required, Unique | System-generated unique identifier |
| presenterId | String (UUID) | Required, Foreign Key | Reference to parent Presenter |
| text | String | Required, Max 1000 chars | Episode content (Assumption 3) |
| isLie | Boolean | Required | Truth/lie marker - confidential (FR-006) |
| createdAt | DateTime | Required, Auto | Timestamp when episode was created |

**Invariants**:
- `text` cannot be empty
- `text` maximum length is 1000 characters (Assumption 3)
- `isLie` is accessible only to presenter and moderator (FR-006)

**Security Rules**:
- Lie marker must never be exposed in public APIs
- Separate DTOs required: `EpisodeDto` (public) and `EpisodeWithLieDto` (private)

## Value Objects

### GameId

**Description**: Unique identifier for a game using UUID v4 format.

**Implementation**:
```typescript
class GameId {
  private readonly _value: string;

  constructor(value: string) {
    if (!this.isValidUUID(value)) {
      throw new InvalidGameIdError('Game ID must be a valid UUID');
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  equals(other: GameId): boolean {
    return this._value === other._value;
  }

  static generate(): GameId {
    return new GameId(crypto.randomUUID());
  }
}
```

### GameStatus

**Description**: Enumeration of valid game states with business logic.

**Valid Values**:
- `準備中` (Preparation) - Game is being set up (FR-008)
- `出題中` (Accepting Responses) - Game is live for players (FR-009)
- `締切` (Closed) - Game has ended (FR-010)

**Implementation**:
```typescript
class GameStatus {
  private readonly _value: '準備中' | '出題中' | '締切';

  constructor(value: '準備中' | '出題中' | '締切') {
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  isAcceptingResponses(): boolean {
    return this._value === '出題中';
  }

  canEdit(): boolean {
    return this._value === '準備中';
  }

  equals(other: GameStatus): boolean {
    return this._value === other._value;
  }
}
```

## Entity Relationships

```
Game (1) ──────< (N) Presenter (1) ──────< (3) Episode
  │                     │                        │
  │ id                  │ gameId                 │ presenterId
  │ name (optional)     │ nickname               │ text
  │ creatorId           │ episodes[]             │ isLie ⚠️ CONFIDENTIAL
  │ playerLimit         │ createdAt              │ createdAt
  │ status              │                        │
  │ presenters[]        │                        │
  │ createdAt           │                        │
  │ updatedAt           │                        │
```

**Cascade Rules**:
- Deleting a Game cascades to all Presenters and their Episodes (FR-015)
- Deleting a Presenter cascades to all their Episodes (FR-014)
- Cascade deletes implemented at database level (Prisma `onDelete: Cascade`)

## State Transitions

### Game Status State Machine

```
┌─────────┐
│ 準備中   │ ← Initial state (FR-008)
└────┬────┘
     │ startAccepting() (FR-009)
     │ Conditions:
     │ - presenters.length >= 1 (FR-011)
     │ - All presenters have 3 episodes (FR-018)
     │ - All presenters have exactly 1 lie marked (FR-019)
     ▼
┌─────────┐
│ 出題中   │ ← Game visible on TOP page
└────┬────┘
     │ close() (FR-010)
     │ No preconditions
     ▼
┌─────────┐
│  締切    │ ← Final state (no further transitions)
└─────────┘
```

**Validation Rules**:
- Cannot transition from 準備中 to 出題中 without valid presenters (FR-011)
- Cannot edit presenters/episodes when status is 出題中 or 締切 (FR-014)
- Deletion warnings required for games with status 出題中 or 締切 (FR-016)

## Data Access Patterns

### Repository Methods

**IGameRepository**:
- `findAll()`: Promise<Game[]> - Get all games for display (FR-012)
- `findByCreator(creatorId)`: Promise<Game[]> - Filter by moderator session ID
- `findByStatus(status)`: Promise<Game[]> - Filter by game status
- `findById(gameId)`: Promise<Game | null> - Get single game by ID
- `create(game)`: Promise<void> - Persist new game (FR-001)
- `update(game)`: Promise<void> - Update existing game (FR-013)
- `delete(gameId)`: Promise<void> - Remove game and cascade (FR-015)

### Access Control

**Creator-Only Operations**:
- Edit game (FR-013, FR-014)
- Delete game (FR-015)
- Change game status (FR-009, FR-010)
- Add/remove presenters (FR-003)

**Presenter Access**:
- View own episodes with lie marker
- Add/edit own episodes (when game status is 準備中)
- Mark lie in own episodes

**Player Access** (future feature):
- View games with status 出題中
- View episodes WITHOUT lie marker (FR-006)

## Data Transfer Objects (DTOs)

### GameDto (Public)

```typescript
interface GameDto {
  id: string;
  name: string;
  playerLimit: number;
  status: '準備中' | '出題中' | '締切';
  presenterCount: number;
  createdAt: string; // ISO 8601
}
```

### GameDetailDto (Moderator)

```typescript
interface GameDetailDto extends GameDto {
  presenters: PresenterDto[];
  updatedAt: string; // ISO 8601
}
```

### PresenterDto (Public)

```typescript
interface PresenterDto {
  id: string;
  nickname: string;
  episodes: EpisodeDto[]; // WITHOUT isLie
}
```

### PresenterWithLieDto (Moderator/Presenter)

```typescript
interface PresenterWithLieDto {
  id: string;
  nickname: string;
  episodes: EpisodeWithLieDto[]; // WITH isLie
}
```

### EpisodeDto (Public)

```typescript
interface EpisodeDto {
  id: string;
  text: string;
  // NO isLie field
}
```

### EpisodeWithLieDto (Moderator/Presenter)

```typescript
interface EpisodeWithLieDto extends EpisodeDto {
  isLie: boolean; // ⚠️ CONFIDENTIAL
}
```

## Database Schema (Prisma)

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Game {
  id          String      @id @default(uuid())
  name        String?     // Optional custom name (max 100 chars)
  creatorId   String      // Session ID
  playerLimit Int
  status      String      // '準備中' | '出題中' | '締切'
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  presenters  Presenter[]

  @@index([creatorId, status])
  @@index([creatorId, createdAt])
}

model Presenter {
  id        String    @id @default(uuid())
  gameId    String
  nickname  String
  game      Game      @relation(fields: [gameId], references: [id], onDelete: Cascade)
  episodes  Episode[]
  createdAt DateTime  @default(now())

  @@index([gameId])
}

model Episode {
  id          String    @id @default(uuid())
  presenterId String
  text        String    // Max 1000 chars (app-level validation)
  isLie       Boolean   // ⚠️ CONFIDENTIAL
  presenter   Presenter @relation(fields: [presenterId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())

  @@index([presenterId])
}
```

## Zod Validation Schemas

Zod schemas provide runtime validation at API boundaries and form inputs, ensuring data integrity before reaching the domain layer.

### Core Schemas

```typescript
// src/server/domain/schemas/gameSchemas.ts
import { z } from 'zod';

// Value Object Schemas
export const GameIdSchema = z.string().uuid({
  message: 'ゲームIDは有効なUUIDでなければなりません'
});

export const GameStatusSchema = z.enum(['準備中', '出題中', '締切'], {
  errorMap: () => ({
    message: 'ステータスは「準備中」「出題中」「締切」のいずれかでなければなりません'
  })
});

// Input Schemas (Server Actions & Forms)
export const CreateGameSchema = z.object({
  name: z.string()
    .max(100, { message: 'ゲーム名は100文字以下でなければなりません' })
    .optional(),
  playerLimit: z.number()
    .int({ message: 'プレイヤー数は整数でなければなりません' })
    .min(1, { message: 'プレイヤー数は1以上でなければなりません' })
    .max(100, { message: 'プレイヤー数は100以下でなければなりません' })
});

export const UpdateGameSchema = z.object({
  gameId: GameIdSchema,
  playerLimit: z.number()
    .int()
    .min(1)
    .max(100)
    .optional()
});

export const StartAcceptingSchema = z.object({
  gameId: GameIdSchema
});

export const DeleteGameSchema = z.object({
  gameId: GameIdSchema,
  confirmed: z.boolean().optional()
});

// Presenter Schemas
export const AddPresenterSchema = z.object({
  gameId: GameIdSchema,
  nickname: z.string()
    .min(1, { message: 'ニックネームを入力してください' })
    .max(50, { message: 'ニックネームは50文字以下でなければなりません' })
});

export const RemovePresenterSchema = z.object({
  gameId: GameIdSchema,
  presenterId: z.string().uuid()
});

// Episode Schemas
export const AddEpisodeSchema = z.object({
  presenterId: z.string().uuid(),
  text: z.string()
    .min(1, { message: 'エピソードは1文字以上でなければなりません' })
    .max(1000, { message: 'エピソードは1000文字以下でなければなりません' }),
  isLie: z.boolean()
});

export const UpdateEpisodeSchema = z.object({
  episodeId: z.string().uuid(),
  text: z.string()
    .min(1)
    .max(1000)
    .optional(),
  isLie: z.boolean().optional()
}).refine(
  (data) => data.text !== undefined || data.isLie !== undefined,
  { message: 'テキストまたはウソマーカーのいずれかを更新する必要があります' }
);

// Type Inference
export type CreateGameInput = z.infer<typeof CreateGameSchema>;
export type UpdateGameInput = z.infer<typeof UpdateGameSchema>;
export type AddPresenterInput = z.infer<typeof AddPresenterSchema>;
export type AddEpisodeInput = z.infer<typeof AddEpisodeSchema>;
export type UpdateEpisodeInput = z.infer<typeof UpdateEpisodeSchema>;
```

### Complex Validation Rules

```typescript
// src/server/domain/schemas/validators.ts
import { z } from 'zod';

// Validate presenter has exactly 3 episodes with exactly 1 lie
export const CompletePresenterSchema = z.object({
  episodes: z.array(z.object({
    isLie: z.boolean()
  }))
}).refine(
  (data) => data.episodes.length === 3,
  { message: 'エピソードは3つ登録する必要があります' }
).refine(
  (data) => data.episodes.filter(e => e.isLie).length === 1,
  { message: 'ウソのエピソードを1つ選択してください' }
);

// Validate game can transition to 出題中
export const ReadyToAcceptSchema = z.object({
  presenters: z.array(CompletePresenterSchema)
}).refine(
  (data) => data.presenters.length >= 1,
  { message: '出題者が1人以上必要です' }
);
```

### Usage in Server Actions

```typescript
// src/app/actions/game.ts
'use server';

import { CreateGameSchema } from '@/server/domain/schemas/gameSchemas';
import { z } from 'zod';

export async function createGameAction(rawInput: unknown) {
  try {
    // Validate with Zod before reaching use case
    const validatedInput = CreateGameSchema.parse(rawInput);

    // Continue with use case execution...
    const sessionId = await getSessionId();
    const repository = getGameRepository();
    const useCase = new CreateGame(repository);
    const gameId = await useCase.execute(sessionId, validatedInput.playerLimit);

    revalidatePath('/games');
    return { success: true, gameId };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return structured validation errors
      return {
        success: false,
        errors: error.flatten().fieldErrors
      };
    }
    // Handle other errors
    return {
      success: false,
      error: error instanceof Error ? error.message : 'エラーが発生しました'
    };
  }
}
```

### Benefits

1. **Single Source of Truth**: Validation rules defined once, used everywhere (FR-017 through FR-019)
2. **Type Safety**: TypeScript types automatically inferred from Zod schemas
3. **Runtime Safety**: Prevents invalid data from reaching domain layer
4. **Clear Errors**: Japanese error messages for user-facing validation
5. **Testability**: Schemas can be unit tested independently
6. **Composability**: Complex validations built from simpler schemas

## Validation Rules Summary

| Entity | Field | Validation | Error Message |
|--------|-------|------------|---------------|
| Game | playerLimit | 1 ≤ value ≤ 100 | "プレイヤー数は1〜100の範囲で指定してください" |
| Game | presenters | 0 ≤ length ≤ 10 | "出題者は最大10人までです" |
| Game | status transition | See state machine | "このステータスからは変更できません" |
| Presenter | episodes | length === 3 | "エピソードは3つ登録する必要があります" |
| Presenter | lie marker | exactly 1 true | "ウソのエピソードを1つ選択してください" |
| Episode | text | 1 ≤ length ≤ 1000 | "エピソードは1〜1000文字で入力してください" |

## Performance Considerations

### Indexes
- `(creatorId, status)`: Fast filtering of moderator's games by status (FR-012)
- `(creatorId, createdAt)`: Fast chronological listing of moderator's games
- `(gameId)`: Fast presenter lookup by game
- `(presenterId)`: Fast episode lookup by presenter

### Query Patterns
- **Game List Page**: `findByCreator()` with eager loading of presenters and episode counts
- **Game Edit Page**: `findById()` with full presenter and episode data
- **TOP Page**: `findByStatus('出題中')` with limited fields (no episodes)

### Data Volume Estimates (per moderator)
- Up to 50 games (SC-004)
- Up to 10 presenters per game = 500 presenters
- 3 episodes per presenter = 1,500 episodes
- Total: ~2,000 rows per moderator in SQLite

All designs follow Clean Architecture principles with domain entities independent of persistence layer, ensuring testability and maintainability per project constitution.
