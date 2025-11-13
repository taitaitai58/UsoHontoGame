// Game Create Page Component
// Feature: 002-game-preparation
// Presentational component for game creation form

import { GameForm } from "@/components/domain/game/GameForm";

/**
 * GameCreatePage - Component for creating new games
 * Pure presentational component with no business logic
 * Displays the GameForm component for creating new games
 */
export function GameCreatePage() {
	return (
		<main className="min-h-screen bg-gray-50 py-8">
			<GameForm />
		</main>
	);
}
