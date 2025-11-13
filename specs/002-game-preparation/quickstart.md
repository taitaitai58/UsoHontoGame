# Game Preparation Feature - Developer Quickstart Guide

**Feature**: 002-game-preparation
**Branch**: `002-game-preparation`
**Last Updated**: 2025-11-11

## Overview

This guide helps developers implement the Game Preparation feature for the UsoHontoGame platform. This feature enables moderators to create and manage truth-or-lie games, add presenters with their episodes, and control game flow through status transitions.

**What You'll Build**:
- Game creation with custom names and player limits
- Presenter management (1-10 per game) with three episodes each
- Episode management with confidential lie markers
- Game status control (準備中 → 出題中 → 締切)
- Full CRUD operations for games
- Ability to add presenters and episodes during initial game creation

**Core Value**: This feature is the foundation of the platform - it enables moderators to set up playable games for the truth-or-lie guessing experience.

## Prerequisites

### Required Knowledge
- TypeScript 5 with strict mode
- Next.js 16 App Router and React Server Components
- Clean Architecture principles
- Test-Driven Development (TDD)
- Prisma ORM basics
- React 19 features (Server Actions)

### Required Tools
- Node.js 18+ with npm
- SQLite (embedded database)
- Git
- VS Code or similar IDE

### Dependencies Already in Project
```json
{
  "next": "16.0.1",
  "react": "19.2.0",
  "prisma": "6.19.0",
  "zod": "4.1.12",
  "vitest": "4.0.7",
  "playwright": "1.56.1"
}
```

### Existing Features to Understand
- **Session Management** (001-session-top-page): Provides user authentication and session IDs needed for creator identification
- **TOP Page** (001-session-top-page): Displays games with 出題中 status

## Architecture Overview

This feature follows **Clean Architecture** with strict layer separation:

```
┌─────────────────────────────────────────────────────────┐
│  Presentation Layer (src/app/)                          │
│  - Server Components: GameListPage, GameCreatePage      │
│  - Client Components: GameForm, PresenterManager        │
│  - Server Actions: createGameAction, updateGameAction   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  Application Layer (src/server/application/)            │
│  - Use Cases: CreateGame, UpdateGame, DeleteGame        │
│  - DTOs: CreateGameRequest, GameResponse                │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  Domain Layer (src/server/domain/)                      │
│  - Entities: Game, Presenter, Episode                   │
│  - Value Objects: GameId, GameStatus, EpisodeText       │
│  - Repository Interfaces: IGameRepository               │
│  - Business Rules: Status transitions, validations      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  Infrastructure Layer (src/server/infrastructure/)      │
│  - PrismaGameRepository, PrismaPresenterRepository      │
│  - Database access and external integrations            │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Principles

1. **Dependency Rule**: Dependencies point INWARD only. Domain layer has NO dependencies on outer layers.
2. **Component Hierarchy**: Pages → Domain → UI (each layer uses only layers at same level or below)
3. **Custom Hooks**: ALL component logic extracted into testable hooks in `hooks/` subdirectories
4. **Server Components First**: Use RSC for data fetching, Client Components only for interactivity
5. **Type Safety**: Strict TypeScript, explicit types, Zod schemas for runtime validation

## Quick Start Steps

### Phase 1: Database Schema (Prisma Migration)

**Goal**: Define database tables for Game, Presenter, and Episode entities.

#### Step 1.1: Update Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
model Game {
  id          String      @id @default(uuid())
  name        String?     // Optional custom name (max 100 chars via app validation)
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
  text        String    // Max 1000 chars via app validation
  isLie       Boolean   // CONFIDENTIAL
  presenter   Presenter @relation(fields: [presenterId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())

  @@index([presenterId])
}
```

#### Step 1.2: Create Migration

```bash
# Generate migration
npx prisma migrate dev --name add_game_preparation

# This will:
# - Create migration SQL file
# - Apply migration to dev.db
# - Regenerate Prisma Client
```

#### Step 1.3: Verify Migration

```bash
# Check database schema
npx prisma studio

# Verify tables: Game, Presenter, Episode exist
```

### Phase 2: Domain Layer (Entities, Value Objects)

**Goal**: Implement core business entities and validation rules independent of frameworks.

#### Step 2.1: Write Entity Tests FIRST (TDD Red Phase)

Create `tests/unit/entities/Game.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { Game } from '@/server/domain/entities/Game';
import { GameStatus } from '@/server/domain/value-objects/GameStatus';

describe('Game Entity', () => {
  it('should create a game with default status 準備中', () => {
    const game = Game.create({
      creatorId: 'session-123',
      playerLimit: 10
    });

    expect(game.status.value).toBe('準備中');
  });

  it('should accept optional custom name during creation', () => {
    const game = Game.create({
      creatorId: 'session-123',
      playerLimit: 10,
      name: 'Friday Night Game'
    });

    expect(game.name?.value).toBe('Friday Night Game');
  });

  it('should not allow transition to 出題中 without presenters', () => {
    const game = Game.create({
      creatorId: 'session-123',
      playerLimit: 10
    });

    expect(() => game.startAccepting()).toThrow(
      'ゲームを開始するには出題者が1人以上必要です'
    );
  });

  it('should allow adding up to 10 presenters', () => {
    const game = Game.create({
      creatorId: 'session-123',
      playerLimit: 10
    });

    // Add 10 presenters - should succeed
    for (let i = 0; i < 10; i++) {
      expect(() => game.addPresenter({ nickname: `presenter${i}` }))
        .not.toThrow();
    }

    // Try to add 11th presenter - should fail
    expect(() => game.addPresenter({ nickname: 'presenter11' }))
      .toThrow('出題者は最大10人までです');
  });
});
```

Create `tests/unit/entities/Presenter.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { Presenter } from '@/server/domain/entities/Presenter';

describe('Presenter Entity', () => {
  it('should require exactly 3 episodes before marking as complete', () => {
    const presenter = Presenter.create({
      gameId: 'game-123',
      nickname: 'Alice'
    });

    presenter.addEpisode({ text: 'Episode 1', isLie: false });
    presenter.addEpisode({ text: 'Episode 2', isLie: false });

    expect(presenter.hasCompleteEpisodes()).toBe(false);

    presenter.addEpisode({ text: 'Episode 3', isLie: true });

    expect(presenter.hasCompleteEpisodes()).toBe(true);
  });

  it('should require exactly one episode marked as lie', () => {
    const presenter = Presenter.create({
      gameId: 'game-123',
      nickname: 'Bob'
    });

    presenter.addEpisode({ text: 'Episode 1', isLie: true });
    presenter.addEpisode({ text: 'Episode 2', isLie: true });

    expect(() => presenter.addEpisode({ text: 'Episode 3', isLie: false }))
      .toThrow('ウソのエピソードは1つだけです');
  });
});
```

#### Step 2.2: Implement Value Objects (TDD Green Phase)

Create `src/server/domain/value-objects/GameName.ts`:

```typescript
export class GameName {
  private readonly _value: string;

  constructor(value: string) {
    if (value.length > 100) {
      throw new Error('ゲーム名は100文字以下でなければなりません');
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  equals(other: GameName): boolean {
    return this._value === other._value;
  }
}
```

Create `src/server/domain/value-objects/GameStatus.ts`:

```typescript
type GameStatusValue = '準備中' | '出題中' | '締切';

export class GameStatus {
  private readonly _value: GameStatusValue;

  constructor(value: GameStatusValue) {
    this._value = value;
  }

  get value(): GameStatusValue {
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

  static preparation(): GameStatus {
    return new GameStatus('準備中');
  }

  static accepting(): GameStatus {
    return new GameStatus('出題中');
  }

  static closed(): GameStatus {
    return new GameStatus('締切');
  }
}
```

Create `src/server/domain/value-objects/EpisodeText.ts`:

```typescript
export class EpisodeText {
  private readonly _value: string;

  constructor(value: string) {
    if (value.length === 0) {
      throw new Error('エピソードは1文字以上でなければなりません');
    }
    if (value.length > 1000) {
      throw new Error('エピソードは1000文字以下でなければなりません');
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  equals(other: EpisodeText): boolean {
    return this._value === other._value;
  }
}
```

#### Step 2.3: Implement Entities (TDD Green Phase)

Create `src/server/domain/entities/Episode.ts`:

```typescript
import { EpisodeText } from '../value-objects/EpisodeText';

export interface EpisodeProps {
  id: string;
  presenterId: string;
  text: EpisodeText;
  isLie: boolean;
  createdAt: Date;
}

export class Episode {
  private constructor(private props: EpisodeProps) {}

  get id(): string {
    return this.props.id;
  }

  get presenterId(): string {
    return this.props.presenterId;
  }

  get text(): EpisodeText {
    return this.props.text;
  }

  get isLie(): boolean {
    return this.props.isLie;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  static create(params: {
    presenterId: string;
    text: string;
    isLie: boolean;
  }): Episode {
    return new Episode({
      id: crypto.randomUUID(),
      presenterId: params.presenterId,
      text: new EpisodeText(params.text),
      isLie: params.isLie,
      createdAt: new Date()
    });
  }

  static reconstitute(props: {
    id: string;
    presenterId: string;
    text: string;
    isLie: boolean;
    createdAt: Date;
  }): Episode {
    return new Episode({
      id: props.id,
      presenterId: props.presenterId,
      text: new EpisodeText(props.text),
      isLie: props.isLie,
      createdAt: props.createdAt
    });
  }
}
```

Create `src/server/domain/entities/Presenter.ts`:

```typescript
import { Episode } from './Episode';

export interface PresenterProps {
  id: string;
  gameId: string;
  nickname: string;
  episodes: Episode[];
  createdAt: Date;
}

export class Presenter {
  private constructor(private props: PresenterProps) {}

  get id(): string {
    return this.props.id;
  }

  get gameId(): string {
    return this.props.gameId;
  }

  get nickname(): string {
    return this.props.nickname;
  }

  get episodes(): Episode[] {
    return [...this.props.episodes];
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  addEpisode(params: { text: string; isLie: boolean }): void {
    if (this.props.episodes.length >= 3) {
      throw new Error('エピソードは3つまでです');
    }

    // Check that there's not already a lie if this episode is a lie
    const existingLies = this.props.episodes.filter(e => e.isLie).length;
    if (params.isLie && existingLies >= 1) {
      throw new Error('ウソのエピソードは1つだけです');
    }

    const episode = Episode.create({
      presenterId: this.props.id,
      text: params.text,
      isLie: params.isLie
    });

    this.props.episodes.push(episode);
  }

  hasCompleteEpisodes(): boolean {
    if (this.props.episodes.length !== 3) {
      return false;
    }

    const lieCount = this.props.episodes.filter(e => e.isLie).length;
    return lieCount === 1;
  }

  static create(params: { gameId: string; nickname: string }): Presenter {
    return new Presenter({
      id: crypto.randomUUID(),
      gameId: params.gameId,
      nickname: params.nickname,
      episodes: [],
      createdAt: new Date()
    });
  }

  static reconstitute(props: {
    id: string;
    gameId: string;
    nickname: string;
    episodes: Episode[];
    createdAt: Date;
  }): Presenter {
    return new Presenter(props);
  }
}
```

Create `src/server/domain/entities/Game.ts`:

```typescript
import { GameStatus } from '../value-objects/GameStatus';
import { GameName } from '../value-objects/GameName';
import { Presenter } from './Presenter';

export interface GameProps {
  id: string;
  name: GameName | null;
  creatorId: string;
  playerLimit: number;
  status: GameStatus;
  presenters: Presenter[];
  createdAt: Date;
  updatedAt: Date;
}

export class Game {
  private constructor(private props: GameProps) {}

  get id(): string {
    return this.props.id;
  }

  get name(): GameName | null {
    return this.props.name;
  }

  get displayName(): string {
    return this.props.name?.value ?? this.props.id;
  }

  get creatorId(): string {
    return this.props.creatorId;
  }

  get playerLimit(): number {
    return this.props.playerLimit;
  }

  get status(): GameStatus {
    return this.props.status;
  }

  get presenters(): Presenter[] {
    return [...this.props.presenters];
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  addPresenter(params: { nickname: string }): Presenter {
    if (this.props.presenters.length >= 10) {
      throw new Error('出題者は最大10人までです');
    }

    if (!this.props.status.canEdit()) {
      throw new Error('ゲームが準備中のときのみ出題者を追加できます');
    }

    const presenter = Presenter.create({
      gameId: this.props.id,
      nickname: params.nickname
    });

    this.props.presenters.push(presenter);
    this.props.updatedAt = new Date();

    return presenter;
  }

  removePresenter(presenterId: string): void {
    if (!this.props.status.canEdit()) {
      throw new Error('ゲームが準備中のときのみ出題者を削除できます');
    }

    const index = this.props.presenters.findIndex(p => p.id === presenterId);
    if (index === -1) {
      throw new Error('出題者が見つかりません');
    }

    this.props.presenters.splice(index, 1);
    this.props.updatedAt = new Date();
  }

  startAccepting(): void {
    if (!this.canStartAccepting()) {
      const reasons = this.getBlockingReasons();
      throw new Error(`ゲームを開始できません: ${reasons.join(', ')}`);
    }

    this.props.status = GameStatus.accepting();
    this.props.updatedAt = new Date();
  }

  close(): void {
    if (!this.props.status.isAcceptingResponses()) {
      throw new Error('出題中のゲームのみ締め切ることができます');
    }

    this.props.status = GameStatus.closed();
    this.props.updatedAt = new Date();
  }

  canStartAccepting(): boolean {
    return this.getBlockingReasons().length === 0;
  }

  private getBlockingReasons(): string[] {
    const reasons: string[] = [];

    if (this.props.presenters.length === 0) {
      reasons.push('出題者が1人以上必要です');
    }

    const incompletePresenters = this.props.presenters.filter(
      p => !p.hasCompleteEpisodes()
    );
    if (incompletePresenters.length > 0) {
      reasons.push('すべての出題者が3つのエピソードを登録し、1つをウソとして選択する必要があります');
    }

    return reasons;
  }

  static create(params: {
    creatorId: string;
    playerLimit: number;
    name?: string;
  }): Game {
    if (params.playerLimit < 1 || params.playerLimit > 100) {
      throw new Error('プレイヤー数は1〜100の範囲で指定してください');
    }

    return new Game({
      id: crypto.randomUUID(),
      name: params.name ? new GameName(params.name) : null,
      creatorId: params.creatorId,
      playerLimit: params.playerLimit,
      status: GameStatus.preparation(),
      presenters: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  static reconstitute(props: {
    id: string;
    name: string | null;
    creatorId: string;
    playerLimit: number;
    status: '準備中' | '出題中' | '締切';
    presenters: Presenter[];
    createdAt: Date;
    updatedAt: Date;
  }): Game {
    return new Game({
      id: props.id,
      name: props.name ? new GameName(props.name) : null,
      creatorId: props.creatorId,
      playerLimit: props.playerLimit,
      status: new GameStatus(props.status),
      presenters: props.presenters,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt
    });
  }
}
```

#### Step 2.4: Run Tests (Verify Green)

```bash
npm test tests/unit/entities/Game.test.ts
npm test tests/unit/entities/Presenter.test.ts
npm test tests/unit/entities/Episode.test.ts
```

All tests should pass. If not, fix implementation until green.

### Phase 3: Application Layer (Use Cases, DTOs)

**Goal**: Implement business workflows that orchestrate domain entities.

#### Step 3.1: Write Use Case Tests FIRST (TDD Red)

Create `tests/unit/use-cases/CreateGame.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { CreateGame } from '@/server/application/use-cases/games/CreateGame';
import { InMemoryGameRepository } from '../../test-doubles/InMemoryGameRepository';

describe('CreateGame Use Case', () => {
  let repository: InMemoryGameRepository;
  let useCase: CreateGame;

  beforeEach(() => {
    repository = new InMemoryGameRepository();
    useCase = new CreateGame(repository);
  });

  it('should create a game with only required fields', async () => {
    const request = {
      creatorId: 'session-123',
      playerLimit: 10
    };

    const gameId = await useCase.execute(request);

    expect(gameId).toBeDefined();
    const savedGame = await repository.findById(gameId);
    expect(savedGame).toBeDefined();
    expect(savedGame!.playerLimit).toBe(10);
    expect(savedGame!.status.value).toBe('準備中');
  });

  it('should create a game with custom name', async () => {
    const request = {
      creatorId: 'session-123',
      playerLimit: 10,
      name: 'Friday Night Fun'
    };

    const gameId = await useCase.execute(request);

    const savedGame = await repository.findById(gameId);
    expect(savedGame!.name?.value).toBe('Friday Night Fun');
  });

  it('should create game with presenters and episodes', async () => {
    const request = {
      creatorId: 'session-123',
      playerLimit: 10,
      presenters: [
        {
          nickname: 'Alice',
          episodes: [
            { text: 'Episode 1', isLie: false },
            { text: 'Episode 2', isLie: true },
            { text: 'Episode 3', isLie: false }
          ]
        }
      ]
    };

    const gameId = await useCase.execute(request);

    const savedGame = await repository.findById(gameId);
    expect(savedGame!.presenters).toHaveLength(1);
    expect(savedGame!.presenters[0].episodes).toHaveLength(3);
  });

  it('should reject invalid player limit', async () => {
    const request = {
      creatorId: 'session-123',
      playerLimit: 0 // Invalid
    };

    await expect(useCase.execute(request)).rejects.toThrow(
      'プレイヤー数は1〜100の範囲で指定してください'
    );
  });
});
```

#### Step 3.2: Implement DTOs

Create `src/server/application/dto/requests/CreateGameRequest.ts`:

```typescript
export interface EpisodeInput {
  text: string;
  isLie: boolean;
}

export interface PresenterInput {
  nickname: string;
  episodes: EpisodeInput[];
}

export interface CreateGameRequest {
  creatorId: string;
  playerLimit: number;
  name?: string;
  presenters?: PresenterInput[];
}
```

Create `src/server/application/dto/responses/GameResponse.ts`:

```typescript
export interface EpisodeResponse {
  id: string;
  text: string;
  // NO isLie field (public DTO)
}

export interface EpisodeWithLieResponse extends EpisodeResponse {
  isLie: boolean; // CONFIDENTIAL (moderator/presenter only)
}

export interface PresenterResponse {
  id: string;
  nickname: string;
  episodes: EpisodeResponse[];
}

export interface PresenterWithLieResponse {
  id: string;
  nickname: string;
  episodes: EpisodeWithLieResponse[];
}

export interface GameResponse {
  id: string;
  name: string; // Display name (custom or UUID)
  playerLimit: number;
  status: '準備中' | '出題中' | '締切';
  presenterCount: number;
  createdAt: string; // ISO 8601
}

export interface GameDetailResponse extends GameResponse {
  presenters: PresenterWithLieResponse[];
  updatedAt: string; // ISO 8601
}
```

#### Step 3.3: Implement Use Cases (TDD Green)

Create `src/server/application/use-cases/games/CreateGame.ts`:

```typescript
import { Game } from '@/server/domain/entities/Game';
import { IGameRepository } from '@/server/domain/repositories/GameRepository';
import { CreateGameRequest } from '../../dto/requests/CreateGameRequest';

export class CreateGame {
  constructor(private readonly gameRepository: IGameRepository) {}

  async execute(request: CreateGameRequest): Promise<string> {
    // Create game entity
    const game = Game.create({
      creatorId: request.creatorId,
      playerLimit: request.playerLimit,
      name: request.name
    });

    // Add presenters if provided
    if (request.presenters) {
      for (const presenterInput of request.presenters) {
        const presenter = game.addPresenter({
          nickname: presenterInput.nickname
        });

        // Add episodes to presenter
        for (const episodeInput of presenterInput.episodes) {
          presenter.addEpisode({
            text: episodeInput.text,
            isLie: episodeInput.isLie
          });
        }
      }
    }

    // Persist to repository
    await this.gameRepository.create(game);

    return game.id;
  }
}
```

Create `src/server/application/use-cases/games/UpdateGame.ts`:

```typescript
import { IGameRepository } from '@/server/domain/repositories/GameRepository';
import { GameNotFoundError } from '@/server/domain/errors/GameNotFoundError';

export interface UpdateGameRequest {
  gameId: string;
  playerLimit?: number;
}

export class UpdateGame {
  constructor(private readonly gameRepository: IGameRepository) {}

  async execute(request: UpdateGameRequest): Promise<void> {
    const game = await this.gameRepository.findById(request.gameId);
    if (!game) {
      throw new GameNotFoundError(request.gameId);
    }

    // Only allow editing in 準備中 status
    if (!game.status.canEdit()) {
      throw new Error('ゲームが準備中のときのみ編集できます');
    }

    // Update player limit if provided
    if (request.playerLimit !== undefined) {
      // This will be validated by Game entity
      const updatedGame = Game.reconstitute({
        ...game,
        playerLimit: request.playerLimit,
        name: game.name?.value ?? null,
        status: game.status.value,
        updatedAt: new Date()
      });

      await this.gameRepository.update(updatedGame);
    }
  }
}
```

Create `src/server/application/use-cases/games/ChangeGameStatus.ts`:

```typescript
import { IGameRepository } from '@/server/domain/repositories/GameRepository';
import { GameNotFoundError } from '@/server/domain/errors/GameNotFoundError';

export interface ChangeGameStatusRequest {
  gameId: string;
  action: 'start' | 'close';
}

export class ChangeGameStatus {
  constructor(private readonly gameRepository: IGameRepository) {}

  async execute(request: ChangeGameStatusRequest): Promise<void> {
    const game = await this.gameRepository.findById(request.gameId);
    if (!game) {
      throw new GameNotFoundError(request.gameId);
    }

    if (request.action === 'start') {
      game.startAccepting();
    } else if (request.action === 'close') {
      game.close();
    }

    await this.gameRepository.update(game);
  }
}
```

#### Step 3.4: Run Tests (Verify Green)

```bash
npm test tests/unit/use-cases/
```

### Phase 4: Infrastructure Layer (Repositories)

**Goal**: Implement data persistence using Prisma.

#### Step 4.1: Write Repository Tests FIRST (Integration TDD Red)

Create `tests/integration/repositories/PrismaGameRepository.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { PrismaGameRepository } from '@/server/infrastructure/repositories/PrismaGameRepository';
import { Game } from '@/server/domain/entities/Game';

describe('PrismaGameRepository', () => {
  let prisma: PrismaClient;
  let repository: PrismaGameRepository;

  beforeEach(async () => {
    prisma = new PrismaClient();
    repository = new PrismaGameRepository(prisma);

    // Clean database
    await prisma.episode.deleteMany();
    await prisma.presenter.deleteMany();
    await prisma.game.deleteMany();
  });

  it('should save and retrieve a game with presenters', async () => {
    const game = Game.create({
      creatorId: 'session-123',
      playerLimit: 10,
      name: 'Test Game'
    });

    const presenter = game.addPresenter({ nickname: 'Alice' });
    presenter.addEpisode({ text: 'Episode 1', isLie: false });
    presenter.addEpisode({ text: 'Episode 2', isLie: true });
    presenter.addEpisode({ text: 'Episode 3', isLie: false });

    await repository.create(game);

    const retrieved = await repository.findById(game.id);

    expect(retrieved).toBeDefined();
    expect(retrieved!.displayName).toBe('Test Game');
    expect(retrieved!.presenters).toHaveLength(1);
    expect(retrieved!.presenters[0].episodes).toHaveLength(3);
  });

  it('should find games by creator ID', async () => {
    const game1 = Game.create({
      creatorId: 'session-123',
      playerLimit: 10
    });

    const game2 = Game.create({
      creatorId: 'session-123',
      playerLimit: 20
    });

    await repository.create(game1);
    await repository.create(game2);

    const games = await repository.findByCreator('session-123');

    expect(games).toHaveLength(2);
  });

  it('should cascade delete presenters and episodes when game is deleted', async () => {
    const game = Game.create({
      creatorId: 'session-123',
      playerLimit: 10
    });

    const presenter = game.addPresenter({ nickname: 'Bob' });
    presenter.addEpisode({ text: 'Episode 1', isLie: true });
    presenter.addEpisode({ text: 'Episode 2', isLie: false });
    presenter.addEpisode({ text: 'Episode 3', isLie: false });

    await repository.create(game);

    await repository.delete(game.id);

    const retrieved = await repository.findById(game.id);
    expect(retrieved).toBeNull();

    // Verify cascade delete
    const presenters = await prisma.presenter.findMany({
      where: { gameId: game.id }
    });
    expect(presenters).toHaveLength(0);
  });
});
```

#### Step 4.2: Implement Repository Interface

Create `src/server/domain/repositories/GameRepository.ts`:

```typescript
import { Game } from '../entities/Game';

export interface IGameRepository {
  findAll(): Promise<Game[]>;
  findByCreator(creatorId: string): Promise<Game[]>;
  findByStatus(status: '準備中' | '出題中' | '締切'): Promise<Game[]>;
  findById(gameId: string): Promise<Game | null>;
  create(game: Game): Promise<void>;
  update(game: Game): Promise<void>;
  delete(gameId: string): Promise<void>;
}
```

#### Step 4.3: Implement Prisma Repository (TDD Green)

Create `src/server/infrastructure/repositories/PrismaGameRepository.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { Game } from '@/server/domain/entities/Game';
import { Presenter } from '@/server/domain/entities/Presenter';
import { Episode } from '@/server/domain/entities/Episode';
import { IGameRepository } from '@/server/domain/repositories/GameRepository';

export class PrismaGameRepository implements IGameRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Game[]> {
    const games = await this.prisma.game.findMany({
      include: {
        presenters: {
          include: {
            episodes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return games.map(game => this.toDomain(game));
  }

  async findByCreator(creatorId: string): Promise<Game[]> {
    const games = await this.prisma.game.findMany({
      where: { creatorId },
      include: {
        presenters: {
          include: {
            episodes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return games.map(game => this.toDomain(game));
  }

  async findByStatus(status: '準備中' | '出題中' | '締切'): Promise<Game[]> {
    const games = await this.prisma.game.findMany({
      where: { status },
      include: {
        presenters: {
          include: {
            episodes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return games.map(game => this.toDomain(game));
  }

  async findById(gameId: string): Promise<Game | null> {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        presenters: {
          include: {
            episodes: true
          }
        }
      }
    });

    if (!game) {
      return null;
    }

    return this.toDomain(game);
  }

  async create(game: Game): Promise<void> {
    await this.prisma.game.create({
      data: {
        id: game.id,
        name: game.name?.value ?? null,
        creatorId: game.creatorId,
        playerLimit: game.playerLimit,
        status: game.status.value,
        createdAt: game.createdAt,
        updatedAt: game.updatedAt,
        presenters: {
          create: game.presenters.map(presenter => ({
            id: presenter.id,
            nickname: presenter.nickname,
            createdAt: presenter.createdAt,
            episodes: {
              create: presenter.episodes.map(episode => ({
                id: episode.id,
                text: episode.text.value,
                isLie: episode.isLie,
                createdAt: episode.createdAt
              }))
            }
          }))
        }
      }
    });
  }

  async update(game: Game): Promise<void> {
    await this.prisma.game.update({
      where: { id: game.id },
      data: {
        name: game.name?.value ?? null,
        playerLimit: game.playerLimit,
        status: game.status.value,
        updatedAt: game.updatedAt
      }
    });
  }

  async delete(gameId: string): Promise<void> {
    await this.prisma.game.delete({
      where: { id: gameId }
    });
  }

  private toDomain(data: any): Game {
    const presenters = data.presenters.map((p: any) => {
      const episodes = p.episodes.map((e: any) =>
        Episode.reconstitute({
          id: e.id,
          presenterId: e.presenterId,
          text: e.text,
          isLie: e.isLie,
          createdAt: e.createdAt
        })
      );

      return Presenter.reconstitute({
        id: p.id,
        gameId: p.gameId,
        nickname: p.nickname,
        episodes,
        createdAt: p.createdAt
      });
    });

    return Game.reconstitute({
      id: data.id,
      name: data.name,
      creatorId: data.creatorId,
      playerLimit: data.playerLimit,
      status: data.status,
      presenters,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }
}
```

#### Step 4.4: Run Tests (Verify Green)

```bash
npm test tests/integration/repositories/
```

### Phase 5: Presentation Layer (Server Actions, Pages, Components)

**Goal**: Build user interface with Server Components and Client Components.

#### Step 5.1: Implement Server Actions

Create `src/app/actions/game.ts`:

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { PrismaClient } from '@prisma/client';
import { PrismaGameRepository } from '@/server/infrastructure/repositories/PrismaGameRepository';
import { CreateGame } from '@/server/application/use-cases/games/CreateGame';
import { UpdateGame } from '@/server/application/use-cases/games/UpdateGame';
import { DeleteGame } from '@/server/application/use-cases/games/DeleteGame';
import { ChangeGameStatus } from '@/server/application/use-cases/games/ChangeGameStatus';
import { getSessionId } from './session';

const prisma = new PrismaClient();
const gameRepository = new PrismaGameRepository(prisma);

export async function createGameAction(formData: {
  name?: string;
  playerLimit: number;
  presenters?: Array<{
    nickname: string;
    episodes: Array<{ text: string; isLie: boolean }>;
  }>;
}) {
  try {
    const sessionId = await getSessionId();
    if (!sessionId) {
      return { success: false, error: 'セッションが見つかりません' };
    }

    const useCase = new CreateGame(gameRepository);
    const gameId = await useCase.execute({
      creatorId: sessionId,
      playerLimit: formData.playerLimit,
      name: formData.name,
      presenters: formData.presenters
    });

    revalidatePath('/games');
    return { success: true, gameId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'エラーが発生しました'
    };
  }
}

export async function updateGameAction(formData: {
  gameId: string;
  playerLimit?: number;
}) {
  try {
    const useCase = new UpdateGame(gameRepository);
    await useCase.execute(formData);

    revalidatePath('/games');
    revalidatePath(`/games/${formData.gameId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'エラーが発生しました'
    };
  }
}

export async function changeGameStatusAction(formData: {
  gameId: string;
  action: 'start' | 'close';
}) {
  try {
    const useCase = new ChangeGameStatus(gameRepository);
    await useCase.execute(formData);

    revalidatePath('/games');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'エラーが発生しました'
    };
  }
}

export async function deleteGameAction(gameId: string) {
  try {
    const useCase = new DeleteGame(gameRepository);
    await useCase.execute({ gameId });

    revalidatePath('/games');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'エラーが発生しました'
    };
  }
}
```

#### Step 5.2: Implement Custom Hooks

Create `src/components/domain/game/GameForm/hooks/useGameForm.ts`:

```typescript
import { useState } from 'react';
import { z } from 'zod';

const GameFormSchema = z.object({
  name: z.string().max(100).optional(),
  playerLimit: z.number().int().min(1).max(100)
});

export interface PresenterInput {
  nickname: string;
  episodes: { text: string; isLie: boolean }[];
}

export interface GameFormData {
  name?: string;
  playerLimit: number;
  presenters: PresenterInput[];
}

export function useGameForm(initialData?: Partial<GameFormData>) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [playerLimit, setPlayerLimit] = useState(initialData?.playerLimit ?? 10);
  const [presenters, setPresenters] = useState<PresenterInput[]>(
    initialData?.presenters ?? []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    try {
      GameFormSchema.parse({ name: name || undefined, playerLimit });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const getFormData = (): GameFormData => ({
    name: name || undefined,
    playerLimit,
    presenters
  });

  return {
    name,
    setName,
    playerLimit,
    setPlayerLimit,
    presenters,
    setPresenters,
    errors,
    validate,
    getFormData
  };
}
```

Create `src/components/domain/game/GameForm/hooks/usePresenterManager.ts`:

```typescript
import { useState } from 'react';

export interface EpisodeInput {
  text: string;
  isLie: boolean;
}

export interface PresenterInput {
  nickname: string;
  episodes: EpisodeInput[];
}

export function usePresenterManager(
  presenters: PresenterInput[],
  setPresenters: (presenters: PresenterInput[]) => void
) {
  const addPresenter = () => {
    if (presenters.length >= 10) {
      return { error: '出題者は最大10人までです' };
    }

    setPresenters([
      ...presenters,
      { nickname: '', episodes: [] }
    ]);

    return { success: true };
  };

  const removePresenter = (index: number) => {
    setPresenters(presenters.filter((_, i) => i !== index));
  };

  const updatePresenter = (index: number, updates: Partial<PresenterInput>) => {
    const updated = [...presenters];
    updated[index] = { ...updated[index], ...updates };
    setPresenters(updated);
  };

  const addEpisode = (presenterIndex: number) => {
    const presenter = presenters[presenterIndex];
    if (presenter.episodes.length >= 3) {
      return { error: 'エピソードは3つまでです' };
    }

    updatePresenter(presenterIndex, {
      episodes: [
        ...presenter.episodes,
        { text: '', isLie: false }
      ]
    });

    return { success: true };
  };

  const updateEpisode = (
    presenterIndex: number,
    episodeIndex: number,
    updates: Partial<EpisodeInput>
  ) => {
    const presenter = presenters[presenterIndex];
    const episodes = [...presenter.episodes];
    episodes[episodeIndex] = { ...episodes[episodeIndex], ...updates };
    updatePresenter(presenterIndex, { episodes });
  };

  return {
    addPresenter,
    removePresenter,
    updatePresenter,
    addEpisode,
    updateEpisode
  };
}
```

#### Step 5.3: Implement Components

Create `src/components/domain/game/GameForm/GameForm.tsx`:

```typescript
'use client';

import { useGameForm } from './hooks/useGameForm';
import { usePresenterManager } from './hooks/usePresenterManager';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';

interface GameFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export function GameForm({ onSubmit, initialData }: GameFormProps) {
  const {
    name,
    setName,
    playerLimit,
    setPlayerLimit,
    presenters,
    setPresenters,
    errors,
    validate,
    getFormData
  } = useGameForm(initialData);

  const {
    addPresenter,
    removePresenter,
    updatePresenter,
    addEpisode,
    updateEpisode
  } = usePresenterManager(presenters, setPresenters);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit(getFormData());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          ゲーム名（任意）
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          placeholder="例: 金曜夜のゲーム"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="playerLimit" className="block text-sm font-medium">
          プレイヤー数
        </label>
        <Input
          id="playerLimit"
          type="number"
          value={playerLimit}
          onChange={(e) => setPlayerLimit(Number(e.target.value))}
          min={1}
          max={100}
        />
        {errors.playerLimit && (
          <p className="mt-1 text-sm text-red-600">{errors.playerLimit}</p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">出題者</h3>
          <Button type="button" onClick={addPresenter} variant="secondary">
            出題者を追加
          </Button>
        </div>

        {presenters.map((presenter, presenterIndex) => (
          <div key={presenterIndex} className="mb-6 p-4 border rounded">
            <div className="flex justify-between items-center mb-4">
              <Input
                type="text"
                value={presenter.nickname}
                onChange={(e) =>
                  updatePresenter(presenterIndex, { nickname: e.target.value })
                }
                placeholder="ニックネーム"
                aria-label="ニックネーム"
              />
              <Button
                type="button"
                onClick={() => removePresenter(presenterIndex)}
                variant="danger"
                size="sm"
              >
                削除
              </Button>
            </div>

            <div className="space-y-2">
              {presenter.episodes.map((episode, episodeIndex) => (
                <div key={episodeIndex} className="flex gap-2">
                  <Input
                    type="text"
                    value={episode.text}
                    onChange={(e) =>
                      updateEpisode(presenterIndex, episodeIndex, {
                        text: e.target.value
                      })
                    }
                    placeholder={`エピソード ${episodeIndex + 1}`}
                    maxLength={1000}
                  />
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={episode.isLie}
                      onChange={(e) =>
                        updateEpisode(presenterIndex, episodeIndex, {
                          isLie: e.target.checked
                        })
                      }
                    />
                    <span className="text-sm">ウソ</span>
                  </label>
                </div>
              ))}

              {presenter.episodes.length < 3 && (
                <Button
                  type="button"
                  onClick={() => addEpisode(presenterIndex)}
                  variant="secondary"
                  size="sm"
                >
                  エピソードを追加
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full">
        ゲームを作成
      </Button>
    </form>
  );
}
```

#### Step 5.4: Write E2E Tests

Create `tests/e2e/game-creation.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Game Creation Flow', () => {
  test('should create a game with name and presenters', async ({ page }) => {
    await page.goto('/games/create');

    // Fill game name
    await page.fill('input[id="name"]', 'Friday Night Fun');

    // Fill player limit
    await page.fill('input[id="playerLimit"]', '15');

    // Add presenter
    await page.click('button:has-text("出題者を追加")');
    await page.fill('input[placeholder="ニックネーム"]', 'Alice');

    // Add episodes
    await page.click('button:has-text("エピソードを追加")');
    await page.fill('input[placeholder="エピソード 1"]', 'I climbed Mount Fuji');

    await page.click('button:has-text("エピソードを追加")');
    await page.fill('input[placeholder="エピソード 2"]', 'I swam with dolphins');

    await page.click('button:has-text("エピソードを追加")');
    await page.fill('input[placeholder="エピソード 3"]', 'I met a celebrity');

    // Mark episode 2 as lie
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(1).check();

    // Submit
    await page.click('button:has-text("ゲームを作成")');

    // Verify redirect to game list
    await expect(page).toHaveURL('/games');
    await expect(page.locator('text=Friday Night Fun')).toBeVisible();
  });
});
```

Run E2E tests:

```bash
npm run test:e2e
```

## Testing Strategy

### Test Pyramid

```
         /\          E2E Tests (Playwright)
        /  \         - Full user journeys
       /────\        - Critical paths only
      /      \
     /────────\      Component Tests (RTL)
    /          \     - UI behavior with hooks
   /────────────\    - User interactions
  /              \
 /────────────────\  Unit Tests (Vitest)
/                  \ - Domain entities
                     - Use cases
                     - Value objects
                     - Custom hooks
```

### TDD Cycle for Each Layer

1. **Red**: Write failing test based on requirements
2. **Green**: Implement minimum code to pass
3. **Refactor**: Improve code while keeping tests green

### Test Coverage Requirements

- **Domain Layer**: 100% coverage (business rules are critical)
- **Application Layer**: 100% coverage (use cases are critical)
- **Infrastructure Layer**: Integration tests for repositories
- **Presentation Layer**: Component tests for all UI components
- **E2E**: Cover main user flows (P1 user stories)

### Running Tests

```bash
# Unit tests (watch mode)
npm test -- --watch

# Integration tests
npm test tests/integration/

# Component tests
npm test tests/component/

# E2E tests
npm run test:e2e

# Coverage report
npm test -- --coverage
```

## Common Pitfalls

### 1. Violating Clean Architecture

**DON'T**: Import infrastructure (Prisma) in domain layer
```typescript
// ❌ BAD: Domain entity importing Prisma
import { PrismaClient } from '@prisma/client';

export class Game {
  async save() {
    const prisma = new PrismaClient();
    await prisma.game.create(...);
  }
}
```

**DO**: Keep domain layer framework-agnostic
```typescript
// ✅ GOOD: Domain entity with no infrastructure dependencies
export class Game {
  // Pure business logic only
}

// Repository in infrastructure layer handles persistence
export class PrismaGameRepository implements IGameRepository {
  async create(game: Game): Promise<void> {
    await this.prisma.game.create(...);
  }
}
```

### 2. Putting Logic in Components

**DON'T**: Write logic directly in components
```typescript
// ❌ BAD: Logic mixed with rendering
export function GameForm() {
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    // Complex validation logic here
  };

  return <form>...</form>;
}
```

**DO**: Extract all logic into custom hooks
```typescript
// ✅ GOOD: Component is purely presentational
export function GameForm() {
  const { name, setName, errors, validate } = useGameForm();
  return <form>...</form>;
}

// hooks/useGameForm.ts
export function useGameForm() {
  // All logic here
}
```

### 3. Skipping Tests

**DON'T**: Write implementation before tests
```typescript
// ❌ BAD: Implementation first
export class CreateGame {
  async execute(request: CreateGameRequest): Promise<string> {
    // Implementation without tests
  }
}
```

**DO**: Write tests first (TDD)
```typescript
// ✅ GOOD: Test first
describe('CreateGame', () => {
  it('should create a game with custom name', async () => {
    // Test defines expected behavior
  });
});

// Then implement to make test pass
```

### 4. Exposing Confidential Data

**DON'T**: Return lie markers in public DTOs
```typescript
// ❌ BAD: Public DTO includes isLie
export interface EpisodeResponse {
  id: string;
  text: string;
  isLie: boolean; // SECURITY ISSUE!
}
```

**DO**: Use separate DTOs for different access levels
```typescript
// ✅ GOOD: Public DTO without isLie
export interface EpisodeResponse {
  id: string;
  text: string;
  // NO isLie field
}

// ✅ GOOD: Private DTO for moderator/presenter
export interface EpisodeWithLieResponse extends EpisodeResponse {
  isLie: boolean; // Only for authorized users
}
```

### 5. Not Using Server Components

**DON'T**: Fetch data in Client Components
```typescript
// ❌ BAD: useEffect in Client Component
'use client';

export function GameListPage() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetch('/api/games').then(r => r.json()).then(setGames);
  }, []);

  return <div>{games.map(...)}</div>;
}
```

**DO**: Use Server Components for data fetching
```typescript
// ✅ GOOD: Server Component fetches data
export async function GameListPage() {
  const games = await getGames(); // Server-side fetch

  return <GameList games={games} />; // Pass to Client Component
}
```

## Helpful Commands

### Development

```bash
# Start dev server
npm run dev

# Type check
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

### Database (Prisma)

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (careful!)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Check migration status
npx prisma migrate status
```

### Testing

```bash
# All tests
npm test

# Watch mode (TDD)
npm test -- --watch

# Specific test file
npm test tests/unit/entities/Game.test.ts

# Coverage report
npm test -- --coverage

# E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e -- --ui
```

### Git Workflow

```bash
# Create feature branch
git checkout -b 002-game-preparation

# Stage changes
git add .

# Commit (after each completed task)
git commit -m "feat: add Game entity with custom name support"

# Push to remote
git push origin 002-game-preparation
```

## References

### Feature Documentation
- **Feature Spec**: `specs/002-game-preparation/spec.md`
- **Implementation Plan**: `specs/002-game-preparation/plan.md`
- **Data Model**: `specs/002-game-preparation/data-model.md`
- **Project Constitution**: `.specify/memory/constitution.md`

### API Contracts
- **Server Actions**: `specs/002-game-preparation/contracts/game-actions.yaml`
- **Domain Schemas**: `specs/002-game-preparation/contracts/domain-schemas.yaml`

### Architecture Resources
- [Clean Architecture by Robert Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/reference/react/use-server)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vitest Documentation](https://vitest.dev)

### Key Concepts

1. **Clean Architecture Dependency Rule**: Outer layers depend on inner layers, never the reverse
2. **Custom Hooks Pattern**: Extract ALL component logic into testable hooks
3. **Server Components First**: Default to RSC, use Client Components only when needed
4. **TDD Discipline**: Red (test) → Green (implement) → Refactor (improve)
5. **Type Safety**: Strict TypeScript + Zod schemas for runtime validation

---

**Happy Coding!** Follow this guide, adhere to TDD, and you'll build a maintainable, testable feature that follows all project conventions.
