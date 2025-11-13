"use client";

// GameListClient Component
// Feature: 002-game-preparation
// Client-side wrapper for GameList with navigation handling

import { useRouter } from "next/navigation";
import { GameList } from "./GameList";
import type { GameDto, GameManagementDto } from "@/server/application/dto/GameDto";

interface GameListClientProps {
	games: GameDto[] | GameManagementDto[];
	managementView?: boolean;
}

/**
 * Client-side wrapper for GameList
 * Handles navigation when game cards are clicked
 */
export function GameListClient({ games, managementView = false }: GameListClientProps) {
	const router = useRouter();

	const handleGameClick = (gameId: string) => {
		router.push(`/games/${gameId}`);
	};

	return (
		<GameList
			games={games}
			managementView={managementView}
			onGameClick={managementView ? handleGameClick : undefined}
		/>
	);
}
