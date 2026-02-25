/**
 * useActiveGames Hook
 * Feature: 005-top-active-games (User Story 4)
 *
 * Custom hook for fetching active games with auto-refresh capability
 * Uses React Query for caching, background refetching, and optimistic updates
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { ActiveGameListItem } from "@/types/game";
import { getFavoriteGames } from "@/utils/getFavorteGames";

export interface UseActiveGamesOptions {
  /** Refetch interval in milliseconds (default: 30000 / 30 seconds) */
  refetchInterval?: number;
  /** Number of games to fetch per page */
  limit?: number;
  /** Whether to show only favorite games */
  showOnlyFavorite?: boolean;
}

export interface UseActiveGamesResult {
  /** Array of active games */
  games: ActiveGameListItem[];
  /** Whether initial load is in progress */
  isLoading: boolean;
  /** Whether any fetch (including background) is in progress */
  isFetching: boolean;
  /** Error object if fetch failed */
  error: Error | null;
  /** Function to manually trigger refetch */
  refetch: () => Promise<void>;
  /** Whether there are more games to load */
  hasMore: boolean;
  /** Total count of active games */
  total: number;
}

/**
 * Hook for fetching active games with auto-refresh
 *
 * @param options - Configuration options
 * @returns Active games data and query state
 *
 * @example
 * ```tsx
 * function TopPage() {
 *   const { games, isLoading, error, refetch } = useActiveGames();
 *
 *   if (isLoading) return <LoadingSkeleton />;
 *   if (error) return <ErrorState onRetry={refetch} />;
 *
 *   return <ActiveGamesList games={games} />;
 * }
 * ```
 */
export function useActiveGames(
  options: UseActiveGamesOptions = {},
): UseActiveGamesResult {
  const {
    refetchInterval = 30000,
    limit = 20,
    showOnlyFavorite = false,
  } = options;

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: ["activeGames", { limit }],
    queryFn: async () => {
      // Fetch from API endpoint instead of server action
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());

      const response = await fetch(`/api/games/active?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.details || error.error || "Failed to fetch active games",
        );
      }

      const result = await response.json();

      return {
        games: result.games,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor,
        total: result.total,
      };
    },
    refetchInterval,
    refetchIntervalInBackground: true,
    staleTime: 30000, // Consider data stale after 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnReconnect: true, // Refetch when network reconnects
  });

  const refetch = async () => {
    await queryRefetch();
  };

  const games = useMemo(() => {
    if (showOnlyFavorite) {
      return data?.games.filter((game: ActiveGameListItem) =>
        getFavoriteGames().includes(game.id),
      );
    }
    return data?.games;
  }, [data?.games, showOnlyFavorite]);

  return {
    games: games ?? [],
    isLoading,
    isFetching,
    error: error as Error | null,
    refetch,
    hasMore: data?.hasMore ?? false,
    total: data?.total ?? 0,
  };
}
