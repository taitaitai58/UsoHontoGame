# Contract: Validate Game for Answers

**Action**: `validateGameForAnswers`
**File**: `src/app/actions/answers.ts`
**Type**: Server Action (Next.js)
**Requirements**: FR-008, FR-009, FR-010, User Story 2

## Purpose

Pre-validate whether the current session can access the answer screen for a game. Checks game status, presenter count, and participation limits WITHOUT creating participation records. Used for early validation before showing the answer form.

## Function Signature

```typescript
'use server';

async function validateGameForAnswers(
  gameId: string
): Promise<ValidateGameForAnswersResult>
```

## Request

### Parameters

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| gameId | string | Yes | Non-empty, valid cuid | Game identifier |

**Session Context** (implicit, from cookies):
- sessionId: string (extracted from session cookie)
- nickname: string (extracted from session cookie)

### Example Request

```typescript
import { validateGameForAnswers } from '@/app/actions/answers';

// Before showing answer screen
const result = await validateGameForAnswers('game-abc123');
```

### Zod Schema

```typescript
import { z } from 'zod';

export const ValidateGameForAnswersSchema = z.object({
  gameId: z.string().min(1, 'Game ID is required')
});

export type ValidateGameForAnswersInput = z.infer<typeof ValidateGameForAnswersSchema>;
```

## Response

### Success Response

```typescript
{
  success: true;
  data: {
    canAccess: boolean;
    hasParticipated: boolean;
    participantCount: number;
    maxParticipants: number | null;
  };
}
```

### Error Responses

```typescript
type ValidateGameForAnswersError =
  | { success: false; error: 'INVALID_SESSION'; message: 'セッションが無効です' }
  | { success: false; error: 'GAME_NOT_FOUND'; message: 'ゲームが見つかりません' }
  | { success: false; error: 'GAME_NOT_PUBLISHED'; message: 'このゲームはまだ出題されていません' }
  | { success: false; error: 'GAME_CLOSED'; message: 'このゲームは既に締め切られました' }
  | { success: false; error: 'NO_PRESENTERS'; message: 'このゲームには出題者がいません' }
  | { success: false; error: 'PARTICIPANT_LIMIT'; message: '参加人数が上限に達しました' };
```

### Full Type Definition

```typescript
export type ValidateGameForAnswersResult =
  | {
      success: true;
      data: {
        canAccess: boolean;          // Whether session can access answer screen
        hasParticipated: boolean;    // Whether session already has participation record
        participantCount: number;    // Current participant count
        maxParticipants: number | null; // Participant limit (null = unlimited)
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

1. **Session Validation**
   - Extract session from cookies
   - Verify session exists and has nickname
   - Error: INVALID_SESSION if missing

2. **Game Existence & Status**
   - Fetch game by ID with presenters
   - Error: GAME_NOT_FOUND if not found
   - Error: GAME_NOT_PUBLISHED if status is "準備中"
   - Error: GAME_CLOSED if status is "締切"

3. **Presenter Count Validation**
   - Verify presenters.length > 0
   - Error: NO_PRESENTERS if zero presenters

4. **Participation Status Check**
   - Check if session has participation record for game
   - Get current participant count

5. **Access Determination**
   - If hasParticipated: canAccess = true (already enrolled)
   - If not hasParticipated:
     - If no limit (maxParticipants === null): canAccess = true
     - If participantCount < maxParticipants: canAccess = true
     - Otherwise: canAccess = false, Error: PARTICIPANT_LIMIT

### Pseudo-code

```typescript
async function validateGameForAnswers(gameId: string) {
  // 1. Session validation
  const session = await getSession();
  if (!session || !session.nickname) {
    return { success: false, error: 'INVALID_SESSION', message: 'セッションが無効です' };
  }

  // 2. Game validation
  const game = await gameRepository.findById(gameId);
  if (!game) {
    return { success: false, error: 'GAME_NOT_FOUND', message: 'ゲームが見つかりません' };
  }
  if (game.status === '準備中') {
    return { success: false, error: 'GAME_NOT_PUBLISHED', message: 'このゲームはまだ出題されていません' };
  }
  if (game.status === '締切') {
    return { success: false, error: 'GAME_CLOSED', message: 'このゲームは既に締め切られました' };
  }

  // 3. Presenter validation
  if (game.presenters.length === 0) {
    return { success: false, error: 'NO_PRESENTERS', message: 'このゲームには出題者がいません' };
  }

  // 4. Participation check
  const hasParticipated = await participationRepository.exists(session.sessionId, gameId);
  const participantCount = await participationRepository.countByGameId(gameId);

  // 5. Access determination
  let canAccess = true;

  if (!hasParticipated && game.maxParticipants !== null) {
    if (participantCount >= game.maxParticipants) {
      canAccess = false;
      return {
        success: false,
        error: 'PARTICIPANT_LIMIT',
        message: '参加人数が上限に達しました'
      };
    }
  }

  return {
    success: true,
    data: {
      canAccess,
      hasParticipated,
      participantCount,
      maxParticipants: game.maxParticipants
    }
  };
}
```

## State Changes

**No State Changes**: This is a read-only validation operation. No participation or answer records are created.

## Use Cases

### 1. Page Guard (Server Component)

Validate before rendering answer screen:

```typescript
// app/games/[id]/answer/page.tsx
export default async function AnswerPage({ params }: { params: { id: string } }) {
  const result = await validateGameForAnswers(params.id);

  if (!result.success) {
    redirect('/?error=' + result.error);
  }

  if (!result.data.canAccess) {
    redirect('/?error=limit');
  }

  // Render answer form
  return <AnswerSubmissionPage gameId={params.id} />;
}
```

### 2. Client-Side Check (Before Navigation)

Validate before navigating to answer screen:

```typescript
// components/GameListItem.tsx
async function handleJoinGame(gameId: string) {
  const result = await validateGameForAnswers(gameId);

  if (result.success && result.data.canAccess) {
    router.push(`/games/${gameId}/answer`);
  } else if (result.success && !result.data.canAccess) {
    toast.error('参加人数が上限に達しました');
  } else {
    toast.error(result.message);
  }
}
```

### 3. Participant Count Display

Show participant count without creating participation:

```typescript
const result = await validateGameForAnswers(gameId);

if (result.success) {
  const { participantCount, maxParticipants } = result.data;
  const limitText = maxParticipants
    ? `${participantCount}/${maxParticipants}名`
    : `${participantCount}名`;

  return <div>参加者: {limitText}</div>;
}
```

## Performance

**Expected Latency**: <50ms
- Session read: ~5ms
- Game fetch: ~10ms
- Participation exists check: ~10ms (indexed)
- Participation count: ~10ms (indexed)
- Total: ~35ms

**Query Optimization**:
- Indexed queries for participation checks
- No nested includes needed (only presenters for count)

## Security Considerations

1. **Session Required**: Must have valid session to check access
2. **Read-Only**: No state changes, safe to call multiple times
3. **No Race Condition**: Actual participation created at submission time
4. **Rate Limiting**: Consider adding if called excessively

## Error Handling

### Client-side Handling

```typescript
const result = await validateGameForAnswers(gameId);

if (result.success) {
  if (result.data.canAccess) {
    // Safe to show answer screen or navigate
    router.push(`/games/${gameId}/answer`);
  } else {
    // Access denied (should have returned error, but handle defensively)
    toast.error('アクセスできません');
    router.push('/');
  }
} else {
  // Show error and redirect
  toast.error(result.message);

  switch (result.error) {
    case 'GAME_CLOSED':
    case 'GAME_NOT_PUBLISHED':
    case 'NO_PRESENTERS':
    case 'PARTICIPANT_LIMIT':
      router.push('/');
      break;
    case 'INVALID_SESSION':
      router.push('/'); // May redirect to session creation
      break;
    default:
      // Unknown error, stay or go home
      router.push('/');
  }
}
```

## Testing

### Unit Tests

```typescript
describe('validateGameForAnswers', () => {
  it('should allow access when game is valid and under limit', async () => {
    // Arrange: Setup game in 出題中 with space
    // Act: Call validateGameForAnswers
    // Assert: Success, canAccess = true
  });

  it('should allow access when session already participated even at limit', async () => {
    // Arrange: Game at max, session already participated
    // Act: Call validateGameForAnswers
    // Assert: Success, canAccess = true, hasParticipated = true
  });

  it('should deny access when participant limit reached', async () => {
    // Arrange: Game at max, new session
    // Act: Call validateGameForAnswers
    // Assert: Error PARTICIPANT_LIMIT
  });

  it('should allow access when no participant limit set', async () => {
    // Arrange: Game with maxParticipants = null
    // Act: Call validateGameForAnswers
    // Assert: Success, canAccess = true
  });

  it('should reject when game status is 準備中', async () => {
    // Arrange: Game in preparation
    // Act: Call validateGameForAnswers
    // Assert: Error GAME_NOT_PUBLISHED
  });

  it('should reject when game status is 締切', async () => {
    // Arrange: Closed game
    // Act: Call validateGameForAnswers
    // Assert: Error GAME_CLOSED
  });

  it('should reject when game has no presenters', async () => {
    // Arrange: Game with 0 presenters
    // Act: Call validateGameForAnswers
    // Assert: Error NO_PRESENTERS
  });

  it('should reject when session is invalid', async () => {
    // Arrange: No session cookie
    // Act: Call validateGameForAnswers
    // Assert: Error INVALID_SESSION
  });
});
```

### Integration Tests

```typescript
describe('validateGameForAnswers integration', () => {
  it('should handle concurrent checks correctly', async () => {
    // Test multiple sessions checking at same time
    // Verify no race conditions in count
  });

  it('should reflect real-time participant count changes', async () => {
    // Create participation, then check again
    // Verify count increased
  });
});
```

## Examples

### Example 1: Successful Validation

```typescript
const result = await validateGameForAnswers('game-xyz');

if (result.success) {
  console.log('Can Access:', result.data.canAccess); // true
  console.log('Has Participated:', result.data.hasParticipated); // false
  console.log('Participant Count:', result.data.participantCount); // 3
  console.log('Max Participants:', result.data.maxParticipants); // 10
}
```

### Example 2: At Participant Limit

```typescript
const result = await validateGameForAnswers('game-xyz');

if (!result.success && result.error === 'PARTICIPANT_LIMIT') {
  console.log('Game is full');
  // Redirect to TOP page
}
```

### Example 3: Already Participated (Can Still Access)

```typescript
const result = await validateGameForAnswers('game-xyz');

if (result.success) {
  if (result.data.hasParticipated) {
    console.log('You have already joined this game');
    // Still allow access to modify answer
  }
  console.log('Can Access:', result.data.canAccess); // true
}
```

## Related Contracts

- [submit-answer.md](./submit-answer.md) - Answer submission (performs similar validation)
- [get-game-for-answers.md](./get-game-for-answers.md) - Fetch game data (called after validation passes)

## References

- Feature Spec: [../spec.md](../spec.md)
- Data Model: [../data-model.md](../data-model.md)
- Research: [../research.md](../research.md)
