# Quickstart: TOP Active Games Display

**Branch**: `005-top-active-games` | **Date**: 2025-11-18

## Overview

Quick implementation guide for displaying active games on the TOP page. This feature modifies the existing TOP page to show only games with "出題中" status, ordered by creation date (newest first), with auto-refresh every 30 seconds.

## Prerequisites

- Existing UsoHontoGame project with Next.js 16.0.1
- Prisma setup with Game and GamePlayer models
- TypeScript 5 with strict mode enabled

## Step-by-Step Implementation

### 1. Install Dependencies

```bash
npm install @tanstack/react-query@^5.0.0
npm install react-window@^1.8.10 @types/react-window@^1.8.8
```

### 2. Create the Use Case (TDD)

First, write the test:

```typescript
// src/server/application/use-cases/games/GetActiveGames.test.ts
import { describe, it, expect, vi } from 'vitest';
import { GetActiveGames } from './GetActiveGames';

describe('GetActiveGames', () => {
  it('should return only games with 出題中 status', async () => {
    const mockRepository = {
      findMany: vi.fn().mockResolvedValue([
        { id: '1', title: 'Game 1', status: '出題中', createdAt: new Date() }
      ])
    };

    const useCase = new GetActiveGames(mockRepository);
    const result = await useCase.execute({ limit: 20 });

    expect(mockRepository.findMany).toHaveBeenCalledWith({
      where: { status: '出題中' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: 0
    });
  });
});
```

Then implement:

```typescript
// src/server/application/use-cases/games/GetActiveGames.ts
export class GetActiveGames {
  constructor(private gameRepository: GameRepository) {}

  async execute(params: { cursor?: string; limit?: number }) {
    const limit = params.limit || 20;
    const skip = params.cursor ? parseInt(params.cursor) : 0;

    const games = await this.gameRepository.findMany({
      where: { status: '出題中' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
      include: {
        _count: { select: { players: true } }
      }
    });

    const total = await this.gameRepository.count({
      where: { status: '出題中' }
    });

    return {
      games: games.map(this.toListItem),
      hasMore: skip + limit < total,
      nextCursor: skip + limit < total ? String(skip + limit) : null,
      total
    };
  }

  private toListItem(game: GameWithCount): ActiveGameListItem {
    return {
      id: game.id,
      title: game.title,
      createdAt: game.createdAt.toISOString(),
      playerCount: game._count.players,
      playerLimit: game.playerLimit,
      formattedCreatedAt: this.formatRelativeTime(game.createdAt)
    };
  }
}
```

### 3. Create Server Action

```typescript
// src/app/actions/games.ts
'use server';

import { GetActiveGames } from '@/server/application/use-cases/games/GetActiveGames';
import { createGameRepository } from '@/server/infrastructure/repositories';
import type { GetActiveGamesActionResponse } from '@/specs/005-top-active-games/contracts/server-actions';

export async function getActiveGamesAction(
  params?: { cursor?: string; limit?: number }
): Promise<GetActiveGamesActionResponse> {
  try {
    const repository = createGameRepository();
    const useCase = new GetActiveGames(repository);
    const result = await useCase.execute(params || {});

    return {
      success: true,
      ...result
    };
  } catch (error) {
    return {
      success: false,
      error: 'FETCH_FAILED',
      message: 'Failed to fetch active games'
    };
  }
}
```

### 4. Modify TOP Page (Server Component)

```typescript
// src/app/page.tsx
import { getActiveGamesAction } from './actions/games';
import TopPage from '@/components/pages/TopPage';

export default async function Page() {
  const initialData = await getActiveGamesAction({ limit: 20 });

  return <TopPage initialData={initialData} />;
}
```

### 5. Create Page Component with Auto-refresh

```typescript
// src/components/pages/TopPage/index.tsx
'use client';

import { useActiveGames } from './hooks/useActiveGames';
import { ActiveGamesList } from '@/components/domain/game/ActiveGamesList';
import { EmptyState } from '@/components/ui/EmptyState';
import type { GetActiveGamesActionResponse } from '@/specs/005-top-active-games/contracts/server-actions';

interface TopPageProps {
  initialData: GetActiveGamesActionResponse;
}

export default function TopPage({ initialData }: TopPageProps) {
  const { data, isLoading, error, loadMore, hasMore } = useActiveGames(initialData);

  if (!data || !data.success) {
    return <EmptyState message="現在、出題中のゲームはありません" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">出題中のゲーム</h1>

      <ActiveGamesList games={data.games} />

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={isLoading}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          もっと見る
        </button>
      )}
    </div>
  );
}
```

### 6. Create Auto-refresh Hook

```typescript
// src/components/pages/TopPage/hooks/useActiveGames.ts
import { useQuery } from '@tanstack/react-query';
import { getActiveGamesAction } from '@/app/actions/games';

export function useActiveGames(initialData: GetActiveGamesActionResponse) {
  const query = useQuery({
    queryKey: ['activeGames'],
    queryFn: () => getActiveGamesAction(),
    initialData,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    hasMore: query.data?.hasMore || false,
    loadMore: () => {
      // Implement pagination logic
    }
  };
}
```

### 7. Create Game List Components

```typescript
// src/components/domain/game/ActiveGameCard.tsx
interface ActiveGameCardProps {
  game: ActiveGameListItem;
}

export function ActiveGameCard({ game }: ActiveGameCardProps) {
  return (
    <Link href={`/games/${game.id}`}>
      <div className="p-4 border rounded hover:bg-gray-50 cursor-pointer">
        <h3 className="font-semibold">{game.title}</h3>
        <div className="text-sm text-gray-600 mt-2">
          <span>{game.formattedCreatedAt}</span>
          <span className="ml-4">
            {game.playerCount}
            {game.playerLimit && `/${game.playerLimit}`} 人
          </span>
        </div>
      </div>
    </Link>
  );
}
```

### 8. Add React Query Provider

```typescript
// src/app/layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      cacheTime: 5 * 60 * 1000,
    },
  },
});

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

## Testing Checklist

- [ ] Unit test: GetActiveGames use case filters by status
- [ ] Unit test: Games are ordered by creation date (newest first)
- [ ] Integration test: Server action returns correct data structure
- [ ] Component test: Games list renders correctly
- [ ] Component test: Empty state shown when no active games
- [ ] Component test: Click on game navigates to detail page
- [ ] E2E test: TOP page loads and displays active games
- [ ] E2E test: Auto-refresh updates list after 30 seconds
- [ ] E2E test: Pagination/Load more works correctly

## Performance Verification

1. **Initial Load**: Should complete within 2 seconds
2. **Auto-refresh**: Should not cause UI flicker
3. **Large Lists**: Virtual scrolling activates at 50+ games
4. **Network Errors**: Graceful degradation with cached data

## Common Issues & Solutions

### Issue: Auto-refresh causes scroll jump
**Solution**: Use `maintainScrollPosition` in React Query options

### Issue: Too many database queries
**Solution**: Implement proper caching and use React Query's deduplication

### Issue: Stale data after navigation
**Solution**: Invalidate queries on route change

## Next Steps

After implementing this quickstart:

1. Run tests to ensure all functionality works
2. Add error boundaries for graceful error handling
3. Implement virtual scrolling for large lists
4. Add loading skeletons for better UX
5. Set up monitoring for performance metrics

## References

- [React Query Documentation](https://tanstack.com/query/latest)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Window for Virtual Scrolling](https://github.com/bvaughn/react-window)