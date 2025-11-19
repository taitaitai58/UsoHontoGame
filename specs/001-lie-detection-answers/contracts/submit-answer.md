# Contract: Submit Answer

**Action**: `submitAnswer`
**File**: `src/app/actions/answers.ts`
**Type**: Server Action (Next.js)
**Requirements**: FR-006, FR-012, FR-013, FR-014, FR-015

## Purpose

Submit or update a participant's answer for a game. This action creates a new answer or overwrites an existing answer from the same session. Validates game status, participant limits, and selection completeness before saving.

## Function Signature

```typescript
'use server';

async function submitAnswer(
  gameId: string,
  selections: Record<string, string>
): Promise<SubmitAnswerResult>
```

## Request

### Parameters

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| gameId | string | Yes | Non-empty, valid cuid | Game identifier |
| selections | Record<string, string> | Yes | Non-empty object | Map of presenterId to episodeId |

**Session Context** (implicit, from cookies):
- sessionId: string (extracted from session cookie)
- nickname: string (extracted from session cookie)

### Example Request

```typescript
import { submitAnswer } from '@/app/actions/answers';

// From client component
const result = await submitAnswer('game-abc123', {
  'presenter-1': 'episode-1-2',
  'presenter-2': 'episode-2-3',
  'presenter-3': 'episode-3-1'
});
```

### Zod Schema

```typescript
import { z } from 'zod';

export const SubmitAnswerSchema = z.object({
  gameId: z.string().min(1, 'Game ID is required'),
  selections: z.record(
    z.string().min(1, 'Presenter ID is required'),
    z.string().min(1, 'Episode ID is required')
  ).refine(
    (selections) => Object.keys(selections).length > 0,
    'At least one selection is required'
  )
});

export type SubmitAnswerInput = z.infer<typeof SubmitAnswerSchema>;
```

## Response

### Success Response

```typescript
{
  success: true;
  data: {
    answerId: string;
    message: '回答を送信しました';
  }
}
```

### Error Responses

```typescript
type SubmitAnswerError =
  | { success: false; error: 'INVALID_SESSION'; message: 'セッションが無効です' }
  | { success: false; error: 'GAME_NOT_FOUND'; message: 'ゲームが見つかりません' }
  | { success: false; error: 'GAME_NOT_PUBLISHED'; message: 'このゲームはまだ出題されていません' }
  | { success: false; error: 'GAME_CLOSED'; message: 'このゲームは既に締め切られました' }
  | { success: false; error: 'NO_PRESENTERS'; message: 'このゲームには出題者がいません' }
  | { success: false; error: 'PARTICIPANT_LIMIT'; message: '参加人数が上限に達しました' }
  | { success: false; error: 'INCOMPLETE_ANSWERS'; message: '全ての出題者の嘘を選択してください' }
  | { success: false; error: 'INVALID_EPISODE'; message: '無効なエピソードが選択されています' }
  | { success: false; error: 'VALIDATION_ERROR'; message: string };
```

### Full Type Definition

```typescript
export type SubmitAnswerResult =
  | {
      success: true;
      data: {
        answerId: string;
        message: string;
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

2. **Input Validation**
   - Parse and validate request with Zod schema
   - Error: VALIDATION_ERROR if invalid format

3. **Game Validation**
   - Fetch game by ID with presenters and episodes
   - Error: GAME_NOT_FOUND if not found
   - Error: GAME_NOT_PUBLISHED if status is "準備中"
   - Error: GAME_CLOSED if status is "締切"
   - Error: NO_PRESENTERS if presenter count is 0

4. **Participation Limit Validation**
   - Check if session already has participation record
   - If not, check if participant count < maxParticipants
   - Error: PARTICIPANT_LIMIT if limit exceeded

5. **Selection Validation**
   - Verify all presenters have selections
   - Verify all episode IDs are valid for their presenters
   - Error: INCOMPLETE_ANSWERS if missing presenters
   - Error: INVALID_EPISODE if invalid episode ID

6. **Persistence**
   - Create participation record if not exists
   - Upsert answer (create or update existing)
   - Return success with answer ID

### Pseudo-code

```typescript
async function submitAnswer(gameId: string, selections: Record<string, string>) {
  // 1. Session validation
  const session = await getSession();
  if (!session || !session.nickname) {
    return { success: false, error: 'INVALID_SESSION', message: 'セッションが無効です' };
  }

  // 2. Input validation
  const validation = SubmitAnswerSchema.safeParse({ gameId, selections });
  if (!validation.success) {
    return { success: false, error: 'VALIDATION_ERROR', message: validation.error.message };
  }

  // 3. Execute use case
  const result = await new SubmitAnswerUseCase(
    answerRepository,
    participationRepository,
    gameRepository
  ).execute({
    sessionId: session.sessionId,
    nickname: session.nickname,
    gameId,
    selections
  });

  // 4. Map use case result to API response
  if (result.success) {
    return {
      success: true,
      data: {
        answerId: result.answerId,
        message: '回答を送信しました'
      }
    };
  } else {
    return {
      success: false,
      error: result.error,
      message: getErrorMessage(result.error)
    };
  }
}
```

## State Changes

### New Participation
- **Condition**: Session has not participated in game before
- **Effect**: Creates Participation record with sessionId, gameId, nickname, joinedAt

### New Answer
- **Condition**: Session has no existing answer for game
- **Effect**: Creates Answer record with sessionId, gameId, nickname, selections, timestamps

### Answer Overwrite
- **Condition**: Session has existing answer for game
- **Effect**: Updates existing Answer record with new selections and updatedAt timestamp

## Side Effects

1. **Participation Tracking**: Creates participation record on first access (may happen before answer submission)
2. **Answer Upsert**: Either creates new answer or updates existing
3. **No Deletion**: Previous answer data is overwritten, not preserved

## Security Considerations

- **Session-based Auth**: SessionId and nickname extracted from httpOnly cookie
- **CSRF Protection**: Built-in with Next.js Server Actions
- **No isLie Exposure**: Episode data fetched without truth flag
- **Status Re-validation**: Game status checked at submission time (defense in depth)

## Performance

**Expected Latency**: <200ms
- Session read: ~5ms
- Game fetch with relations: ~50ms
- Participation check/create: ~20ms
- Answer upsert: ~30ms
- Total: ~105ms (well under 200ms goal)

**Optimizations**:
- Single query for game + presenters + episodes (no N+1)
- Indexed unique constraint for fast upsert
- Indexed game ID for fast participation count

## Error Handling

### Client-side Handling

```typescript
const result = await submitAnswer(gameId, selections);

if (result.success) {
  // Show success toast
  toast.success(result.data.message);
  // Redirect to TOP page
  router.push('/');
} else {
  // Show error toast with message
  toast.error(result.message);

  // Handle specific errors
  if (result.error === 'GAME_CLOSED' || result.error === 'NO_PRESENTERS') {
    // Redirect to TOP page
    router.push('/');
  } else if (result.error === 'PARTICIPANT_LIMIT') {
    // Redirect to TOP page with error
    router.push('/?error=limit');
  }
  // Other errors: keep user on page to retry
}
```

## Testing

### Unit Tests

```typescript
describe('submitAnswer', () => {
  it('should create new answer when session has not answered', async () => {
    // Arrange: Setup mocks
    // Act: Call submitAnswer
    // Assert: Answer created, success returned
  });

  it('should overwrite existing answer when session resubmits', async () => {
    // Arrange: Setup existing answer
    // Act: Call submitAnswer with different selections
    // Assert: Answer updated, same ID returned
  });

  it('should reject when game status is 締切', async () => {
    // Arrange: Setup closed game
    // Act: Call submitAnswer
    // Assert: Error GAME_CLOSED returned
  });

  it('should reject when participant limit reached', async () => {
    // Arrange: Setup game at max participants
    // Act: Call submitAnswer from new session
    // Assert: Error PARTICIPANT_LIMIT returned
  });

  it('should allow overwrite even when at participant limit', async () => {
    // Arrange: Setup game at max, session already participated
    // Act: Call submitAnswer
    // Assert: Success, answer updated
  });

  it('should reject when selections incomplete', async () => {
    // Arrange: Setup game with 3 presenters
    // Act: Call submitAnswer with only 2 selections
    // Assert: Error INCOMPLETE_ANSWERS returned
  });

  it('should reject when episode ID invalid', async () => {
    // Arrange: Setup game
    // Act: Call submitAnswer with non-existent episode ID
    // Assert: Error INVALID_EPISODE returned
  });
});
```

### Integration Tests

```typescript
describe('submitAnswer integration', () => {
  it('should complete full submission flow', async () => {
    // End-to-end test with real database
    // Verify participation + answer records created
  });

  it('should handle concurrent submissions to same game', async () => {
    // Test race conditions with multiple sessions
  });
});
```

## Examples

### Example 1: First-time Submission

```typescript
// Client component
const handleSubmit = async () => {
  const selections = {
    'presenter-abc': 'episode-123',
    'presenter-def': 'episode-456'
  };

  const result = await submitAnswer('game-xyz', selections);

  if (result.success) {
    console.log('Answer ID:', result.data.answerId);
    // → Participation created, Answer created
  }
};
```

### Example 2: Overwrite Submission

```typescript
// User changes mind and resubmits
const result = await submitAnswer('game-xyz', {
  'presenter-abc': 'episode-789', // Changed
  'presenter-def': 'episode-456'  // Same
});

if (result.success) {
  // → Participation exists (unchanged), Answer updated
}
```

### Example 3: Error Handling

```typescript
const result = await submitAnswer('game-xyz', selections);

if (!result.success) {
  switch (result.error) {
    case 'GAME_CLOSED':
      alert('締め切り後のため、回答を受け付けていません');
      router.push('/');
      break;
    case 'PARTICIPANT_LIMIT':
      alert('参加人数が上限に達しました');
      router.push('/');
      break;
    case 'INCOMPLETE_ANSWERS':
      alert('全ての出題者について嘘を選択してください');
      // Stay on page
      break;
    default:
      alert('エラーが発生しました: ' + result.message);
  }
}
```

## Related Contracts

- [get-game-for-answers.md](./get-game-for-answers.md) - Fetch game data for answer screen
- [validate-game-for-answers.md](./validate-game-for-answers.md) - Pre-validate game eligibility

## References

- Feature Spec: [../spec.md](../spec.md)
- Data Model: [../data-model.md](../data-model.md)
- Research: [../research.md](../research.md)
