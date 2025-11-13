// TOP Page Components
// Feature: 001-session-top-page
// Presentational components for the home/landing page

import { NicknameInput } from "@/components/domain/session/NicknameInput";
import { GameList } from "@/components/domain/game/GameList";
import type { TopPageProps } from "./TopPage.types";

/**
 * TopPageNicknameSetup - Component for nickname setup state
 * Displayed when user doesn't have a nickname set
 * Pure presentational component with no business logic
 */
export function TopPageNicknameSetup() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
			<NicknameInput />
		</div>
	);
}

/**
 * TopPage - Main component for logged-in users
 * Displayed when user has nickname set
 * Pure presentational component with no business logic
 *
 * @param props - Component props including nickname and games
 */
export function TopPage({ nickname, games }: TopPageProps) {
	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="mx-auto max-w-7xl">
				<div className="mb-8 flex items-center justify-between">
					<h1 className="text-3xl font-bold text-gray-900">
						ようこそ、{nickname}さん!
					</h1>
				</div>

				<GameList games={games} />
			</div>
		</div>
	);
}
