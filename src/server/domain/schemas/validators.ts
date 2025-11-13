// Complex Validation Rules for Game Preparation
// Feature: 002-game-preparation
// Validates "complete presenter" definition: exactly 3 episodes AND exactly 1 lie marker

import { z } from "zod";

// Validate presenter has exactly 3 episodes with exactly 1 lie (FR-018, FR-019)
// This defines what a "complete presenter" means for status transitions
export const CompletePresenterSchema = z
	.object({
		episodes: z.array(
			z.object({
				isLie: z.boolean(),
			}),
		),
	})
	.refine((data) => data.episodes.length === 3, {
		message: "エピソードは3つ登録する必要があります",
	})
	.refine((data) => data.episodes.filter((e) => e.isLie).length === 1, {
		message: "ウソのエピソードを1つ選択してください",
	});

// Validate game can transition to 出題中 status (FR-011)
// Requires at least 1 presenter and all presenters must be "complete"
export const ReadyToAcceptSchema = z
	.object({
		presenters: z.array(CompletePresenterSchema),
	})
	.refine((data) => data.presenters.length >= 1, {
		message: "出題者が1人以上必要です",
	});

// Type Inference
export type CompletePresenter = z.infer<typeof CompletePresenterSchema>;
export type ReadyToAccept = z.infer<typeof ReadyToAcceptSchema>;
