// Game Detail/Edit Page Component
// Feature: 002-game-preparation
// Presentational component for viewing and editing game details

import { GameForm } from "@/components/domain/game/GameForm";
import { DeleteGameButton } from "@/components/domain/game/DeleteGameButton";
import type {
	GameDetailPageProps,
	GameDetailPageErrorProps,
} from "./GameDetailPage.types";

/**
 * GameDetailPage - Main component for displaying game details
 * Pure presentational component with no business logic
 *
 * @param props - Component props including game data
 */
export function GameDetailPage({ game }: GameDetailPageProps) {
	// Check if game can be edited (only 準備中 status)
	const canEdit = game.status === "準備中";

	return (
		<div className="container mx-auto max-w-2xl px-4 py-8">
			{/* Header */}
			<div className="mb-6">
				<a
					href="/games"
					className="mb-4 inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
				>
					← ゲーム一覧に戻る
				</a>
				<h1 className="text-3xl font-bold text-gray-900">ゲーム詳細</h1>
				<p className="mt-2 text-sm text-gray-600">
					ゲームの設定を確認・編集できます
				</p>
			</div>

			{/* Status Warning */}
			{!canEdit && (
				<div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
					<p className="text-sm text-yellow-800">
						現在のステータス:{" "}
						<span className="font-semibold">{game.status}</span>
					</p>
					<p className="mt-1 text-sm text-yellow-800">
						ゲームの設定を変更できるのは準備中のみです。
					</p>
				</div>
			)}

			{/* Game Info Card */}
			<div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<dl className="space-y-4">
					<div>
						<dt className="text-sm font-medium text-gray-500">
							ゲーム名
						</dt>
						<dd className="mt-1 text-base text-gray-900">{game.name}</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-gray-500">
							ステータス
						</dt>
						<dd className="mt-1 text-base text-gray-900">
							{game.status}
						</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-gray-500">参加者</dt>
						<dd className="mt-1 text-base text-gray-900">
							{game.currentPlayers} / {game.maxPlayers} 人
						</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-gray-500">空き枠</dt>
						<dd className="mt-1 text-base text-gray-900">
							{game.availableSlots} 枠
						</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-gray-500">
							作成日時
						</dt>
						<dd className="mt-1 text-base text-gray-900">
							{new Date(game.createdAt).toLocaleString("ja-JP")}
						</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-gray-500">
							更新日時
						</dt>
						<dd className="mt-1 text-base text-gray-900">
							{new Date(game.updatedAt).toLocaleString("ja-JP")}
						</dd>
					</div>
				</dl>
			</div>

			{/* Presenter Management Section */}
			<div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 className="mb-4 text-xl font-semibold text-gray-900">
					プレゼンター管理
				</h2>
				<p className="mb-4 text-sm text-gray-600">
					プレゼンターとエピソードを管理します。各プレゼンターに3つのエピソード（2つのホント、1つのウソ）を登録してください。
				</p>
				<a
					href={`/games/${game.id}/presenters`}
					className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				>
					プレゼンター管理ページへ →
				</a>
			</div>

			{/* Edit Form (only shown when status is 準備中) */}
			{canEdit && (
				<div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 className="mb-4 text-xl font-semibold text-gray-900">
						設定を変更
					</h2>
					<GameForm
						mode="edit"
						gameId={game.id}
						initialPlayerLimit={game.maxPlayers}
						currentPlayers={game.currentPlayers}
					/>
				</div>
			)}

			{/* Delete Button Section */}
			<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 className="mb-4 text-xl font-semibold text-gray-900">
					危険な操作
				</h2>
				<p className="mb-4 text-sm text-gray-600">
					ゲームを削除すると、関連するプレゼンターとエピソードもすべて削除されます。この操作は取り消せません。
				</p>
				<DeleteGameButton gameId={game.id} gameStatus={game.status} />
			</div>
		</div>
	);
}

/**
 * GameDetailPageError - Error state component
 * Displayed when game fetching fails
 *
 * @param props - Error props including error message
 */
export function GameDetailPageError({
	errorMessage,
}: GameDetailPageErrorProps) {
	return (
		<div className="container mx-auto max-w-2xl px-4 py-8">
			<div className="rounded-lg border border-red-200 bg-red-50 p-4">
				<h2 className="text-lg font-semibold text-red-900">
					エラーが発生しました
				</h2>
				<p className="mt-2 text-sm text-red-800">{errorMessage}</p>
				<a
					href="/games"
					className="mt-4 inline-block text-sm font-medium text-red-900 underline"
				>
					ゲーム一覧に戻る
				</a>
			</div>
		</div>
	);
}
