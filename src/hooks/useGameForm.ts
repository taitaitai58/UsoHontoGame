"use client";

// useGameForm Hook
// Feature: 002-game-preparation
// Custom hook for game creation/editing form with Zod validation

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
	CreateGameSchema,
	UpdateGameSchema,
} from "@/server/domain/schemas/gameSchemas";
import { createGameAction, updateGameAction } from "@/app/actions/game";
import type { CreateGameOutput } from "@/server/application/dto/GameDto";

interface UseGameFormParams {
	/** Form mode: 'create' or 'edit' */
	mode?: "create" | "edit";
	/** Game ID (required for edit mode) */
	gameId?: string;
}

interface UseGameFormReturn {
	/** Form submission handler */
	handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
	/** Whether form is currently submitting */
	isSubmitting: boolean;
	/** Validation errors by field */
	errors: Record<string, string[]>;
	/** Created game data on success (create mode only) */
	createdGame: CreateGameOutput | null;
	/** Whether operation was successful */
	isSuccess: boolean;
}

/**
 * Custom hook for game creation/editing form
 * Handles form validation, submission, and error display
 * @param params Form parameters (mode, gameId)
 * @returns Form state and handlers
 */
export function useGameForm({
	mode = "create",
	gameId,
}: UseGameFormParams = {}): UseGameFormReturn {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [errors, setErrors] = useState<Record<string, string[]>>({});
	const [createdGame, setCreatedGame] = useState<CreateGameOutput | null>(
		null,
	);
	const [isSuccess, setIsSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrors({});
		setIsSuccess(false);

		const formData = new FormData(e.currentTarget);

		// Client-side validation with Zod
		if (mode === "create") {
			const rawData = {
				playerLimit: Number(formData.get("playerLimit")),
			};

			const validationResult = CreateGameSchema.safeParse(rawData);

			if (!validationResult.success) {
				setErrors(validationResult.error.flatten().fieldErrors);
				return;
			}
		} else {
			// Edit mode validation
			const rawData = {
				gameId: formData.get("gameId") as string,
				playerLimit: Number(formData.get("playerLimit")),
			};

			const validationResult = UpdateGameSchema.safeParse(rawData);

			if (!validationResult.success) {
				setErrors(validationResult.error.flatten().fieldErrors);
				return;
			}
		}

		// Server action call with transition
		startTransition(async () => {
			try {
				if (mode === "create") {
					const result = await createGameAction(formData);

					if (result.success) {
						setCreatedGame(result.game);
						setIsSuccess(true);
						// Redirect to game list after short delay
						setTimeout(() => {
							router.push("/games");
						}, 1500);
					} else {
						setErrors(result.errors);
					}
				} else {
					// Edit mode
					const result = await updateGameAction(formData);

					if (result.success) {
						setIsSuccess(true);
						// Refresh the page to show updated data
						setTimeout(() => {
							router.refresh();
						}, 1000);
					} else {
						setErrors(result.errors);
					}
				}
			} catch (error) {
				console.error("Form submission error:", error);
				setErrors({
					_form: ["予期しないエラーが発生しました"],
				});
			}
		});
	};

	return {
		handleSubmit,
		isSubmitting: isPending,
		errors,
		createdGame,
		isSuccess,
	};
}
