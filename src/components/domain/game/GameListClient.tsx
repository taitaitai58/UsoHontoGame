'use client';

// GameListClient Component
// Feature: 002-game-preparation
// Client-side wrapper for GameList with navigation handling

import { useRouter } from 'next/navigation';
import type { GameDto, GameManagementDto } from '@/server/application/dto/GameDto';
import { GameList } from './GameList';

interface GameListClientProps {
  games: GameDto[] | GameManagementDto[];
  managementView?: boolean;
  /** Called when copy URL succeeds on a card (e.g. show toast) */
  onCopyUrlSuccess?: (message: string) => void;
}

/**
 * Client-side wrapper for GameList
 * Handles navigation when game cards are clicked
 */
export function GameListClient({
  games,
  managementView = false,
  onCopyUrlSuccess,
}: GameListClientProps) {
  const router = useRouter();

  const handleGameClick = (gameId: string) => {
    router.push(`/games/${gameId}`);
  };

  return (
    <GameList
      games={games}
      managementView={managementView}
      onGameClick={managementView ? handleGameClick : undefined}
      onCopyUrlSuccess={onCopyUrlSuccess}
    />
  );
}
