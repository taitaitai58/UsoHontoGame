# Research: TOP Active Games Display

**Branch**: `005-top-active-games` | **Date**: 2025-11-18

## Overview

This document captures technical decisions and research findings for implementing the TOP Active Games Display feature. The focus is on resolving the game ordering criteria and establishing patterns for efficient data fetching and auto-refresh functionality.

## Key Decisions

### 1. Game Ordering Strategy

**Decision**: Order games by creation date (newest first)

**Rationale**:
- Provides a predictable and consistent ordering that users can understand
- Newer games are more likely to be actively seeking players
- Aligns with common social media and listing patterns (most recent first)
- Simple to implement and efficient to query with database indexes

**Alternatives considered**:
- **Most players first**: Could lead to snowball effect where popular games dominate
- **Alphabetical**: Less useful for discovering new games, arbitrary ordering
- **Random**: Would confuse users with changing positions on refresh
- **Hybrid (featured + recent)**: Adds complexity without clear user benefit

### 2. Auto-refresh Implementation Pattern

**Decision**: Use React Query (TanStack Query) with polling interval

**Rationale**:
- Built-in support for polling with `refetchInterval`
- Automatic deduplication of requests
- Smart refetching on window focus
- Cache management prevents unnecessary re-renders
- Works seamlessly with Server Components for initial SSR

**Alternatives considered**:
- **WebSockets/SSE**: Overkill for 30-second updates, adds server complexity
- **Manual setInterval**: Requires manual cleanup, state management, and error handling
- **SWR**: Similar capabilities but React Query has better TypeScript support

### 3. Pagination Strategy

**Decision**: Implement cursor-based pagination with "Load More" button

**Rationale**:
- Better UX than traditional pagination (preserves scroll position)
- More efficient than offset pagination for dynamic data
- Works well with auto-refresh (new items appear at top)
- Simpler than infinite scroll (avoids scroll position issues)

**Alternatives considered**:
- **Offset pagination**: Can skip/duplicate items when data changes
- **Infinite scroll**: Complex scroll position management with auto-refresh
- **Show all**: Performance issues with 100+ games

### 4. Empty State Handling

**Decision**: Display illustrated empty state with call-to-action

**Rationale**:
- Provides clear feedback when no games are active
- Opportunity to guide users to create their own game
- Better UX than blank screen or generic "No results"

**Implementation**:
- Message: "現在、出題中のゲームはありません"
- Sub-message: "しばらく待つか、自分でゲームを作成してください"
- Include link to game creation page if user is authenticated

### 5. Data Fetching Architecture

**Decision**: Server Component for initial load + Client Component for updates

**Rationale**:
- Server Component provides SEO-friendly initial render
- Fast initial page load with server-side data fetching
- Client Component handles interactivity and auto-refresh
- Follows Next.js best practices for hybrid rendering

**Pattern**:
```typescript
// app/page.tsx (Server Component)
async function Page() {
  const initialGames = await getActiveGames();
  return <TopPage initialGames={initialGames} />;
}

// components/pages/TopPage/index.tsx (Client Component)
function TopPage({ initialGames }) {
  const { data } = useActiveGames(initialGames);
  // Auto-refresh logic here
}
```

### 6. Performance Optimizations

**Decision**: Implement virtual scrolling for 50+ games

**Rationale**:
- Maintains smooth performance with large lists
- React Window provides battle-tested solution
- Only renders visible items plus buffer
- Graceful degradation (works without JS)

**Thresholds**:
- 0-20 games: Simple list rendering
- 21-50 games: Paginated with "Load More"
- 51+ games: Virtual scrolling with React Window

### 7. Error Handling Strategy

**Decision**: Graceful degradation with retry mechanism

**Rationale**:
- Network issues shouldn't break the entire page
- Users can still see cached data during errors
- Automatic retry improves reliability

**Implementation**:
- Show last known good state during errors
- Display subtle error banner with retry button
- Exponential backoff for automatic retries
- Log errors to monitoring service

## Technical Specifications

### Database Query

```sql
SELECT * FROM games
WHERE status = '出題中'
ORDER BY created_at DESC
LIMIT 20
OFFSET ?
```

With Prisma:
```typescript
await prisma.game.findMany({
  where: { status: '出題中' },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: cursor,
  include: {
    _count: {
      select: { players: true }
    }
  }
});
```

### Performance Metrics

- Initial page load: < 2 seconds (server-side rendering)
- Subsequent updates: < 500ms (client-side fetch)
- Auto-refresh interval: 30 seconds
- Maximum games without pagination: 20
- Virtual scrolling threshold: 50 games

### Browser Compatibility

- All modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Works without JavaScript (initial load only)
- Progressive enhancement for auto-refresh

## Implementation Notes

1. **State Management**: Use React Query for server state, local React state for UI state
2. **Type Safety**: Define strict TypeScript interfaces for all game data
3. **Testing**: Mock timers for auto-refresh tests, use MSW for API mocking
4. **Accessibility**: Announce updates to screen readers, keyboard navigation for game cards
5. **SEO**: Ensure meta tags and structured data for game listings

## Dependencies to Add

```json
{
  "@tanstack/react-query": "^5.0.0",
  "react-window": "^1.8.10",
  "@types/react-window": "^1.8.8"
}
```

## Open Questions Resolved

1. **Q: How should games be ordered?**
   - A: By creation date, newest first (see Decision #1)

2. **Q: How to handle auto-refresh with pagination?**
   - A: New games appear at top, maintain scroll position, use cursor pagination

3. **Q: What if there are 1000+ active games?**
   - A: Virtual scrolling kicks in at 50+, server limits query to 100 max

## Next Steps

1. Create data model for active game display
2. Define API contracts for game fetching
3. Generate quickstart guide for implementation
4. Create detailed task breakdown for TDD implementation