"use client";

// DeleteGameButton Component
// Feature: 002-game-preparation
// Button with confirmation dialog for deleting games

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteGameAction } from "@/app/actions/game";

interface DeleteGameButtonProps {
	/** Game ID to delete */
	gameId: string;
	/** Game status (for confirmation message) */
	gameStatus: string;
}

/**
 * Delete Game Button with Confirmation
 * Shows confirmation dialog before deleting a game
 * Provides different messages based on game status
 */
export function DeleteGameButton({
	gameId,
	gameStatus,
}: DeleteGameButtonProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [showConfirm, setShowConfirm] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleDelete = () => {
		setError(null);

		startTransition(async () => {
			try {
				const formData = new FormData();
				formData.append("gameId", gameId);

				const result = await deleteGameAction(formData);

				if (result.success) {
					// Redirect to game list after successful deletion
					router.push("/games");
				} else {
					setError(result.errors._form?.[0] || "ゲームの削除に失敗しました");
					setShowConfirm(false);
				}
			} catch (err) {
				console.error("Delete game error:", err);
				setError("予期しないエラーが発生しました");
				setShowConfirm(false);
			}
		});
	};

	const needsConfirmation = gameStatus !== "準備中";

	const confirmationMessage =
		gameStatus === "出題中"
			? "このゲームは現在進行中です。削除すると参加者のデータも失われます。本当に削除しますか？"
			: gameStatus === "締切"
				? "このゲームは締切済みです。削除すると結果データも失われます。本当に削除しますか？"
				: "このゲームを削除しますか？";

	return (
		<div className="mt-6">
			{error && (
				<div
					className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4"
					role="alert"
				>
					<p className="text-sm text-red-800">{error}</p>
				</div>
			)}

			{!showConfirm ? (
				<button
					type="button"
					onClick={() => setShowConfirm(true)}
					disabled={isPending}
					className="w-full rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					ゲームを削除
				</button>
			) : (
				<div className="rounded-lg border border-red-200 bg-red-50 p-4">
					<p className="mb-4 text-sm font-medium text-red-900">
						{confirmationMessage}
					</p>
					<div className="flex gap-3">
						<button
							type="button"
							onClick={handleDelete}
							disabled={isPending}
							className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isPending ? "削除中..." : "削除する"}
						</button>
						<button
							type="button"
							onClick={() => setShowConfirm(false)}
							disabled={isPending}
							className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						>
							キャンセル
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
