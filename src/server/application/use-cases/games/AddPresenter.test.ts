// Unit Tests: AddPresenter Use Case
// Feature: 002-game-preparation
// Tests for adding presenters to games

import { describe, it, expect, beforeEach } from "vitest";
import { AddPresenter } from "@/server/application/use-cases/games/AddPresenter";
import { InMemoryGameRepository } from "@/server/infrastructure/repositories/InMemoryGameRepository";
import { ValidationError } from "@/server/domain/errors/ValidationError";
import { Presenter } from "@/server/domain/entities/Presenter";

describe("AddPresenter Use Case", () => {
	let repository: InMemoryGameRepository;
	let useCase: AddPresenter;

	beforeEach(() => {
		repository = InMemoryGameRepository.getInstance();
		repository.clear(); // Clear repository before each test
		useCase = new AddPresenter(repository);
	});

	describe("Success Cases", () => {
		it("should successfully add a presenter to a game", async () => {
			// Given
			const gameId = "game-123";
			const nickname = "TestPresenter";

			// When
			const result = await useCase.execute({
				gameId,
				nickname,
			});

			// Then
			expect(result.presenter).toBeDefined();
			expect(result.presenter.gameId).toBe(gameId);
			expect(result.presenter.nickname).toBe(nickname);
			expect(result.presenter.episodes).toHaveLength(0);
			expect(result.presenter.id).toBeDefined();
			expect(result.presenter.createdAt).toBeInstanceOf(Date);
		});

		it("should trim nickname whitespace", async () => {
			// Given
			const gameId = "game-123";
			const nickname = "  TestPresenter  ";

			// When
			const result = await useCase.execute({
				gameId,
				nickname,
			});

			// Then
			expect(result.presenter.nickname).toBe("TestPresenter");
		});

		it("should allow multiple presenters up to 10", async () => {
			// Given
			const gameId = "game-123";

			// When: Add 10 presenters
			for (let i = 1; i <= 10; i++) {
				const result = await useCase.execute({
					gameId,
					nickname: `Presenter${i}`,
				});

				expect(result.presenter).toBeDefined();
			}

			// Then: All 10 should be added successfully
			const presenters = await repository.findPresentersByGameId(gameId);
			expect(presenters).toHaveLength(10);
		});
	});

	describe("Validation Errors", () => {
		it("should reject empty nickname", async () => {
			// Given
			const gameId = "game-123";
			const nickname = "";

			// When/Then
			await expect(
				useCase.execute({
					gameId,
					nickname,
				}),
			).rejects.toThrow(ValidationError);
			await expect(
				useCase.execute({
					gameId,
					nickname,
				}),
			).rejects.toThrow("Presenter nickname cannot be empty");
		});

		it("should reject whitespace-only nickname", async () => {
			// Given
			const gameId = "game-123";
			const nickname = "   ";

			// When/Then
			await expect(
				useCase.execute({
					gameId,
					nickname,
				}),
			).rejects.toThrow(ValidationError);
		});

		it("should reject when game already has 10 presenters (maximum)", async () => {
			// Given
			const gameId = "game-123";

			// Add 10 presenters
			for (let i = 1; i <= 10; i++) {
				await useCase.execute({
					gameId,
					nickname: `Presenter${i}`,
				});
			}

			// When/Then: 11th presenter should fail
			await expect(
				useCase.execute({
					gameId,
					nickname: "Presenter11",
				}),
			).rejects.toThrow(ValidationError);
			await expect(
				useCase.execute({
					gameId,
					nickname: "Presenter11",
				}),
			).rejects.toThrow("already has maximum of 10 presenters");
		});
	});

	describe("Edge Cases", () => {
		it("should handle Japanese characters in nickname", async () => {
			// Given
			const gameId = "game-123";
			const nickname = "田中太郎";

			// When
			const result = await useCase.execute({
				gameId,
				nickname,
			});

			// Then
			expect(result.presenter.nickname).toBe(nickname);
		});

		it("should handle long nicknames", async () => {
			// Given
			const gameId = "game-123";
			const nickname = "A".repeat(50);

			// When
			const result = await useCase.execute({
				gameId,
				nickname,
			});

			// Then
			expect(result.presenter.nickname).toBe(nickname);
		});

		it("should allow presenters with same nickname in different games", async () => {
			// Given
			const gameId1 = "game-123";
			const gameId2 = "game-456";
			const nickname = "SameName";

			// When
			const result1 = await useCase.execute({
				gameId: gameId1,
				nickname,
			});

			const result2 = await useCase.execute({
				gameId: gameId2,
				nickname,
			});

			// Then
			expect(result1.presenter.nickname).toBe(nickname);
			expect(result2.presenter.nickname).toBe(nickname);
			expect(result1.presenter.id).not.toBe(result2.presenter.id);
			expect(result1.presenter.gameId).toBe(gameId1);
			expect(result2.presenter.gameId).toBe(gameId2);
		});
	});

	describe("Initial State", () => {
		it("should create presenter with empty episodes array", async () => {
			// Given
			const gameId = "game-123";
			const nickname = "TestPresenter";

			// When
			const result = await useCase.execute({
				gameId,
				nickname,
			});

			// Then
			expect(result.presenter.episodes).toEqual([]);
		});

		it("should set createdAt to current time", async () => {
			// Given
			const gameId = "game-123";
			const nickname = "TestPresenter";
			const beforeTime = new Date();

			// When
			const result = await useCase.execute({
				gameId,
				nickname,
			});

			// Then
			const afterTime = new Date();
			expect(result.presenter.createdAt.getTime()).toBeGreaterThanOrEqual(
				beforeTime.getTime(),
			);
			expect(result.presenter.createdAt.getTime()).toBeLessThanOrEqual(
				afterTime.getTime(),
			);
		});
	});
});
