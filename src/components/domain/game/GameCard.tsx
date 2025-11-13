// GameCard component
// Feature: 002-game-preparation
// Card component for displaying game information

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { GameDto, GameManagementDto } from '@/server/application/dto/GameDto';

export interface GameCardProps {
  /** Game data (basic or management view) */
  game: GameDto | GameManagementDto;
  /** Whether to show management view with status badge */
  managementView?: boolean;
  /** Click handler for card navigation */
  onClick?: () => void;
}

/**
 * GameCard component
 * Displays game information in a card format
 * Supports both player view and management view
 */
export function GameCard({ game, managementView = false, onClick }: GameCardProps) {
  const isManagementDto = (g: GameDto | GameManagementDto): g is GameManagementDto => {
    return 'status' in g;
  };

  const getStatusBadgeVariant = (
    status: string,
  ): "default" | "primary" | "success" | "warning" | "danger" => {
    switch (status) {
      case "準備中":
        return "warning";
      case "出題中":
        return "success";
      case "締切":
        return "default";
      default:
        return "default";
    }
  };

  const managementGame = isManagementDto(game) ? game : null;

  return (
    <Card className={onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}>
      <div
        onClick={onClick}
        onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">{game.name}</h3>
          {managementView && managementGame && (
            <Badge variant={getStatusBadgeVariant(managementGame.status)}>
              {managementGame.status}
            </Badge>
          )}
        </div>

        {/* Game Info */}
        {managementView && managementGame ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">参加者:</span>
              <span className="font-medium">
                {managementGame.currentPlayers}/{managementGame.maxPlayers}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">残り枠:</span>
              <span className="font-medium text-blue-600">
                {game.availableSlots}人
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">残り枠:</span>
              <span className="text-lg font-bold text-blue-600">{game.availableSlots}</span>
              <span className="text-sm text-gray-600">人</span>
            </div>

            <button
              type="button"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              参加する
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
