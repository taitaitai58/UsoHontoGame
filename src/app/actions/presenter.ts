"use server";

// Presenter Server Actions
// Feature: 002-game-preparation
// Server Actions for managing presenters and episodes

import { cookies } from "next/headers";
import { AddPresenter } from "@/server/application/use-cases/games/AddPresenter";
import { RemovePresenter } from "@/server/application/use-cases/games/RemovePresenter";
import { AddEpisode } from "@/server/application/use-cases/games/AddEpisode";
import { GetPresenterEpisodes } from "@/server/application/use-cases/games/GetPresenterEpisodes";
import { InMemoryGameRepository } from "@/server/infrastructure/repositories/InMemoryGameRepository";
import {
	AddPresenterSchema,
	RemovePresenterSchema,
	AddEpisodeSchema,
} from "@/server/domain/schemas/gameSchemas";
import type { PresenterWithLieDto } from "@/server/application/dto/PresenterWithLieDto";
import type { EpisodeWithLieDto } from "@/server/application/dto/EpisodeWithLieDto";

// Helper to create repository instance
function createRepository() {
	return InMemoryGameRepository.getInstance();
}

/**
 * Add Presenter Server Action
 * Adds a new presenter to a game
 */
export async function addPresenterAction(
	formData: FormData,
): Promise<
	| { success: true; presenter: PresenterWithLieDto }
	| { success: false; errors: Record<string, string[]> }
> {
	try {
		// Parse and validate form data
		const rawData = {
			gameId: formData.get("gameId"),
			nickname: formData.get("nickname"),
		};

		const validationResult = AddPresenterSchema.safeParse(rawData);

		if (!validationResult.success) {
			return {
				success: false,
				errors: validationResult.error.flatten().fieldErrors,
			};
		}

		// Get session (for future authorization)
		const cookieStore = await cookies();
		const sessionId = cookieStore.get("session_id")?.value;

		if (!sessionId) {
			return {
				success: false,
				errors: {
					_form: ["セッションが見つかりません。ログインし直してください。"],
				},
			};
		}

		// Execute use case
		const repository = createRepository();
		const useCase = new AddPresenter(repository);

		const result = await useCase.execute({
			gameId: validationResult.data.gameId,
			nickname: validationResult.data.nickname,
		});

		return {
			success: true,
			presenter: result.presenter,
		};
	} catch (error) {
		console.error("Failed to add presenter:", error);
		return {
			success: false,
			errors: {
				_form: [
					error instanceof Error
						? error.message
						: "プレゼンターの追加に失敗しました",
				],
			},
		};
	}
}

/**
 * Remove Presenter Server Action
 * Removes a presenter from a game (cascade deletes episodes)
 */
export async function removePresenterAction(
	formData: FormData,
): Promise<
	| { success: true }
	| { success: false; errors: Record<string, string[]> }
> {
	try {
		// Parse and validate form data
		const rawData = {
			gameId: formData.get("gameId"),
			presenterId: formData.get("presenterId"),
		};

		const validationResult = RemovePresenterSchema.safeParse(rawData);

		if (!validationResult.success) {
			return {
				success: false,
				errors: validationResult.error.flatten().fieldErrors,
			};
		}

		// Get session (for future authorization)
		const cookieStore = await cookies();
		const sessionId = cookieStore.get("session_id")?.value;

		if (!sessionId) {
			return {
				success: false,
				errors: {
					_form: ["セッションが見つかりません。ログインし直してください。"],
				},
			};
		}

		// Execute use case
		const repository = createRepository();
		const useCase = new RemovePresenter(repository);

		await useCase.execute({
			presenterId: validationResult.data.presenterId,
		});

		return {
			success: true,
		};
	} catch (error) {
		console.error("Failed to remove presenter:", error);
		return {
			success: false,
			errors: {
				_form: [
					error instanceof Error
						? error.message
						: "プレゼンターの削除に失敗しました",
				],
			},
		};
	}
}

/**
 * Add Episode Server Action
 * Adds a new episode to a presenter
 */
export async function addEpisodeAction(
	formData: FormData,
): Promise<
	| { success: true; episode: EpisodeWithLieDto }
	| { success: false; errors: Record<string, string[]> }
> {
	try {
		// Parse and validate form data
		const rawData = {
			presenterId: formData.get("presenterId"),
			text: formData.get("text"),
			isLie: formData.get("isLie") === "true",
		};

		const validationResult = AddEpisodeSchema.safeParse(rawData);

		if (!validationResult.success) {
			return {
				success: false,
				errors: validationResult.error.flatten().fieldErrors,
			};
		}

		// Get session (for future authorization)
		const cookieStore = await cookies();
		const sessionId = cookieStore.get("session_id")?.value;

		if (!sessionId) {
			return {
				success: false,
				errors: {
					_form: ["セッションが見つかりません。ログインし直してください。"],
				},
			};
		}

		// Execute use case
		const repository = createRepository();
		const useCase = new AddEpisode(repository);

		const result = await useCase.execute({
			presenterId: validationResult.data.presenterId,
			text: validationResult.data.text,
			isLie: validationResult.data.isLie,
		});

		return {
			success: true,
			episode: result.episode,
		};
	} catch (error) {
		console.error("Failed to add episode:", error);
		return {
			success: false,
			errors: {
				_form: [
					error instanceof Error
						? error.message
						: "エピソードの追加に失敗しました",
				],
			},
		};
	}
}

/**
 * Get Presenter Episodes Server Action
 * Retrieves a presenter with their episodes
 */
export async function getPresenterEpisodesAction(
	presenterId: string,
): Promise<
	| { success: true; presenter: PresenterWithLieDto }
	| { success: false; error: string }
> {
	try {
		// Get session
		const cookieStore = await cookies();
		const sessionId = cookieStore.get("session_id")?.value;

		if (!sessionId) {
			return {
				success: false,
				error: "セッションが見つかりません。ログインし直してください。",
			};
		}

		// Execute use case
		const repository = createRepository();
		const useCase = new GetPresenterEpisodes(repository);

		const result = await useCase.execute({
			presenterId,
			requesterId: sessionId,
		});

		return {
			success: true,
			presenter: result.presenter,
		};
	} catch (error) {
		console.error("Failed to get presenter episodes:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "プレゼンターの取得に失敗しました",
		};
	}
}
