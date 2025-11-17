# Research: Game Status Transition

**Date**: 2025-11-17  
**Feature**: Game Status Transition  
**Branch**: `004-status-transition`

## Research Findings

### 1. Existing Status Implementation

**Decision**: Leverage existing GameStatus value object and status validation  
**Rationale**: The codebase already has GameStatus value object with proper validation and the three required states  
**Alternatives considered**: 
- Creating new status enum: Rejected as GameStatus already exists and is well-tested
- String-based status: Rejected as type-unsafe and error-prone

**Evidence from codebase**:
- `src/server/domain/value-objects/GameStatus.ts` already defines 準備中, 出題中, 締切
- `src/server/application/use-cases/games/StartAcceptingResponses.ts` exists for 準備中→出題中
- `src/server/application/use-cases/games/CloseGame.ts` exists for 出題中→締切

### 2. Presenter Validation Strategy  

**Decision**: Create new ValidateStatusTransition use case that checks presenter completeness
**Rationale**: Separation of concerns - validation logic should be in application layer, not mixed with UI
**Alternatives considered**:
- Inline validation in Server Action: Rejected as violates Clean Architecture
- Client-side validation only: Rejected as insecure and can be bypassed

**Requirements to validate**:
- Game must have at least one presenter
- Each presenter must have exactly 3 episodes
- Each presenter must have exactly 1 episode marked as lie

### 3. UI Component Architecture

**Decision**: Create domain-specific components with custom hooks for logic
**Rationale**: Follows constitution requirement for component separation and hook-based logic
**Alternatives considered**:
- Single monolithic component: Rejected as violates component architecture principles
- Direct state management in components: Rejected as violates custom hooks requirement

**Component structure**:
- `GameStatusBadge`: Pure presentational component for status display
- `StatusTransitionButton`: Action button with loading and disabled states
- `useGameStatus`: Hook managing transition logic and state

### 4. Confirmation Dialog Implementation

**Decision**: Use native browser confirm() initially, with option to upgrade to custom modal
**Rationale**: Fastest to implement, meets requirements, can be enhanced later
**Alternatives considered**:
- Custom React modal: More work for MVP, can be added in enhancement
- No confirmation: Rejected as spec requires confirmation for closing games

### 5. Error Handling Strategy

**Decision**: Return structured errors from Server Actions with field-specific messages
**Rationale**: Consistent with existing error handling patterns in the codebase
**Alternatives considered**:
- Throw exceptions: Rejected as harder to handle in UI
- Generic error messages: Rejected as spec requires clear, specific errors

**Error structure**:
```typescript
{
  success: false,
  errors: {
    status?: string[],
    presenters?: string[],
    _form?: string[]
  }
}
```

### 6. Optimistic Updates

**Decision**: Implement optimistic UI updates with rollback on error
**Rationale**: Provides immediate feedback (< 1 second requirement) while maintaining data integrity
**Alternatives considered**:
- Wait for server response: Too slow for user experience requirement
- Fire and forget: Rejected as could lead to inconsistent state

### 7. Authorization Check

**Decision**: Reuse existing session validation from SessionService
**Rationale**: Consistent with recent refactoring to use SessionService pattern
**Alternatives considered**:
- New authorization system: Overkill for single-moderator games
- No authorization: Security vulnerability

## Technology Decisions Summary

| Component | Technology | Justification |
|-----------|------------|---------------|
| Validation | Zod schemas | Type-safe, runtime validation |
| State Management | React hooks | Constitution requirement |
| UI Components | React + Tailwind | Existing stack |
| Server Communication | Server Actions | Next.js 16 pattern |
| Database Updates | Prisma | Existing ORM |
| Testing | Vitest + RTL | TDD requirement |

## No Remaining Clarifications

All technical decisions have been made based on:
- Existing codebase patterns
- Constitution requirements
- Feature specifications
- Performance constraints

Ready to proceed to Phase 1 design.