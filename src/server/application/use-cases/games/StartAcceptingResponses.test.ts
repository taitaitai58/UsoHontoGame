// Unit Tests: StartAcceptingResponses Use Case
// Feature: 002-game-preparation
// Tests for transitioning games to accepting responses status

import { describe, it, expect, beforeEach } from "vitest";
import { StartAcceptingResponses } from "@/server/application/use-cases/games/StartAcceptingResponses";
import { InMemoryGameRepository } from "@/server/infrastructure/repositories/InMemoryGameRepository";
import { Game } from "@/server/domain/entities/Game";
import { GameId } from "@/server/domain/value-objects/GameId";
import { GameStatus } from "@/server/domain/value-objects/GameStatus";
import { Presenter } from "@/server/domain/entities/Presenter";
import { Episode } from "@/server/domain/entities/Episode";
import { ValidationError } from "@/server/domain/errors/ValidationError";
import { NotFoundError } from "@/server/domain/errors/NotFoundError";
import { InvalidStatusTransitionError } from "@/server/domain/errors/InvalidStatusTransitionError";

describe("StartAcceptingResponses Use Case", () => {
	let repository: InMemoryGameRepository;
	let useCase: StartAcceptingResponses;

	beforeEach(() => {
		repository = InMemoryGameRepository.getInstance();
		repository.clear();
		useCase = new StartAcceptingResponses(repository);
	});

	describe("Success Cases", () => {
		it("should transition game from 準備中 to 出題中 when at least one complete presenter exists", async () => {
			// Given: Game in 準備中 with one complete presenter
			const gameId = "550e8400-e29b-41d4-a716-446655440001";
			const game = new Game(
				new GameId(gameId),
				"Test Game",
				new GameStatus("準備中"),
				10,
				0,
				new Date(),
				new Date(),
			);
			await repository.create(game);

			// Add complete presenter (3 episodes, 1 lie)
			const presenter = Presenter.createIncomplete({
				id: "presenter-1",
				gameId,
				nickname: "Test Presenter",
				episodes: [],
				createdAt: new Date(),
			});

			const episodes = [
				Episode.create({
					id: "ep1",
					presenterId: "presenter-1",
					text: "Episode 1",
					isLie: false,
					createdAt: new Date(),
				}),
				Episode.create({
					id: "ep2",
					presenterId: "presenter-1",
					text: "Episode 2",
					isLie: false,
					createdAt: new Date(),
				}),
				Episode.create({
					id: "ep3",
					presenterId: "presenter-1",
					text: "Episode 3 - This is a lie",
					isLie: true,
					createdAt: new Date(),
				}),
			];

			await repository.addPresenter(presenter);
			for (const episode of episodes) {
				await repository.addEpisode(episode);
			}

			// When
			const result = await useCase.execute({ gameId });

			// Then
			expect(result.success).toBe(true);

			const updatedGame = await repository.findById(new GameId(gameId));
			expect(updatedGame?.status.toString()).toBe("出題中");
		});

		it("should allow transition with multiple complete presenters", async () => {
			// Given: Game with 2 complete presenters
			const gameId = "550e8400-e29b-41d4-a716-446655440002";
			const game = new Game(
				new GameId(gameId),
				"Test Game",
				new GameStatus("準備中"),
				10,
				0,
				new Date(),
				new Date(),
			);
			await repository.create(game);

			// Add 2 complete presenters
			for (let i = 1; i <= 2; i++) {
				const presenter = Presenter.createIncomplete({
					id: `presenter-${i}`,
					gameId,
					nickname: `Presenter ${i}`,
					episodes: [],
					createdAt: new Date(),
				});
				await repository.addPresenter(presenter);

				const episodes = [
					Episode.create({
						id: `p${i}-ep1`,
						presenterId: `presenter-${i}`,
						text: `Episode 1 from presenter ${i}`,
						isLie: false,
						createdAt: new Date(),
					}),
					Episode.create({
						id: `p${i}-ep2`,
						presenterId: `presenter-${i}`,
						text: `Episode 2 from presenter ${i}`,
						isLie: false,
						createdAt: new Date(),
					}),
					Episode.create({
						id: `p${i}-ep3`,
						presenterId: `presenter-${i}`,
						text: `Lie episode from presenter ${i}`,
						isLie: true,
						createdAt: new Date(),
					}),
				];

				for (const episode of episodes) {
					await repository.addEpisode(episode);
				}
			}

			// When
			const result = await useCase.execute({ gameId });

			// Then
			expect(result.success).toBe(true);
		});

		it("should allow transition when some presenters are incomplete but at least one is complete", async () => {
			// Given: Game with 1 complete and 1 incomplete presenter
			const gameId = "550e8400-e29b-41d4-a716-446655440003";
			const game = new Game(
				new GameId(gameId),
				"Test Game",
				new GameStatus("準備中"),
				10,
				0,
				new Date(),
				new Date(),
			);
			await repository.create(game);

			// Add complete presenter
			const completePresenter = Presenter.createIncomplete({
				id: "complete-presenter",
				gameId,
				nickname: "Complete",
				episodes: [],
				createdAt: new Date(),
			});
			await repository.addPresenter(completePresenter);

			for (let i = 1; i <= 3; i++) {
				await repository.addEpisode(
					Episode.create({
						id: `complete-ep${i}`,
						presenterId: "complete-presenter",
						text: `Episode ${i}`,
						isLie: i === 3,
						createdAt: new Date(),
					}),
				);
			}

			// Add incomplete presenter (only 2 episodes)
			const incompletePresenter = Presenter.createIncomplete({
				id: "incomplete-presenter",
				gameId,
				nickname: "Incomplete",
				episodes: [],
				createdAt: new Date(),
			});
			await repository.addPresenter(incompletePresenter);

			for (let i = 1; i <= 2; i++) {
				await repository.addEpisode(
					Episode.create({
						id: `incomplete-ep${i}`,
						presenterId: "incomplete-presenter",
						text: `Episode ${i}`,
						isLie: false,
						createdAt: new Date(),
					}),
				);
			}

			// When
			const result = await useCase.execute({ gameId });

			// Then
			expect(result.success).toBe(true);
		});
	});

	describe("Validation Errors", () => {
		it("should reject transition when game has no presenters", async () => {
			// Given: Game with no presenters
			const gameId = "550e8400-e29b-41d4-a716-446655440004";
			const game = new Game(
				new GameId(gameId),
				"Test Game",
				new GameStatus("準備中"),
				10,
				0,
				new Date(),
				new Date(),
			);
			await repository.create(game);

			// When/Then
			await expect(useCase.execute({ gameId })).rejects.toThrow(
				ValidationError,
			);
			await expect(useCase.execute({ gameId })).rejects.toThrow(
				"少なくとも1人のプレゼンターが必要です",
			);
		});

		it("should reject transition when all presenters are incomplete", async () => {
			// Given: Game with only incomplete presenters
			const gameId = "550e8400-e29b-41d4-a716-446655440005";
			const game = new Game(
				new GameId(gameId),
				"Test Game",
				new GameStatus("準備中"),
				10,
				0,
				new Date(),
				new Date(),
			);
			await repository.create(game);

			// Add incomplete presenter (only 2 episodes)
			const presenter = Presenter.createIncomplete({
				id: "presenter-1",
				gameId,
				nickname: "Incomplete",
				episodes: [],
				createdAt: new Date(),
			});
			await repository.addPresenter(presenter);

			for (let i = 1; i <= 2; i++) {
				await repository.addEpisode(
					Episode.create({
						id: `ep${i}`,
						presenterId: "presenter-1",
						text: `Episode ${i}`,
						isLie: false,
						createdAt: new Date(),
					}),
				);
			}

			// When/Then
			await expect(useCase.execute({ gameId })).rejects.toThrow(
				ValidationError,
			);
			await expect(useCase.execute({ gameId })).rejects.toThrow(
				"3つのエピソード（1つのウソを含む）を登録している必要があります",
			);
		});

		it("should reject transition when presenter has 3 episodes but no lie", async () => {
			// Given: Presenter with 3 episodes but all truth
			const gameId = "550e8400-e29b-41d4-a716-446655440006";
			const game = new Game(
				new GameId(gameId),
				"Test Game",
				new GameStatus("準備中"),
				10,
				0,
				new Date(),
				new Date(),
			);
			await repository.create(game);

			const presenter = Presenter.createIncomplete({
				id: "presenter-1",
				gameId,
				nickname: "No Lie",
				episodes: [],
				createdAt: new Date(),
			});
			await repository.addPresenter(presenter);

			for (let i = 1; i <= 3; i++) {
				await repository.addEpisode(
					Episode.create({
						id: `ep${i}`,
						presenterId: "presenter-1",
						text: `Episode ${i}`,
						isLie: false, // All truth
						createdAt: new Date(),
					}),
				);
			}

			// When/Then
			await expect(useCase.execute({ gameId })).rejects.toThrow(
				ValidationError,
			);
		});

		it("should reject transition when game does not exist", async () => {
			// Given: Non-existent but valid UUID
			const gameId = "550e8400-e29b-41d4-a716-446655440999";

			// When/Then
			await expect(useCase.execute({ gameId })).rejects.toThrow(
				NotFoundError,
			);
			await expect(useCase.execute({ gameId })).rejects.toThrow(
				"not found",
			);
		});

		it("should reject transition when game is already in 出題中 status", async () => {
			// Given: Game already in 出題中
			const gameId = "550e8400-e29b-41d4-a716-446655440007";
			const game = new Game(
				new GameId(gameId),
				"Test Game",
				new GameStatus("出題中"), // Already accepting
				10,
				0,
				new Date(),
				new Date(),
			);
			await repository.create(game);

			// Add complete presenter
			const presenter = Presenter.createIncomplete({
				id: "presenter-1",
				gameId,
				nickname: "Test",
				episodes: [],
				createdAt: new Date(),
			});
			await repository.addPresenter(presenter);

			for (let i = 1; i <= 3; i++) {
				await repository.addEpisode(
					Episode.create({
						id: `ep${i}`,
						presenterId: "presenter-1",
						text: `Episode ${i}`,
						isLie: i === 3,
						createdAt: new Date(),
					}),
				);
			}

			// When/Then
			await expect(useCase.execute({ gameId })).rejects.toThrow(
				InvalidStatusTransitionError,
			);
		});

		it("should reject transition when game is in 締切 status", async () => {
			// Given: Game in 締切 status
			const gameId = "550e8400-e29b-41d4-a716-446655440008";
			const game = new Game(
				new GameId(gameId),
				"Test Game",
				new GameStatus("締切"), // Closed
				10,
				0,
				new Date(),
				new Date(),
			);
			await repository.create(game);

			// Add complete presenter
			const presenter = Presenter.createIncomplete({
				id: "presenter-1",
				gameId,
				nickname: "Test",
				episodes: [],
				createdAt: new Date(),
			});
			await repository.addPresenter(presenter);

			for (let i = 1; i <= 3; i++) {
				await repository.addEpisode(
					Episode.create({
						id: `ep${i}`,
						presenterId: "presenter-1",
						text: `Episode ${i}`,
						isLie: i === 3,
						createdAt: new Date(),
					}),
				);
			}

			// When/Then
			await expect(useCase.execute({ gameId })).rejects.toThrow(
				InvalidStatusTransitionError,
			);
		});
	});
});
