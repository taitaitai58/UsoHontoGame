// Unit Tests: AddEpisode Use Case
// Feature: 002-game-preparation
// Tests for adding episodes to presenters

import { describe, it, expect, beforeEach } from "vitest";
import { AddEpisode } from "@/server/application/use-cases/games/AddEpisode";
import { InMemoryGameRepository } from "@/server/infrastructure/repositories/InMemoryGameRepository";
import { ValidationError } from "@/server/domain/errors/ValidationError";
import { NotFoundError } from "@/server/domain/errors/NotFoundError";
import { Presenter } from "@/server/domain/entities/Presenter";
import { Episode } from "@/server/domain/entities/Episode";

describe("AddEpisode Use Case", () => {
	let repository: InMemoryGameRepository;
	let useCase: AddEpisode;
	let testPresenterId: string;

	beforeEach(async () => {
		repository = InMemoryGameRepository.getInstance();
		repository.clear();
		useCase = new AddEpisode(repository);

		// Create a test presenter
		const presenter = Presenter.createIncomplete({
			id: "presenter-123",
			gameId: "game-123",
			nickname: "TestPresenter",
			episodes: [],
			createdAt: new Date(),
		});

		await repository.addPresenter(presenter);
		testPresenterId = presenter.id;
	});

	describe("Success Cases", () => {
		it("should successfully add first episode to presenter", async () => {
			// Given
			const text = "This is my first episode";
			const isLie = false;

			// When
			const result = await useCase.execute({
				presenterId: testPresenterId,
				text,
				isLie,
			});

			// Then
			expect(result.episode).toBeDefined();
			expect(result.episode.presenterId).toBe(testPresenterId);
			expect(result.episode.text).toBe(text);
			expect(result.episode.isLie).toBe(isLie);
			expect(result.episode.id).toBeDefined();
			expect(result.episode.createdAt).toBeInstanceOf(Date);
		});

		it("should trim episode text whitespace", async () => {
			// Given
			const text = "  Episode with spaces  ";

			// When
			const result = await useCase.execute({
				presenterId: testPresenterId,
				text,
				isLie: false,
			});

			// Then
			expect(result.episode.text).toBe("Episode with spaces");
		});

		it("should allow adding up to 3 episodes", async () => {
			// When: Add 3 episodes (2 truths, 1 lie)
			const episode1 = await useCase.execute({
				presenterId: testPresenterId,
				text: "First truth episode",
				isLie: false,
			});

			const episode2 = await useCase.execute({
				presenterId: testPresenterId,
				text: "Second truth episode",
				isLie: false,
			});

			const episode3 = await useCase.execute({
				presenterId: testPresenterId,
				text: "The lie episode",
				isLie: true,
			});

			// Then
			expect(episode1.episode).toBeDefined();
			expect(episode2.episode).toBeDefined();
			expect(episode3.episode).toBeDefined();

			const episodes = await repository.findEpisodesByPresenterId(
				testPresenterId,
			);
			expect(episodes).toHaveLength(3);
		});

		it("should allow exactly one lie episode", async () => {
			// When
			await useCase.execute({
				presenterId: testPresenterId,
				text: "Truth 1",
				isLie: false,
			});

			await useCase.execute({
				presenterId: testPresenterId,
				text: "Truth 2",
				isLie: false,
			});

			const lieEpisode = await useCase.execute({
				presenterId: testPresenterId,
				text: "The lie",
				isLie: true,
			});

			// Then
			expect(lieEpisode.episode.isLie).toBe(true);
			const episodes = await repository.findEpisodesByPresenterId(
				testPresenterId,
			);
			const lies = episodes.filter((ep) => ep.isLie);
			expect(lies).toHaveLength(1);
		});
	});

	describe("Validation Errors", () => {
		it("should reject empty episode text", async () => {
			// When/Then
			await expect(
				useCase.execute({
					presenterId: testPresenterId,
					text: "",
					isLie: false,
				}),
			).rejects.toThrow(ValidationError);
			await expect(
				useCase.execute({
					presenterId: testPresenterId,
					text: "",
					isLie: false,
				}),
			).rejects.toThrow("Episode text cannot be empty");
		});

		it("should reject episode text over 1000 characters", async () => {
			// Given: Text with 1001 characters
			const longText = "A".repeat(1001);

			// When/Then
			await expect(
				useCase.execute({
					presenterId: testPresenterId,
					text: longText,
					isLie: false,
				}),
			).rejects.toThrow(ValidationError);
			await expect(
				useCase.execute({
					presenterId: testPresenterId,
					text: longText,
					isLie: false,
				}),
			).rejects.toThrow("cannot exceed 1000 characters");
		});

		it("should reject 4th episode (maximum 3)", async () => {
			// Given: Add 3 episodes
			await useCase.execute({
				presenterId: testPresenterId,
				text: "Episode 1",
				isLie: false,
			});

			await useCase.execute({
				presenterId: testPresenterId,
				text: "Episode 2",
				isLie: false,
			});

			await useCase.execute({
				presenterId: testPresenterId,
				text: "Episode 3",
				isLie: true,
			});

			// When/Then: 4th episode should fail
			await expect(
				useCase.execute({
					presenterId: testPresenterId,
					text: "Episode 4",
					isLie: false,
				}),
			).rejects.toThrow(ValidationError);
			await expect(
				useCase.execute({
					presenterId: testPresenterId,
					text: "Episode 4",
					isLie: false,
				}),
			).rejects.toThrow("already has 3 episodes");
		});

		it("should reject second lie episode", async () => {
			// Given: Add first lie episode
			await useCase.execute({
				presenterId: testPresenterId,
				text: "First lie",
				isLie: true,
			});

			// When/Then: Second lie should fail
			await expect(
				useCase.execute({
					presenterId: testPresenterId,
					text: "Second lie",
					isLie: true,
				}),
			).rejects.toThrow(ValidationError);
			await expect(
				useCase.execute({
					presenterId: testPresenterId,
					text: "Second lie",
					isLie: true,
				}),
			).rejects.toThrow("already has a lie episode");
		});

		it("should reject when presenter does not exist", async () => {
			// Given
			const nonExistentPresenterId = "non-existent-presenter";

			// When/Then
			await expect(
				useCase.execute({
					presenterId: nonExistentPresenterId,
					text: "Episode text",
					isLie: false,
				}),
			).rejects.toThrow(NotFoundError);
			await expect(
				useCase.execute({
					presenterId: nonExistentPresenterId,
					text: "Episode text",
					isLie: false,
				}),
			).rejects.toThrow("not found");
		});
	});

	describe("Edge Cases", () => {
		it("should accept episode text at exactly 1000 characters", async () => {
			// Given: Text with exactly 1000 characters
			const maxText = "A".repeat(1000);

			// When
			const result = await useCase.execute({
				presenterId: testPresenterId,
				text: maxText,
				isLie: false,
			});

			// Then
			expect(result.episode.text).toHaveLength(1000);
		});

		it("should accept episode text with 1 character", async () => {
			// Given
			const minText = "A";

			// When
			const result = await useCase.execute({
				presenterId: testPresenterId,
				text: minText,
				isLie: false,
			});

			// Then
			expect(result.episode.text).toBe(minText);
		});

		it("should handle Japanese characters in episode text", async () => {
			// Given
			const japaneseText =
				"これは私のエピソードです。今日は良い天気でした。";

			// When
			const result = await useCase.execute({
				presenterId: testPresenterId,
				text: japaneseText,
				isLie: false,
			});

			// Then
			expect(result.episode.text).toBe(japaneseText);
		});

		it("should handle special characters and emojis", async () => {
			// Given
			const text = "Special characters: !@#$%^&*() 😀 🎉";

			// When
			const result = await useCase.execute({
				presenterId: testPresenterId,
				text,
				isLie: false,
			});

			// Then
			expect(result.episode.text).toBe(text);
		});

		it("should handle newlines in episode text", async () => {
			// Given
			const text = "Line 1\nLine 2\nLine 3";

			// When
			const result = await useCase.execute({
				presenterId: testPresenterId,
				text,
				isLie: false,
			});

			// Then
			expect(result.episode.text).toBe(text);
		});
	});

	describe("Timestamp", () => {
		it("should set createdAt to current time", async () => {
			// Given
			const beforeTime = new Date();

			// When
			const result = await useCase.execute({
				presenterId: testPresenterId,
				text: "Test episode",
				isLie: false,
			});

			// Then
			const afterTime = new Date();
			expect(result.episode.createdAt.getTime()).toBeGreaterThanOrEqual(
				beforeTime.getTime(),
			);
			expect(result.episode.createdAt.getTime()).toBeLessThanOrEqual(
				afterTime.getTime(),
			);
		});
	});
});
