// Type definitions for GameDetailPage
// Feature: 002-game-preparation

/**
 * Game data structure for detail page
 */
export interface GameDetail {
  id: string;
  name: string | null;
  status: string;
  maxPlayers: number;
  currentPlayers: number;
  availableSlots: number;
  creatorId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Props for GameDetailPage component
 */
export interface GameDetailPageProps {
  /** Game data to display */
  game: GameDetail;
  /** Current user's session ID for authorization checks */
  currentSessionId?: string;
}

/**
 * Props for GameDetailPageError component
 */
export interface GameDetailPageErrorProps {
  /** Error message to display */
  errorMessage: string;
}
