# Quickstart: Game Status Transition

**Feature**: Game Status Transition  
**Branch**: `004-status-transition`  
**Date**: 2025-11-17

## Overview

This feature enables game moderators to transition game status through three states with validation and UI feedback:

```
準備中 (Preparing) → 出題中 (Accepting Responses) → 締切 (Closed)
```

## Quick Test Workflow

### Prerequisites

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000

3. Create a session if needed (enter a nickname)

### Test Scenario 1: Start Game (準備中 → 出題中)

1. **Setup**: Create a new game
   - Click "新しいゲームを作成"
   - Set player limit (1-100)
   - Game starts in 準備中 status

2. **Add Presenter** (required for transition):
   - Navigate to game detail page
   - Click "出題者を追加"
   - Enter presenter nickname
   - Add exactly 3 episodes (2 truths, 1 lie)
   - Save presenter

3. **Start Game**:
   - On game detail page, locate status section
   - Current status shows "準備中" badge
   - Click "ゲームを開始" button
   - Verify status changes to "出題中"

**Expected**: Game transitions successfully with immediate UI update

### Test Scenario 2: Validation Errors

1. **Setup**: Create game without presenters

2. **Attempt Transition**:
   - Click "ゲームを開始" button
   - Should see error: "ゲームを開始するには出題者が必要です"

3. **Add Incomplete Presenter**:
   - Add presenter with only 2 episodes
   - Click "ゲームを開始" 
   - Should see error: "出題者 [name] のエピソードが不完全です"

**Expected**: Clear error messages guide user to fix issues

### Test Scenario 3: Close Game (出題中 → 締切)

1. **Setup**: Game in 出題中 status (from Scenario 1)

2. **Close Game**:
   - Click "ゲームを締切" button
   - Confirmation dialog appears: "本当にゲームを締切しますか？"
   - Click "確認" to proceed
   - Verify status changes to "締切"

3. **Verify Locked State**:
   - No status change buttons visible
   - Game is permanently closed

**Expected**: Confirmation required, then game closes permanently

### Test Scenario 4: Authorization Check

1. **Setup**: Create game as User A

2. **Switch Session**:
   - Clear cookies or use incognito mode
   - Create new session as User B

3. **Attempt Unauthorized Change**:
   - Navigate to User A's game URL
   - Attempt to change status
   - Should see error: "このゲームを変更する権限がありません"

**Expected**: Only game creator can change status

## API Testing

### Start Game Endpoint

```bash
# Start game (準備中 → 出題中)
curl -X POST http://localhost:3000/api/games/{gameId}/status/start \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "your-session-id"}'
```

### Close Game Endpoint

```bash
# Close game (出題中 → 締切)  
curl -X POST http://localhost:3000/api/games/{gameId}/status/close \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "your-session-id", "confirmed": true}'
```

### Validate Transition

```bash
# Check if transition is allowed
curl -X GET "http://localhost:3000/api/games/{gameId}/status/validate?targetStatus=出題中"
```

## Development Verification

### Unit Tests
```bash
# Run validation logic tests
npm test -- ValidateStatusTransition

# Run component tests
npm test -- GameStatusBadge
npm test -- StatusTransitionButton
npm test -- useGameStatus
```

### Integration Tests
```bash
# Test full status transition flow
npm test -- status-transition.test
```

### E2E Tests
```bash
# Run browser automation tests
npm run test:e2e -- game-status-flow
```

## Component Locations

### UI Components
- Status Badge: `src/components/domain/game/GameStatusBadge.tsx`
- Transition Button: `src/components/domain/game/StatusTransitionButton.tsx`
- Status Hook: `src/components/pages/GameDetailPage/hooks/useGameStatus.ts`

### Server Logic
- Validation: `src/server/application/use-cases/games/ValidateStatusTransition.ts`
- Server Actions: `src/app/actions/game.ts`

### Database
- Status field in Game table
- Atomic updates via Prisma

## Common Issues & Solutions

### Issue: "出題者が必要です" error
**Solution**: Add at least one presenter with 3 episodes before starting

### Issue: Status doesn't update in UI
**Solution**: Check network tab for errors, verify session is valid

### Issue: Can't close game
**Solution**: Ensure you're the game creator and game is in 出題中 status

### Issue: Confirmation dialog not appearing
**Solution**: Check browser console for JavaScript errors

## Performance Targets

- Status transitions: < 5 seconds total
- UI feedback: < 1 second
- Error messages: < 2 seconds
- Zero data loss during transitions

## Next Steps

After testing the basic flow:

1. Test with multiple presenters
2. Test concurrent status changes
3. Test network failure handling
4. Verify database consistency
5. Check audit logging (if implemented)