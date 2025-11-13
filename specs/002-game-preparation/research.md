# Research: Game Preparation Feature

**Feature Branch**: `002-game-preparation`
**Created**: 2025-11-11
**Status**: Complete

This document captures technical research and design decisions for the game preparation feature implementation.

---

## 1. Presenter/Episode Cascade Deletion Pattern

### Decision
Use Prisma's built-in cascade deletion with `onDelete: Cascade` in the schema relations for both Presenter → Episode and Game → Presenter relationships.

### Rationale
1. **Database-Level Enforcement**: Cascade deletion at the database level ensures data integrity regardless of the application layer, preventing orphaned records even if direct database operations occur.

2. **Performance**: Database-level cascades are more efficient than application-level deletion loops, especially with multiple nested relationships.

3. **Simplicity**: Single delete operation on parent automatically handles all children, reducing complexity in repository methods and use cases.

4. **Consistency with Project Patterns**: The existing codebase uses Prisma exclusively for data access, making database-level cascades the natural choice.

### Implementation in Prisma Schema

```prisma
model Game {
  id             String      @id @default(uuid())
  name           String
  creatorId      String
  maxPlayers     Int
  currentPlayers Int         @default(0)
  status         String      @default("準備中")
  presenters     Presenter[] // Cascade will delete all presenters
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  @@index([creatorId])
  @@index([status])
}

model Presenter {
  id        String    @id @default(uuid())
  gameId    String
  nickname  String
  episodes  Episode[] // Cascade will delete all episodes
  createdAt DateTime  @default(now())

  game Game @relation(fields: [gameId], references: [id], onDelete: Cascade)

  @@index([gameId])
}

model Episode {
  id          String   @id @default(uuid())
  presenterId String
  text        String
  isLie       Boolean
  createdAt   DateTime @default(now())

  presenter Presenter @relation(fields: [presenterId], references: [id], onDelete: Cascade)

  @@index([presenterId])
}
```

### Alternatives Considered

#### Alternative 1: Application-Layer Cascade
```typescript
async deleteGame(id: GameId): Promise<void> {
  // Manual cascade in application code
  const presenters = await this.findPresentersByGameId(id.value);
  for (const presenter of presenters) {
    const episodes = await this.findEpisodesByPresenterId(presenter.id);
    for (const episode of episodes) {
      await this.removeEpisode(episode.id);
    }
    await this.removePresenter(presenter.id);
  }
  await this.prisma.game.delete({ where: { id: id.value } });
}
```

**Why rejected:**
- More complex and error-prone
- Multiple database round-trips (performance cost)
- Risk of partial deletions if errors occur mid-process
- Requires transaction management

#### Alternative 2: Soft Delete Pattern
```typescript
model Game {
  deletedAt DateTime?
}
```

**Why rejected:**
- Out of scope for MVP (Assumption 10 in spec.md)
- Adds complexity to all queries (must filter out deleted records)
- Doesn't align with project requirements

### Implementation Guidance

1. **Repository Layer**: Simple delete operations - Prisma handles cascades automatically
   ```typescript
   async delete(id: GameId): Promise<void> {
     await this.prisma.game.delete({
       where: { id: id.value }
     });
     // Presenters and Episodes automatically deleted
   }
   ```

2. **Use Case Layer**: Focus on business logic and authorization
   ```typescript
   class DeleteGame {
     async execute(input: DeleteGameInput): Promise<void> {
       // 1. Check authorization
       const game = await this.repository.findById(new GameId(input.gameId));
       if (game.creatorId !== input.requesterId) {
         throw new UnauthorizedError();
       }

       // 2. Simple delete - cascades handled by DB
       await this.repository.delete(new GameId(input.gameId));
     }
   }
   ```

3. **Testing**: Verify cascade behavior in integration tests
   ```typescript
   it('should cascade delete presenters and episodes when game is deleted', async () => {
     // Create game with presenters and episodes
     const game = await createTestGame();
     await addTestPresenter(game.id);

     // Delete game
     await repository.delete(game.id);

     // Verify cascades
     const presenters = await repository.findPresentersByGameId(game.id.value);
     expect(presenters).toHaveLength(0);
   });
   ```

---

## 2. Form State Management for Complex Forms

### Decision
Use **custom hooks with useState** for managing complex multi-entity forms during game creation, following the existing pattern established in the codebase.

### Rationale
1. **Consistency**: The codebase already uses custom hooks (`useGameForm`, `usePresenterForm`, `useEpisodeForm`) with useState for form management - this decision maintains architectural consistency.

2. **Separation of Concerns**: Each entity (Game, Presenter, Episode) has its own hook, making the code modular and testable.

3. **React 19 Compatibility**: Uses `useTransition` for non-blocking form submissions with Server Actions, leveraging React 19 features.

4. **Simplicity**: For the current scale (max 10 presenters × 3 episodes), useState is sufficient and easier to understand than more complex solutions.

5. **Server-Side Validation**: Zod validation happens both client-side (in hooks) and server-side (in Server Actions), reducing client-side state complexity.

### Implementation Pattern

```typescript
// usePresenterManager.ts - Manager hook for coordinating multiple presenters
"use client";

import { useState } from "react";
import type { PresenterWithLieDto } from "@/server/application/dto/PresenterWithLieDto";

interface UsePresenterManagerReturn {
  presenters: PresenterWithLieDto[];
  addPresenter: (presenter: PresenterWithLieDto) => void;
  removePresenter: (presenterId: string) => void;
  updatePresenterEpisode: (
    presenterId: string,
    episodeIndex: number,
    episodeData: Partial<Episode>
  ) => void;
  canAddPresenter: boolean;
  errors: string[];
}

export function usePresenterManager(): UsePresenterManagerReturn {
  const [presenters, setPresenters] = useState<PresenterWithLieDto[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const addPresenter = (presenter: PresenterWithLieDto) => {
    if (presenters.length >= 10) {
      setErrors(["最大10人までプレゼンターを追加できます"]);
      return;
    }
    setPresenters([...presenters, presenter]);
    setErrors([]);
  };

  const removePresenter = (presenterId: string) => {
    setPresenters(presenters.filter(p => p.id !== presenterId));
  };

  const updatePresenterEpisode = (
    presenterId: string,
    episodeIndex: number,
    episodeData: Partial<Episode>
  ) => {
    setPresenters(presenters.map(p => {
      if (p.id !== presenterId) return p;
      const updatedEpisodes = [...p.episodes];
      updatedEpisodes[episodeIndex] = {
        ...updatedEpisodes[episodeIndex],
        ...episodeData
      };
      return { ...p, episodes: updatedEpisodes };
    }));
  };

  return {
    presenters,
    addPresenter,
    removePresenter,
    updatePresenterEpisode,
    canAddPresenter: presenters.length < 10,
    errors
  };
}
```

```typescript
// Component usage example
function GameCreatePage() {
  const gameForm = useGameForm({ mode: "create" });
  const presenterManager = usePresenterManager();

  return (
    <form onSubmit={gameForm.handleSubmit}>
      <Input name="playerLimit" />

      {/* Presenter section */}
      <PresenterManager
        presenters={presenterManager.presenters}
        onAdd={presenterManager.addPresenter}
        onRemove={presenterManager.removePresenter}
        canAddMore={presenterManager.canAddPresenter}
      />

      <Button type="submit">Create Game</Button>
    </form>
  );
}
```

### Alternatives Considered

#### Alternative 1: useReducer for Complex State
```typescript
type Action =
  | { type: 'ADD_PRESENTER'; payload: Presenter }
  | { type: 'REMOVE_PRESENTER'; payload: string }
  | { type: 'UPDATE_EPISODE'; payload: { presenterId: string; episodeIndex: number; data: Episode } };

function presenterReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_PRESENTER': // ...
    case 'REMOVE_PRESENTER': // ...
  }
}
```

**Why not chosen:**
- Overkill for current complexity (10 presenters × 3 episodes = 30 items max)
- Adds boilerplate without significant benefit
- Not consistent with existing codebase patterns
- State updates are straightforward enough for useState

**When to use:** Consider if future requirements add complex nested state with many interdependencies (e.g., episode dependencies, conditional validation chains).

#### Alternative 2: React Hook Form with Zod
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(GameWithPresentersSchema),
  defaultValues: {
    playerLimit: 10,
    presenters: []
  }
});
```

**Why not chosen:**
- Adds new dependency (react-hook-form) not in current tech stack
- Project already uses custom hooks + Zod pattern successfully
- Server Actions pattern differs from typical react-hook-form usage
- Would require refactoring existing forms

**When to use:** Consider if form complexity increases significantly (e.g., 20+ fields, complex conditional validation, field dependencies).

#### Alternative 3: Nested State Objects
```typescript
const [formState, setFormState] = useState({
  game: { playerLimit: 10 },
  presenters: []
});
```

**Why not chosen:**
- Makes updates more verbose (nested spread operators)
- Harder to test individual pieces
- Violates single responsibility (one state managing multiple concerns)
- Conflicts with existing hook-per-entity pattern

### Implementation Guidance

1. **Hook Organization**: One hook per entity + one coordinator hook
   - `useGameForm`: Basic game fields (name, playerLimit)
   - `usePresenterForm`: Single presenter addition
   - `useEpisodeForm`: Single episode addition
   - `usePresenterManager`: Coordinates multiple presenters during creation

2. **State Updates**: Keep updates immutable and predictable
   ```typescript
   // Good: Immutable update
   setPresenters([...presenters, newPresenter]);

   // Bad: Direct mutation
   presenters.push(newPresenter);
   ```

3. **Validation Strategy**:
   - Client-side: Field-level validation in hooks using Zod
   - Server-side: Full validation in Server Actions before persistence
   - Don't duplicate complex business rules in client

4. **Error Handling**: Centralize errors at the hook level
   ```typescript
   const [errors, setErrors] = useState<Record<string, string[]>>({});
   ```

5. **Testing**: Test hooks independently with React Testing Library
   ```typescript
   import { renderHook, act } from '@testing-library/react';

   test('usePresenterManager limits to 10 presenters', () => {
     const { result } = renderHook(() => usePresenterManager());

     act(() => {
       for (let i = 0; i < 11; i++) {
         result.current.addPresenter(createMockPresenter());
       }
     });

     expect(result.current.presenters).toHaveLength(10);
     expect(result.current.errors).toContain('最大10人まで');
   });
   ```

---

## 3. Status Transition Validation

### Decision
Implement status transition validation **in the domain entity (Game)** with business logic enforced through domain methods.

### Rationale
1. **Clean Architecture Principle**: Business rules belong in the domain layer. Status transitions are core business rules that should be enforced regardless of how the entity is accessed.

2. **Single Source of Truth**: All status changes go through entity methods (`startAccepting()`, `close()`), ensuring validation always occurs.

3. **Type Safety**: Domain methods enforce valid transitions at compile time through method names, not runtime string checks.

4. **Consistency with Codebase**: Existing `Game` entity already uses this pattern for status transitions (see lines 228-254 in Game.ts).

5. **Testability**: Domain logic is easiest to test in isolation without infrastructure dependencies.

### Implementation

```typescript
// src/server/domain/entities/Game.ts

import { InvalidStatusTransitionError } from '../errors/InvalidStatusTransitionError';

export class Game {
  private _status: GameStatus;

  /**
   * Transitions game from 準備中 to 出題中
   * @throws InvalidStatusTransitionError if not in 準備中 status
   */
  startAccepting(): void {
    if (!this._status.isPreparation()) {
      throw new InvalidStatusTransitionError(
        this._status.toString(),
        '出題中',
        'Can only start accepting from 準備中 status'
      );
    }
    this._status = GameStatus.acceptingResponses();
    this._updatedAt = new Date();
  }

  /**
   * Transitions game from 出題中 to 締切
   * @throws InvalidStatusTransitionError if not in 出題中 status
   */
  close(): void {
    if (!this._status.isAcceptingResponses()) {
      throw new InvalidStatusTransitionError(
        this._status.toString(),
        '締切',
        'Can only close from 出題中 status'
      );
    }
    this._status = GameStatus.closed();
    this._updatedAt = new Date();
  }
}

// src/server/domain/errors/InvalidStatusTransitionError.ts
export class InvalidStatusTransitionError extends Error {
  constructor(
    public readonly from: string,
    public readonly to: string,
    message?: string
  ) {
    super(message || `Invalid status transition from ${from} to ${to}`);
    this.name = 'InvalidStatusTransitionError';
  }
}
```

```typescript
// src/server/application/use-cases/games/StartAcceptingResponses.ts

export class StartAcceptingResponses {
  async execute(input: StartAcceptingResponsesInput): Promise<StartAcceptingResponsesOutput> {
    // 1. Load game
    const game = await this.gameRepository.findById(new GameId(input.gameId));
    if (!game) {
      throw new NotFoundError(`Game ${input.gameId} not found`);
    }

    // 2. Additional business validation (beyond status)
    const presenters = await this.gameRepository.findPresentersByGameId(input.gameId);
    if (presenters.length === 0) {
      throw new ValidationError("At least one presenter required");
    }

    // 3. Transition status - throws InvalidStatusTransitionError if invalid
    game.startAccepting(); // Domain entity enforces the transition rule

    // 4. Persist
    await this.gameRepository.update(game);

    return { success: true };
  }
}
```

### Alternatives Considered

#### Alternative 1: State Machine Library (XState)
```typescript
import { createMachine, interpret } from 'xstate';

const gameStatusMachine = createMachine({
  id: 'game',
  initial: '準備中',
  states: {
    '準備中': {
      on: { START_ACCEPTING: '出題中' }
    },
    '出題中': {
      on: { CLOSE: '締切' }
    },
    '締切': {
      type: 'final'
    }
  }
});
```

**Why not chosen:**
- Overkill for 3 states with linear transitions
- Adds external dependency (XState)
- Increases complexity for minimal benefit
- Not consistent with project's lightweight approach

**When to use:** Consider if game status becomes more complex (e.g., 8+ states, non-linear transitions, concurrent statuses, time-based auto-transitions).

#### Alternative 2: Use Case Layer Validation
```typescript
class StartAcceptingResponses {
  async execute(input) {
    const game = await this.repository.findById(input.gameId);

    // Validation in use case
    if (game.status !== '準備中') {
      throw new InvalidStatusTransitionError();
    }

    game.setStatus('出題中'); // Generic setter
    await this.repository.update(game);
  }
}
```

**Why not chosen:**
- Violates Clean Architecture (business rules should be in domain)
- Duplicates validation logic if multiple use cases change status
- Domain entity becomes anemic (data container without behavior)
- Harder to test status transition rules in isolation

#### Alternative 3: Repository Layer Validation
```typescript
class PrismaGameRepository {
  async updateStatus(gameId: string, newStatus: string): Promise<void> {
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });

    // Validation in repository
    if (game.status === '準備中' && newStatus === '出題中') {
      await this.prisma.game.update({
        where: { id: gameId },
        data: { status: newStatus }
      });
    } else {
      throw new InvalidStatusTransitionError();
    }
  }
}
```

**Why not chosen:**
- Repository should be infrastructure concern, not business logic
- Makes testing business rules require database
- Violates separation of concerns
- Cannot unit test without mocking database

### Implementation Guidance

1. **Domain Entity Methods**: Create explicit methods for each transition
   ```typescript
   // Good: Named methods with clear intent
   game.startAccepting();
   game.close();

   // Bad: Generic setter
   game.setStatus(GameStatus.acceptingResponses());
   ```

2. **Error Handling**: Use specific error types for different validation failures
   ```typescript
   // Status transition error
   throw new InvalidStatusTransitionError(from, to, reason);

   // Business rule error (e.g., no presenters)
   throw new ValidationError("At least one presenter required");
   ```

3. **Use Case Responsibilities**:
   - Load entities from repository
   - Perform additional business validation (e.g., checking presenters exist)
   - Call domain entity methods (which enforce transition rules)
   - Persist changes
   ```typescript
   // Use case orchestrates, entity validates
   const game = await this.repository.findById(id);
   this.validatePresenters(game); // Use case validation
   game.startAccepting(); // Entity transition validation
   await this.repository.update(game);
   ```

4. **Testing Strategy**:
   ```typescript
   // Unit test: Domain entity transition logic
   describe('Game.startAccepting', () => {
     it('throws error when not in preparation status', () => {
       const game = createGameInAcceptingStatus();
       expect(() => game.startAccepting()).toThrow(InvalidStatusTransitionError);
     });
   });

   // Integration test: Use case with full flow
   describe('StartAcceptingResponses', () => {
     it('transitions game and persists to database', async () => {
       const game = await createTestGame();
       await useCase.execute({ gameId: game.id });
       const updated = await repository.findById(game.id);
       expect(updated.status).toBe('出題中');
     });
   });
   ```

5. **State Diagram Documentation**: Document valid transitions in code comments
   ```typescript
   /**
    * Game Status Transitions:
    *
    *   準備中 ──startAccepting()──> 出題中 ──close()──> 締切
    *
    * Invalid transitions throw InvalidStatusTransitionError
    */
   ```

---

## 4. Confidential Data Handling

### Decision
Use **separate DTOs for different user roles** to ensure lie markers are never exposed to unauthorized users. Implement role-based DTO selection at the use case layer.

### Rationale
1. **Type Safety**: Separate types (`EpisodeDto` vs `EpisodeWithLieDto`) make it impossible to accidentally expose confidential fields - compile-time safety rather than runtime filtering.

2. **Explicitness**: API signatures clearly indicate what data is returned, making security boundaries obvious in code reviews.

3. **Consistency with Codebase**: Project already uses this pattern (see `EpisodeDto.ts` and `EpisodeWithLieDto.ts`).

4. **Clean Architecture Alignment**: DTOs are defined in the application layer, acting as the boundary between domain and presentation layers.

5. **Performance**: No runtime filtering overhead - correct data is selected at query time.

### Implementation

```typescript
// src/server/application/dto/EpisodeDto.ts
/**
 * EpisodeDto - Public episode data WITHOUT lie marker
 * For players/public display
 */
export interface EpisodeDto {
  id: string;
  presenterId: string;
  text: string;
  createdAt: Date;
  // isLie intentionally excluded (FR-006)
}

// src/server/application/dto/EpisodeWithLieDto.ts
/**
 * EpisodeWithLieDto - Episode data WITH lie marker
 * For moderators/presenters only
 *
 * Security: Only expose to authorized users
 */
export interface EpisodeWithLieDto {
  id: string;
  presenterId: string;
  text: string;
  isLie: boolean; // CONFIDENTIAL (FR-006)
  createdAt: Date;
}
```

```typescript
// src/server/application/use-cases/games/GetPresenterEpisodes.ts
/**
 * Returns episodes with or without lie markers based on requester authorization
 */
export class GetPresenterEpisodes {
  async execute(input: GetPresenterEpisodesInput): Promise<GetPresenterEpisodesOutput> {
    const presenter = await this.repository.findPresenterById(input.presenterId);
    const game = await this.repository.findById(presenter.gameId);

    // Authorization check
    const isAuthorized =
      input.requesterId === game.creatorId || // Is moderator
      input.requesterId === presenter.nickname; // Is the presenter

    const episodes = await this.repository.findEpisodesByPresenterId(input.presenterId);

    // Return appropriate DTO based on authorization
    if (isAuthorized) {
      return {
        episodes: episodes.map(ep => this.toEpisodeWithLieDto(ep))
      };
    } else {
      return {
        episodes: episodes.map(ep => this.toEpisodeDto(ep)) // isLie field excluded
      };
    }
  }

  private toEpisodeDto(episode: Episode): EpisodeDto {
    return {
      id: episode.id,
      presenterId: episode.presenterId,
      text: episode.text,
      createdAt: episode.createdAt
      // isLie not included
    };
  }

  private toEpisodeWithLieDto(episode: Episode): EpisodeWithLieDto {
    return {
      id: episode.id,
      presenterId: episode.presenterId,
      text: episode.text,
      isLie: episode.isLie,
      createdAt: episode.createdAt
    };
  }
}
```

```typescript
// src/app/actions/presenter.ts
/**
 * Server Action: Get presenter episodes
 * Returns DTO based on authorization
 */
export async function getPresenterEpisodesAction(
  presenterId: string
): Promise<
  | { success: true; episodes: EpisodeDto[] } // Public DTO
  | { success: true; episodes: EpisodeWithLieDto[] } // With lie markers
  | { success: false; errors: Record<string, string[]> }
> {
  const sessionId = await getCookie(COOKIE_NAMES.SESSION_ID);

  const useCase = new GetPresenterEpisodes(repository);
  const result = await useCase.execute({
    presenterId,
    requesterId: sessionId
  });

  return { success: true, episodes: result.episodes };
}
```

### Alternatives Considered

#### Alternative 1: Runtime Field Filtering at Repository Layer
```typescript
class PrismaGameRepository {
  async findEpisodesByPresenterId(
    presenterId: string,
    includeConfidential: boolean
  ): Promise<Episode[]> {
    const episodes = await this.prisma.episode.findMany({
      where: { presenterId },
      select: {
        id: true,
        presenterId: true,
        text: true,
        createdAt: true,
        isLie: includeConfidential // Conditional field selection
      }
    });
    return episodes;
  }
}
```

**Why not chosen:**
- Authorization decision made too low in the stack (repository shouldn't know about users)
- Boolean flag is error-prone (`true`/`false` easy to mix up)
- No type safety - `Episode` type still includes `isLie` field
- Can accidentally expose `isLie` if filtering logic has bugs

#### Alternative 2: GraphQL-Style Field-Level Permissions
```typescript
const episodeResolver = {
  isLie: (episode, args, context) => {
    // Field resolver checks permissions
    if (context.user.role === 'moderator' || context.user.id === episode.presenterId) {
      return episode.isLie;
    }
    return null; // or throw error
  }
};
```

**Why not chosen:**
- Project doesn't use GraphQL (REST/Server Actions pattern)
- Adds complexity of permission rules scattered across field resolvers
- Runtime overhead for every field access
- Harder to test (need to mock context for every test)

**When to use:** Consider if project adopts GraphQL or requires very fine-grained field-level permissions across many resources.

#### Alternative 3: Single DTO with Optional Fields
```typescript
interface EpisodeDto {
  id: string;
  text: string;
  isLie?: boolean; // Optional, only present if authorized
}
```

**Why not chosen:**
- Type system can't enforce when `isLie` should/shouldn't be present
- Consumers must check `if (dto.isLie !== undefined)` everywhere
- Easy to forget to exclude field in some code paths
- Less explicit - security boundary not clear from types

### Implementation Guidance

1. **DTO Design Patterns**:
   ```typescript
   // Public DTO - no confidential fields
   export interface EpisodeDto {
     id: string;
     text: string;
   }

   // Private DTO - extends or duplicates with confidential fields
   export interface EpisodeWithLieDto {
     id: string;
     text: string;
     isLie: boolean; // Mark as CONFIDENTIAL in comments
   }
   ```

2. **Authorization at Use Case Layer**:
   ```typescript
   class GetPresenterEpisodes {
     async execute(input: { presenterId: string; requesterId: string }) {
       // 1. Load data
       const presenter = await this.repository.findPresenterById(input.presenterId);
       const game = await this.repository.findGameById(presenter.gameId);

       // 2. Check authorization
       const isAuthorized =
         input.requesterId === game.creatorId ||
         input.requesterId === presenter.nickname;

       // 3. Map to appropriate DTO
       return {
         episodes: isAuthorized
           ? this.toPrivateDto(episodes)
           : this.toPublicDto(episodes)
       };
     }
   }
   ```

3. **Repository Layer**: Always return full domain entities
   ```typescript
   // Repository returns domain entity (full data)
   async findEpisodesByPresenterId(presenterId: string): Promise<Episode[]> {
     return await this.prisma.episode.findMany({
       where: { presenterId }
     });
   }

   // Use case decides which DTO to return
   ```

4. **Server Action Return Types**: Be explicit about what's returned
   ```typescript
   // Bad: Unclear what's returned
   export async function getEpisodesAction(id: string): Promise<any>

   // Good: Clear DTO types
   export async function getEpisodesForModeratorAction(
     id: string
   ): Promise<{ episodes: EpisodeWithLieDto[] }>

   export async function getEpisodesForPlayerAction(
     id: string
   ): Promise<{ episodes: EpisodeDto[] }>
   ```

5. **Testing Strategy**:
   ```typescript
   describe('GetPresenterEpisodes', () => {
     it('returns isLie field for moderator', async () => {
       const result = await useCase.execute({
         presenterId: 'p1',
         requesterId: 'moderator-session-id'
       });

       expect(result.episodes[0]).toHaveProperty('isLie');
     });

     it('excludes isLie field for regular player', async () => {
       const result = await useCase.execute({
         presenterId: 'p1',
         requesterId: 'player-session-id'
       });

       expect(result.episodes[0]).not.toHaveProperty('isLie');
     });
   });
   ```

6. **Security Checklist**:
   - [ ] Confidential DTOs clearly marked with security comments
   - [ ] Authorization check happens before DTO mapping
   - [ ] Public endpoints never accept/return confidential DTOs
   - [ ] Integration tests verify field exclusion
   - [ ] Type system enforces correct DTO usage (no `any` types)

7. **Prisma Select Optimization** (Optional):
   ```typescript
   // For performance, can use Prisma select to exclude isLie at query time
   // for public endpoints, but still return public DTO for type safety

   async findEpisodesForPublic(presenterId: string): Promise<Episode[]> {
     const episodes = await this.prisma.episode.findMany({
       where: { presenterId },
       select: {
         id: true,
         presenterId: true,
         text: true,
         createdAt: true
         // isLie intentionally excluded from query
       }
     });
     return episodes.map(this.toDomain);
   }
   ```

---

## Summary

### Key Architectural Decisions

| Topic | Decision | Layer |
|-------|----------|-------|
| **Cascade Deletion** | Prisma `onDelete: Cascade` in schema | Infrastructure (Database) |
| **Form State** | Custom hooks with useState | Presentation (Hooks) |
| **Status Transitions** | Domain entity methods with validation | Domain (Entities) |
| **Confidential Data** | Separate DTOs for different user roles | Application (DTOs) |

### Decision Consistency

All four decisions maintain consistency with:
- **Clean Architecture**: Each decision respects layer boundaries
- **Type Safety**: TypeScript enforces correctness at compile time
- **Existing Patterns**: Follows established codebase conventions
- **Simplicity**: Chooses simple solutions appropriate to the problem scale
- **Testability**: All layers remain independently testable

### When to Revisit

Consider revisiting these decisions if:
- **Cascade Deletion**: Need soft deletes, audit trails, or recovery mechanisms
- **Form State**: Form complexity exceeds 50+ fields or requires complex field dependencies
- **Status Transitions**: Game status grows beyond 5 states or needs non-linear transitions
- **Confidential Data**: Need field-level permissions across many resources or adopt GraphQL

---

**Research Completed**: 2025-11-11
**Next Steps**: Proceed to data model design (`data-model.md`) and API contracts (`contracts/`)
