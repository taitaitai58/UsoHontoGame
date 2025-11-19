# Quickstart Guide: 嘘当て回答機能

**Feature**: Answer submission for lie detection game
**Date**: 2025-01-19
**For**: Developers implementing this feature

## Overview

This guide provides a quick start for implementing the answer submission feature using Test-Driven Development (TDD). Follow these steps to build the feature incrementally with tests first.

## Prerequisites

Before starting implementation:

1. ✅ Read [spec.md](./spec.md) - Feature specification
2. ✅ Read [research.md](./research.md) - Technical decisions
3. ✅ Read [data-model.md](./data-model.md) - Entity design
4. ✅ Read [contracts/](./contracts/) - API contracts
5. ✅ Ensure branch `001-lie-detection-answers` is checked out
6. ✅ Run `npm install` to ensure dependencies are up to date

## Architecture Quick Reference

This feature follows **Clean Architecture** with strict layer separation:

```
┌─────────────────────────────────────────────────────────┐
│              Presentation Layer                          │
│  Next.js Pages + Components + Server Actions            │
│  (src/app/, src/components/)                            │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              Application Layer                           │
│  Use Cases + DTOs                                       │
│  (src/server/application/)                              │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              Domain Layer                                │
│  Entities + Value Objects + Repository Interfaces       │
│  (src/server/domain/)                                   │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              Infrastructure Layer                        │
│  Prisma Repositories + Database                         │
│  (src/server/infrastructure/, prisma/)                  │
└─────────────────────────────────────────────────────────┘
```

## Implementation Order (TDD)

### Phase 1: Database Schema & Migrations

**Duration**: ~30 minutes

1. **Add Prisma Models** (`prisma/schema.prisma`)
   ```prisma
   model Answer {
     id          String   @id @default(cuid())
     sessionId   String
     gameId      String
     nickname    String
     selections  Json
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

   // Add to existing Game model:
   model Game {
     // ... existing fields ...
     answers        Answer[]        @relation
     participations Participation[] @relation
   }
   ```

2. **Create Migration**
   ```bash
   npx prisma migrate dev --name add_answer_and_participation_models
   ```

3. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

**Test**: Run `npm run test:integration` to ensure no existing tests break.

---

### Phase 2: Domain Layer (TDD)

**Duration**: ~2 hours

#### 2.1 Answer Entity

**Test First**: `src/server/domain/entities/Answer.test.ts`

```typescript
describe('Answer Entity', () => {
  it('should create valid answer entity');
  it('should reject empty selections');
  it('should reject invalid nickname length');
  it('should convert to JSON correctly');
});
```

**Then Implement**: `src/server/domain/entities/Answer.ts`

#### 2.2 Participation Entity

**Test First**: `src/server/domain/entities/Participation.test.ts`

```typescript
describe('Participation Entity', () => {
  it('should create valid participation entity');
  it('should reject invalid nickname');
  it('should convert to JSON correctly');
});
```

**Then Implement**: `src/server/domain/entities/Participation.ts`

#### 2.3 Repository Interfaces

**Create**: `src/server/domain/repositories/IAnswerRepository.ts`
**Create**: `src/server/domain/repositories/IParticipationRepository.ts`

(No tests needed for interfaces)

---

### Phase 3: Infrastructure Layer (TDD)

**Duration**: ~3 hours

#### 3.1 Answer Repository

**Test First**: `src/server/infrastructure/repositories/PrismaAnswerRepository.test.ts`

```typescript
describe('PrismaAnswerRepository', () => {
  it('should create new answer');
  it('should upsert answer (update existing)');
  it('should find by session and game');
  it('should find by game ID');
  it('should delete answer');
});
```

**Then Implement**: `src/server/infrastructure/repositories/PrismaAnswerRepository.ts`

**Note**: Use separate test database file for integration tests.

#### 3.2 Participation Repository

**Test First**: `src/server/infrastructure/repositories/PrismaParticipationRepository.test.ts`

```typescript
describe('PrismaParticipationRepository', () => {
  it('should create participation');
  it('should check existence');
  it('should count by game ID');
  it('should find by session and game');
});
```

**Then Implement**: `src/server/infrastructure/repositories/PrismaParticipationRepository.ts`

---

### Phase 4: Application Layer (TDD)

**Duration**: ~4 hours

#### 4.1 DTOs

**Create** (no tests needed):
- `src/server/application/dto/requests/SubmitAnswerRequest.ts`
- `src/server/application/dto/responses/AnswerResponse.ts`

#### 4.2 Use Cases

**Test First**: `src/server/application/use-cases/answers/SubmitAnswer.test.ts`

```typescript
describe('SubmitAnswer Use Case', () => {
  it('should submit new answer successfully');
  it('should overwrite existing answer');
  it('should reject when game not found');
  it('should reject when game status not 出題中');
  it('should reject when no presenters');
  it('should reject when participant limit reached');
  it('should allow resubmit even at limit');
  it('should reject when selections incomplete');
  it('should reject when episode invalid');
});
```

**Then Implement**: `src/server/application/use-cases/answers/SubmitAnswer.ts`

**Test First**: `src/server/application/use-cases/answers/ValidateGameForAnswers.test.ts`

```typescript
describe('ValidateGameForAnswers Use Case', () => {
  it('should allow access when valid');
  it('should deny when participant limit reached');
  it('should allow when already participated');
  it('should reject when game status invalid');
  it('should reject when no presenters');
});
```

**Then Implement**: `src/server/application/use-cases/answers/ValidateGameForAnswers.ts`

**Test First**: `src/server/application/use-cases/answers/GetGameForAnswers.test.ts`

```typescript
describe('GetGameForAnswers Use Case', () => {
  it('should return game with presenters and episodes');
  it('should NOT include isLie in episodes');
  it('should reject when game not found');
  it('should reject when game status invalid');
  it('should reject when no presenters');
});
```

**Then Implement**: `src/server/application/use-cases/answers/GetGameForAnswers.ts`

---

### Phase 5: Presentation Layer - Server Actions (TDD)

**Duration**: ~2 hours

#### 5.1 Server Actions

**Test First**: `src/app/actions/answers.test.ts`

```typescript
describe('Answer Server Actions', () => {
  describe('submitAnswer', () => {
    it('should submit answer successfully');
    it('should return error when validation fails');
    it('should handle use case errors correctly');
  });

  describe('validateGameForAnswers', () => {
    it('should validate successfully');
    it('should return error when invalid');
  });

  describe('getGameForAnswers', () => {
    it('should return game data');
    it('should never expose isLie');
  });
});
```

**Then Implement**: `src/app/actions/answers.ts`

```typescript
'use server';

export async function submitAnswer(gameId: string, selections: Record<string, string>) {
  // Implementation
}

export async function validateGameForAnswers(gameId: string) {
  // Implementation
}

export async function getGameForAnswers(gameId: string) {
  // Implementation
}
```

---

### Phase 6: Presentation Layer - Components (TDD)

**Duration**: ~6 hours

#### 6.1 Custom Hooks

**Test First**: `src/components/pages/AnswerSubmissionPage/hooks/useAnswerSubmission.test.ts`

```typescript
describe('useAnswerSubmission', () => {
  it('should initialize with empty selections');
  it('should update selection for presenter');
  it('should save to localStorage on selection');
  it('should restore from localStorage on mount');
  it('should submit answer successfully');
  it('should handle submission errors');
  it('should clear localStorage after success');
});
```

**Then Implement**: `src/components/pages/AnswerSubmissionPage/hooks/useAnswerSubmission.ts`

**Test First**: `src/components/pages/AnswerSubmissionPage/hooks/useGameValidation.test.ts`

```typescript
describe('useGameValidation', () => {
  it('should validate game on mount');
  it('should handle validation errors');
  it('should redirect on error');
});
```

**Then Implement**: `src/components/pages/AnswerSubmissionPage/hooks/useGameValidation.ts`

#### 6.2 Domain Components

**Test First**: `src/components/domain/answer/EpisodeSelector/EpisodeSelector.test.tsx`

```typescript
describe('EpisodeSelector', () => {
  it('should render all episodes');
  it('should highlight selected episode');
  it('should call onSelect when episode clicked');
  it('should show presenter name');
});
```

**Then Implement**: `src/components/domain/answer/EpisodeSelector/index.tsx`

**Repeat for**:
- `GameAnswerForm/` - Main answer form component
- `PresenterEpisodeList/` - List of all presenters with episode selectors

#### 6.3 Page Component

**Test First**: `src/components/pages/AnswerSubmissionPage/AnswerSubmissionPage.test.tsx`

```typescript
describe('AnswerSubmissionPage', () => {
  it('should render loading state');
  it('should render error state');
  it('should render answer form when loaded');
  it('should disable submit until all selected');
  it('should enable submit when all selected');
  it('should call submitAnswer on submit');
});
```

**Then Implement**: `src/components/pages/AnswerSubmissionPage/index.tsx`

#### 6.4 Next.js Page (Thin Wrapper)

**Create**: `src/app/games/[id]/answer/page.tsx`

```typescript
export default async function AnswerPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  // Validate access
  const validation = await validateGameForAnswers(id);
  if (!validation.success) {
    redirect('/?error=' + validation.error);
  }

  return <AnswerSubmissionPage gameId={id} />;
}
```

---

### Phase 7: Integration Tests

**Duration**: ~2 hours

**Test First**: `tests/integration/answer-submission.test.ts`

```typescript
describe('Answer Submission Integration', () => {
  it('should complete full submission flow');
  it('should handle overwrite correctly');
  it('should enforce participant limits');
  it('should validate game status at submission');
  it('should cascade delete with game');
});
```

**Run Tests**: `npm run test:integration`

---

### Phase 8: E2E Tests

**Duration**: ~2 hours

**Test First**: `tests/e2e/answer-submission.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Answer Submission Flow', () => {
  test('participant can submit answer for published game', async ({ page }) => {
    // Navigate to TOP page
    // Click on a published game
    // Select episode for each presenter
    // Submit answer
    // Verify redirect to TOP
    // Verify answer saved
  });

  test('participant cannot access closed game', async ({ page }) => {
    // Try to access closed game directly
    // Verify redirect to TOP with error
  });

  test('participant cannot access game at limit', async ({ page }) => {
    // Setup game at max participants
    // Try to access as new session
    // Verify error message
  });

  test('participant can modify answer before deadline', async ({ page }) => {
    // Submit answer
    // Navigate back to answer screen
    // Change selections
    // Submit again
    // Verify answer updated
  });

  test('selections persist after page refresh', async ({ page }) => {
    // Navigate to answer screen
    // Select some episodes
    // Refresh page
    // Verify selections restored from localStorage
  });
});
```

**Run Tests**: `npm run test:e2e`

---

## TDD Workflow Reminder

For EVERY file you create, follow this strict order:

1. **Write Test First** (Red)
   - Define expected behavior
   - Write test that fails

2. **Implement Minimum Code** (Green)
   - Write just enough code to pass test
   - Run test, verify it passes

3. **Refactor** (Refactor)
   - Improve code quality
   - Keep tests green

4. **Format & Commit**
   ```bash
   npx biome format --write .
   git add .
   git commit -m "feat(answers): implement X"
   ```

## Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- Answer.test.ts

# Run in watch mode
npm test -- --watch
```

## Common Pitfalls

### ❌ Don't Do This

1. **Writing implementation before tests**
   - Always write test first!

2. **Exposing `isLie` field to client**
   ```typescript
   // ❌ WRONG
   const episodes = await prisma.episode.findMany();
   // Includes isLie!
   ```

3. **Skipping Biome formatting**
   - Always run `npx biome format --write .` before committing

4. **Creating new UI components when existing ones work**
   - Reuse Button, Input, EmptyState, etc.

5. **Putting logic in components**
   - Use custom hooks for all state and business logic

### ✅ Do This

1. **Write tests first, always**

2. **Safely query episodes**
   ```typescript
   // ✅ CORRECT
   const episodes = await prisma.episode.findMany({
     select: { id: true, content: true }
     // isLie intentionally omitted
   });
   ```

3. **Format before every commit**
   ```bash
   npx biome format --write .
   git add .
   git commit -m "feat: add X"
   ```

4. **Reuse existing UI primitives**
   ```typescript
   import { Button } from '@/components/ui/Button';
   import { EmptyState } from '@/components/ui/EmptyState';
   ```

5. **Extract logic to hooks**
   ```typescript
   // Component: Pure presentation
   export function AnswerForm({ gameId }: Props) {
     const { selections, handleSelect, handleSubmit } = useAnswerSubmission(gameId);
     return <form>...</form>;
   }
   ```

## Debugging Tips

### Database Issues

```bash
# Reset database
npx prisma migrate reset

# Open Prisma Studio to inspect data
npx prisma studio

# Check schema sync
npx prisma validate
```

### Test Issues

```bash
# Run with verbose output
npm test -- --reporter=verbose

# Run specific test
npm test -- Answer.test.ts -t "should create valid"

# Debug test with Node inspector
node --inspect-brk node_modules/.bin/vitest
```

### Type Issues

```bash
# Regenerate Prisma types
npx prisma generate

# Check TypeScript errors
npx tsc --noEmit
```

## Performance Monitoring

After implementation, verify performance goals:

- Answer submission: <200ms ✓
- Game list retrieval: <100ms ✓
- Answer screen load: <300ms ✓

Use Chrome DevTools Network tab to measure actual latencies.

## Completion Checklist

Before marking feature complete:

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Code coverage >80%
- [ ] Biome formatting applied
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Manual testing completed
- [ ] Performance goals met
- [ ] Security: isLie never exposed
- [ ] Documentation updated (if needed)

## Next Steps After Implementation

1. **Code Review**: Create PR for review
2. **QA Testing**: Manual testing by QA team
3. **Performance Testing**: Load testing with multiple concurrent users
4. **Deploy**: Merge to main and deploy

## Need Help?

**Stuck on a test?** Review the contract docs in `contracts/` for expected behavior.

**Unclear about architecture?** Review `data-model.md` and `research.md`.

**Type errors?** Run `npx prisma generate` to regenerate types.

**Test database issues?** Ensure test files use isolated SQLite files (see existing integration tests).

## References

- Feature Spec: [spec.md](./spec.md)
- Research: [research.md](./research.md)
- Data Model: [data-model.md](./data-model.md)
- Contracts: [contracts/](./contracts/)
- Constitution: [../../.specify/memory/constitution.md](../../.specify/memory/constitution.md)
- CLAUDE.md: [../../CLAUDE.md](../../CLAUDE.md)

## Example: Complete TDD Cycle for Answer Entity

```typescript
// 1. RED: Write failing test first
// src/server/domain/entities/Answer.test.ts
describe('Answer Entity', () => {
  it('should create valid answer entity', () => {
    const answer = AnswerEntity.create({
      sessionId: 'session-123',
      gameId: 'game-456',
      nickname: 'TestUser',
      selections: { 'presenter-1': 'episode-1' }
    });

    expect(answer.id).toBeTruthy();
    expect(answer.sessionId).toBe('session-123');
    expect(answer.gameId).toBe('game-456');
    expect(answer.nickname).toBe('TestUser');
    expect(answer.selections.size).toBe(1);
  });
});

// Run test: npm test -- Answer.test.ts
// Result: FAIL - AnswerEntity is not defined

// 2. GREEN: Write minimum code to pass
// src/server/domain/entities/Answer.ts
import { cuid } from '@paralleldrive/cuid2';

export class AnswerEntity {
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
}

// Run test: npm test -- Answer.test.ts
// Result: PASS ✓

// 3. REFACTOR: Add validation (tests should still pass)
export class AnswerEntity {
  // ... same as above ...

  static create(props: {
    sessionId: string;
    gameId: string;
    nickname: string;
    selections: Record<string, string>;
  }): AnswerEntity {
    // Add validation
    if (Object.keys(props.selections).length === 0) {
      throw new Error('Selections cannot be empty');
    }
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
}

// 4. FORMAT & COMMIT
// npx biome format --write .
// git add .
// git commit -m "feat(answers): add Answer entity with validation"

// 5. REPEAT: Write next test (reject empty selections)
```

Happy coding! 🚀
