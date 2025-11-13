// Unit Tests: CloseGame Use Case
// Feature: 002-game-preparation
// Tests for transitioning games to closed status

import { describe, it, expect, beforeEach } from "vitest";
import { CloseGame } from "@/server/application/use-cases/games/CloseGame";
import { InMemoryGameRepository } from "@/server/infrastructure/repositories/InMemoryGameRepository";
import { Game } from "@/server/domain/entities/Game";
import { GameId } from "@/server/domain/value-objects/GameId";
import { GameStatus } from "@/server/domain/value-objects/GameStatus";
import { NotFoundError } from "@/server/domain/errors/NotFoundError";
import { InvalidStatusTransitionError } from "@/server/domain/errors/InvalidStatusTransitionError";

describe("CloseGame Use Case", () => {
	let repository: InMemoryGameRepository;
	let useCase: CloseGame;

	beforeEach(() => {
		repository = InMemoryGameRepository.getInstance();
		repository.clear();
		useCase = new CloseGame(repository);
	});

	describe("Success Cases", () => {
		it("should transition game from 出題中 to 締切", async () => {
			// Given: Game in 出題中 status
			const gameId = "550e8400-e29b-41d4-a716-446655440001";
			const game = new Game(
				new GameId(gameId),
				"Test Game",
				new GameStatus("出題中"),
				10,
				5,
				new Date(),
				new Date(),
			);
			await repository.create(game);

			// When
			const result = await useCase.execute({ gameId });

			// Then
			expect(result.success).toBe(true);

			const updatedGame = await repository.findById(new GameId(gameId));
			expect(updatedGame?.status.toString()).toBe("締切");
		});

		it("should close game with no players", async () => {
			// Given: Game in 出題中 with 0 players
			const gameId = "550e8400-e29b-41d4-a716-446655440002";
			const game = new Game(
				new GameId(gameId),
				"Empty Game",
				new GameStatus("出題中"),
				10,
				0,
				new Date(),
				new Date(),
			);
			await repository.create(game);

			// When
			const result = await useCase.execute({ gameId });

			// Then
			expect(result.success).toBe(true);
		});

		it("should close game with maximum players", async () => {
			// Given: Game in 出題中 with full players
			const gameId = "550e8400-e29b-41d4-a716-446655440003";
			const game = new Game(
				new GameId(gameId),
				"Full Game",
				new GameStatus("出題中"),
				10,
				10,
				new Date(),
				new Date(),
			);
			await repository.create(game);

			// When
			const result = await useCase.execute({ gameId });

			// Then
			expect(result.success).toBe(true);
		});

		it("should update the game's updatedAt timestamp", async () => {
			// Given: Game in 出題中
			const gameId = "550e8400-e29b-41d4-a716-446655440004";
			const beforeTime = new Date();
			const game = new Game(
				new GameId(gameId),
				"Test Game",
				new GameStatus("出題中"),
				10,
				0,
				beforeTime,
				beforeTime,
			);
			await repository.create(game);

			// Small delay to ensure timestamp difference
			await new Promise((resolve) => setTimeout(resolve, 10));

			// When
			await useCase.execute({ gameId });

			// Then
			const updatedGame = await repository.findById(new GameId(gameId));
			expect(updatedGame?.updatedAt.getTime()).toBeGreaterThanOrEqual(
				beforeTime.getTime(),
			);
		});
	});

	describe("Validation Errors", () => {
		it("should reject closing when game does not exist", async () => {
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

		it("should reject closing when game is in 準備中 status", async () => {
			// Given: Game in 準備中 status
			const gameId = "550e8400-e29b-41d4-a716-446655440005";
			const game = new Game(
				new GameId(gameId),
				"Preparation Game",
				new GameStatus("準備中"),
				10,
				0,
				new Date(),
				new Date(),
			);
			await repository.create(game);

			// When/Then
			await expect(useCase.execute({ gameId })).rejects.toThrow(
				InvalidStatusTransitionError,
			);
			await expect(useCase.execute({ gameId })).rejects.toThrow(
				"出題中",
			);
		});

		it("should reject closing when game is already in 締切 status", async () => {
			// Given: Game already in 締切 status
			const gameId = "550e8400-e29b-41d4-a716-446655440006";
			const game = new Game(
				new GameId(gameId),
				"Closed Game",
				new GameStatus("締切"),
				10,
				0,
				new Date(),
				new Date(),
			);
			await repository.create(game);

			// When/Then
			await expect(useCase.execute({ gameId })).rejects.toThrow(
				InvalidStatusTransitionError,
			);
		});
	});

	describe("Edge Cases", () => {
		it("should handle game with very long name", async () => {
			// Given: Game with long name
			const gameId = "550e8400-e29b-41d4-a716-446655440007";
			const longName = "A".repeat(100);
			const game = new Game(
				new GameId(gameId),
				longName,
				new GameStatus("出題中"),
				10,
				0,
				new Date(),
				new Date(),
			);
			await repository.create(game);

			// When
			const result = await useCase.execute({ gameId });

			// Then
			expect(result.success).toBe(true);
		});

		it("should handle game with special characters in name", async () => {
			// Given: Game with special characters
			const gameId = "550e8400-e29b-41d4-a716-446655440008";
			const game = new Game(
				new GameId(gameId),
				"ゲーム名：特殊文字！@#$%^&*()",
				new GameStatus("出題中"),
				10,
				0,
				new Date(),
				new Date(),
			);
			await repository.create(game);

			// When
			const result = await useCase.execute({ gameId });

			// Then
			expect(result.success).toBe(true);
		});

		it("should handle concurrent close operations gracefully", async () => {
			// Given: Game in 出題中
			const gameId = "550e8400-e29b-41d4-a716-446655440009";
			const game = new Game(
				new GameId(gameId),
				"Test Game",
				new GameStatus("出題中"),
				10,
				0,
				new Date(),
				new Date(),
			);
			await repository.create(game);

			// When: First close succeeds
			const result1 = await useCase.execute({ gameId });
			expect(result1.success).toBe(true);

			// Then: Second close fails (already closed)
			await expect(useCase.execute({ gameId })).rejects.toThrow(
				InvalidStatusTransitionError,
			);
		});
	});
});
