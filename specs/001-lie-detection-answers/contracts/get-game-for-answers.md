# Contract: Get Game for Answers

**Action**: `getGameForAnswers`
**File**: `src/app/actions/answers.ts`
**Type**: Server Action (Next.js)
**Requirements**: FR-002, FR-003, FR-015

## Purpose

Fetch game data needed for the answer submission screen, including all presenters and their episodes (WITHOUT the isLie flag). Validates that the game is in "出題中" status and has at least one presenter.

## Function Signature

```typescript
'use server';

async function getGameForAnswers(
  gameId: string
): Promise<GetGameForAnswersResult>
```

## Request

### Parameters

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| gameId | string | Yes | Non-empty, valid cuid | Game identifier |

### Example Request

```typescript
import { getGameForAnswers } from '@/app/actions/answers';

// From Server Component or Client Component
const result = await getGameForAnswers('game-abc123');
```

### Zod Schema

```typescript
import { z } from 'zod';

export const GetGameForAnswersSchema = z.object({
  gameId: z.string().min(1, 'Game ID is required')
});

export type GetGameForAnswersInput = z.infer<typeof GetGameForAnswersSchema>;
```

## Response

### Success Response

```typescript
{
  success: true;
  data: {
    game: {
      id: string;
      title: string;
      status: '出題中';
      maxParticipants: number | null;
      presenters: Array<{
        id: string;
        name: string;
        episodes: Array<{
          id: string;
          content: string;
          // NOTE: isLie is NEVER included for security
        }>;
      }>;
    };
  };
}
```

### Error Responses

```typescript
type GetGameForAnswersError =
  | { success: false; error: 'GAME_NOT_FOUND'; message: 'ゲームが見つかりません' }
  | { success: false; error: 'GAME_NOT_PUBLISHED'; message: 'このゲームはまだ出題されていません' }
  | { success: false; error: 'GAME_CLOSED'; message: 'このゲームは既に締め切られました' }
  | { success: false; error: 'NO_PRESENTERS'; message: 'このゲームには出題者がいません' };
```

### Full Type Definition

```typescript
export type GameForAnswers = {
  id: string;
  title: string;
  status: '出題中';
  maxParticipants: number | null;
  presenters: Array<{
    id: string;
    name: string;
    episodes: Array<{
      id: string;
      content: string;
    }>;
  }>;
};

export type GetGameForAnswersResult =
  | {
      success: true;
      data: {
        game: GameForAnswers;
      };
    }
  | {
      success: false;
      error: string;
      message: string;
    };
```

## Business Logic

### Validation Steps (in order)

1. **Game Existence**
   - Fetch game by ID with nested presenters and episodes
   - Error: GAME_NOT_FOUND if not found

2. **Game Status Validation**
   - Verify game.status === '出題中'
   - Error: GAME_NOT_PUBLISHED if status is "準備中"
   - Error: GAME_CLOSED if status is "締切"

3. **Presenter Count Validation**
   - Verify presenters.length > 0
   - Error: NO_PRESENTERS if zero presenters

4. **Data Sanitization**
   - Remove `isLie` field from all episodes
   - Return sanitized game data

### Pseudo-code

```typescript
async function getGameForAnswers(gameId: string) {
  // 1. Fetch game with relations
  const game = await prisma.game.findUnique({
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

  // 2. Validate existence
  if (!game) {
    return { success: false, error: 'GAME_NOT_FOUND', message: 'ゲームが見つかりません' };
  }

  // 3. Validate status
  if (game.status === '準備中') {
    return { success: false, error: 'GAME_NOT_PUBLISHED', message: 'このゲームはまだ出題されていません' };
  }
  if (game.status === '締切') {
    return { success: false, error: 'GAME_CLOSED', message: 'このゲームは既に締め切られました' };
  }

  // 4. Validate presenter count
  if (game.presenters.length === 0) {
    return { success: false, error: 'NO_PRESENTERS', message: 'このゲームには出題者がいません' };
  }

  // 5. Return sanitized data
  return {
    success: true,
    data: { game }
  };
}
```

## Data Sanitization

**CRITICAL SECURITY REQUIREMENT**: The `isLie` field must NEVER be included in the response during the "出題中" phase.

### Safe Prisma Query

```typescript
// ✅ CORRECT - explicit select without isLie
const game = await prisma.game.findUnique({
  where: { id: gameId },
  include: {
    presenters: {
      include: {
        episodes: {
          select: {
            id: true,
            content: true
            // isLie intentionally omitted
          }
        }
      }
    }
  }
});
```

### Unsafe Patterns

```typescript
// ❌ WRONG - includes all fields including isLie
const game = await prisma.game.findUnique({
  where: { id: gameId },
  include: {
    presenters: {
      include: {
        episodes: true  // Exposes isLie!
      }
    }
  }
});
```

## Performance

**Expected Latency**: <100ms
- Single query with nested includes: ~50-70ms
- No additional queries needed
- All data fetched in one round trip

**Query Optimization**:
- Uses Prisma's efficient join strategy
- Indexed by primary keys (id fields)
- No N+1 problem due to nested includes

## State Changes

**No State Changes**: This is a read-only operation. No database writes occur.

## Security Considerations

1. **isLie Protection**: MUST NOT expose the truth flag for episodes
2. **Status Validation**: Only "出題中" games are accessible
3. **No Session Required**: This endpoint can be called without authentication (game data is public once published)
4. **Rate Limiting**: Consider adding rate limiting if abuse occurs

## Error Handling

### Client-side Handling

```typescript
const result = await getGameForAnswers(gameId);

if (result.success) {
  const { game } = result.data;
  // Render answer form with presenters and episodes
  setGame(game);
} else {
  // Show error and redirect
  toast.error(result.message);

  if (result.error === 'GAME_CLOSED' || result.error === 'GAME_NOT_PUBLISHED' || result.error === 'NO_PRESENTERS') {
    // Redirect to TOP page
    router.push('/');
  } else if (result.error === 'GAME_NOT_FOUND') {
    // Redirect to TOP with 404
    router.push('/?error=not-found');
  }
}
```

## Testing

### Unit Tests

```typescript
describe('getGameForAnswers', () => {
  it('should return game with presenters and episodes', async () => {
    // Arrange: Setup game in 出題中 status with presenters
    // Act: Call getGameForAnswers
    // Assert: Success, game data returned
  });

  it('should NOT include isLie in episode data', async () => {
    // Arrange: Setup game with episodes
    // Act: Call getGameForAnswers
    // Assert: No episode has isLie property
  });

  it('should reject when game not found', async () => {
    // Arrange: Invalid game ID
    // Act: Call getGameForAnswers
    // Assert: Error GAME_NOT_FOUND
  });

  it('should reject when game status is 準備中', async () => {
    // Arrange: Setup game in preparation
    // Act: Call getGameForAnswers
    // Assert: Error GAME_NOT_PUBLISHED
  });

  it('should reject when game status is 締切', async () => {
    // Arrange: Setup closed game
    // Act: Call getGameForAnswers
    // Assert: Error GAME_CLOSED
  });

  it('should reject when game has no presenters', async () => {
    // Arrange: Setup game with 0 presenters
    // Act: Call getGameForAnswers
    // Assert: Error NO_PRESENTERS
  });
});
```

### Security Tests

```typescript
describe('getGameForAnswers security', () => {
  it('should never expose isLie field', async () => {
    // Arrange: Setup game with episodes where isLie=true
    const result = await getGameForAnswers(gameId);

    // Assert: Check that no episode has isLie property
    result.data.game.presenters.forEach(presenter => {
      presenter.episodes.forEach(episode => {
        expect(episode).not.toHaveProperty('isLie');
      });
    });
  });
});
```

## Examples

### Example 1: Successful Fetch

```typescript
const result = await getGameForAnswers('game-xyz');

if (result.success) {
  console.log('Game Title:', result.data.game.title);
  console.log('Presenters:', result.data.game.presenters.length);

  result.data.game.presenters.forEach(presenter => {
    console.log(`Presenter: ${presenter.name}`);
    console.log(`Episodes: ${presenter.episodes.length}`);

    presenter.episodes.forEach(episode => {
      console.log(`  - ${episode.content}`);
      // episode.isLie does NOT exist (undefined)
    });
  });
}
```

### Example 2: Error Handling

```typescript
const result = await getGameForAnswers('invalid-id');

if (!result.success) {
  console.error('Error:', result.error);   // → 'GAME_NOT_FOUND'
  console.error('Message:', result.message); // → 'ゲームが見つかりません'
}
```

### Example 3: Usage in Server Component

```typescript
// app/games/[id]/answer/page.tsx
export default async function AnswerPage({ params }: { params: { id: string } }) {
  const result = await getGameForAnswers(params.id);

  if (!result.success) {
    redirect('/?error=' + result.error);
  }

  return <AnswerSubmissionPage game={result.data.game} />;
}
```

### Example 4: Usage in Client Component

```typescript
'use client';

export function AnswerScreen({ gameId }: { gameId: string }) {
  const [game, setGame] = useState<GameForAnswers | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGame() {
      const result = await getGameForAnswers(gameId);

      if (result.success) {
        setGame(result.data.game);
      } else {
        setError(result.message);
      }
    }

    loadGame();
  }, [gameId]);

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!game) {
    return <Loading />;
  }

  return <GameAnswerForm game={game} />;
}
```

## Related Contracts

- [submit-answer.md](./submit-answer.md) - Submit answer (uses this data)
- [validate-game-for-answers.md](./validate-game-for-answers.md) - Pre-validation before showing answer screen

## References

- Feature Spec: [../spec.md](../spec.md)
- Data Model: [../data-model.md](../data-model.md)
- Research: [../research.md](../research.md)
- Prisma Docs: https://www.prisma.io/docs/concepts/components/prisma-client/select-fields
