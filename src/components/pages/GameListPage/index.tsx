// Game List Page Component
// Feature: 002-game-preparation
// Presentational component for displaying game management list

import { GameListClient } from "@/components/domain/game/GameListClient";
import type {
	GameListPageProps,
	GameListPageErrorProps,
} from "./GameListPage.types";

/**
 * GameListPage - Main component for displaying game management
 * Pure presentational component with no business logic
 *
 * @param props - Component props including games data
 */
export function GameListPage({ games }: GameListPageProps) {
	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			{/* Header */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">ゲーム管理</h1>
					<p className="mt-2 text-sm text-gray-600">
						作成したゲームの一覧を確認・管理できます
					</p>
				</div>
				<a
					href="/games/create"
					className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				>
					<svg
						className="-ml-1 mr-2 h-5 w-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 4v16m8-8H4"
						/>
					</svg>
					新しいゲームを作成
				</a>
			</div>

			{/* Game List */}
			<GameListClient games={games} managementView={true} />
		</div>
	);
}

/**
 * GameListPageError - Error state component
 * Displayed when game fetching fails
 *
 * @param props - Error props including error message
 */
export function GameListPageError({
	errorMessage,
}: GameListPageErrorProps) {
	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			<div className="rounded-lg border border-red-200 bg-red-50 p-4">
				<p className="text-sm text-red-800">{errorMessage}</p>
			</div>
		</div>
	);
}
