"use client";

// GameManagementCard component
// Feature: 002-game-preparation
// Game card with status management for moderators

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { startAcceptingAction, closeGameAction } from "@/app/actions/game";
import type { GameManagementDto } from "@/server/application/dto/GameDto";

export interface GameManagementCardProps {
	/** Game data with status */
	game: GameManagementDto;
	/** Callback when status changes */
	onStatusChange?: () => void;
}

/**
 * GameManagementCard component
 * Displays game information with status management controls
 * Allows moderators to transition game status
 */
export function GameManagementCard({
	game,
	onStatusChange,
}: GameManagementCardProps) {
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [error, setError] = useState<string | null>(null);

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

	const handleStartAccepting = async () => {
		if (!confirm("ゲームを開始してもよろしいですか？")) {
			return;
		}

		setIsTransitioning(true);
		setError(null);

		const formData = new FormData();
		formData.set("gameId", game.id);

		try {
			const result = await startAcceptingAction(formData);

			if (result.success) {
				onStatusChange?.();
			} else {
				setError(result.errors._form?.[0] || "ステータスの変更に失敗しました");
			}
		} catch (err) {
			console.error("Failed to start accepting:", err);
			setError("ステータスの変更に失敗しました");
		} finally {
			setIsTransitioning(false);
		}
	};

	const handleClose = async () => {
		if (!confirm("ゲームを締め切ってもよろしいですか？")) {
			return;
		}

		setIsTransitioning(true);
		setError(null);

		const formData = new FormData();
		formData.set("gameId", game.id);

		try {
			const result = await closeGameAction(formData);

			if (result.success) {
				onStatusChange?.();
			} else {
				setError(result.errors._form?.[0] || "締切に失敗しました");
			}
		} catch (err) {
			console.error("Failed to close game:", err);
			setError("締切に失敗しました");
		} finally {
			setIsTransitioning(false);
		}
	};

	return (
		<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			{/* Header */}
			<div className="mb-4 flex items-center justify-between">
				<h3 className="text-xl font-semibold text-gray-900">
					{game.name}
				</h3>
				<Badge variant={getStatusBadgeVariant(game.status)}>
					{game.status}
				</Badge>
			</div>

			{/* Game Info */}
			<div className="mb-4 space-y-2">
				<div className="flex items-center justify-between text-sm">
					<span className="text-gray-600">参加者:</span>
					<span className="font-medium">
						{game.currentPlayers}/{game.maxPlayers}
					</span>
				</div>
				<div className="flex items-center justify-between text-sm">
					<span className="text-gray-600">残り枠:</span>
					<span className="font-medium text-blue-600">
						{game.availableSlots}人
					</span>
				</div>
			</div>

			{/* Error Message */}
			{error && (
				<div
					className="mb-4 rounded-md border border-red-200 bg-red-50 p-3"
					role="alert"
				>
					<p className="text-sm text-red-800">{error}</p>
				</div>
			)}

			{/* Action Buttons */}
			<div className="flex gap-2">
				{game.status === "準備中" && (
					<>
						<button
							type="button"
							onClick={handleStartAccepting}
							disabled={isTransitioning}
							className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isTransitioning ? "処理中..." : "出題開始"}
						</button>
						<a
							href={`/games/${game.id}/presenters`}
							className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
						>
							プレゼンター管理
						</a>
					</>
				)}

				{game.status === "出題中" && (
					<button
						type="button"
						onClick={handleClose}
						disabled={isTransitioning}
						className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isTransitioning ? "処理中..." : "締切"}
					</button>
				)}

				{game.status === "締切" && (
					<div className="flex-1 text-center text-sm text-gray-500">
						このゲームは締め切られました
					</div>
				)}
			</div>
		</div>
	);
}
