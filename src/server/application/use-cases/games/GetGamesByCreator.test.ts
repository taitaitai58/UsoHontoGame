// Unit Tests: GetGamesByCreator Use Case
// Feature: 002-game-preparation

import { describe, it, expect, beforeEach } from "vitest";
import { GetGamesByCreator } from "@/server/application/use-cases/games/GetGamesByCreator";
import { InMemoryGameRepository } from "@/server/infrastructure/repositories/InMemoryGameRepository";
import { Game } from "@/server/domain/entities/Game";
import { GameId } from "@/server/domain/value-objects/GameId";
import { GameStatus } from "@/server/domain/value-objects/GameStatus";

describe("GetGamesByCreator", () => {
	let repository: InMemoryGameRepository;
	let useCase: GetGamesByCreator;

	beforeEach(() => {
		repository = InMemoryGameRepository.getInstance();
		repository.clear(); // Clear state between tests
		useCase = new GetGamesByCreator(repository);
	});

	it("should return all games created by the specified moderator", async () => {
		// Given: Multiple games by the same creator
		const creatorId = "creator-session-123";
		const game1 = new Game(
			new GameId("550e8400-e29b-41d4-a716-446655440001"),
			"Game 1",
			new GameStatus("準備中"),
			10,
			0,
			new Date(),
			new Date(),
			creatorId,
		);
		const game2 = new Game(
			new GameId("550e8400-e29b-41d4-a716-446655440002"),
			"Game 2",
			new GameStatus("出題中"),
			20,
			5,
			new Date(),
			new Date(),
			creatorId,
		);

		await repository.create(game1);
		await repository.create(game2);

		// When: Getting games by creator
		const result = await useCase.execute({ creatorId });

		// Then: Should return both games
		expect(result.games).toHaveLength(2);
		expect(result.games[0].name).toBe("Game 1");
		expect(result.games[1].name).toBe("Game 2");
	});

	it("should return empty array when creator has no games", async () => {
		// Given: No games for creator
		const creatorId = "creator-session-123";

		// When: Getting games by creator
		const result = await useCase.execute({ creatorId });

		// Then: Should return empty array
		expect(result.games).toHaveLength(0);
		expect(result.games).toEqual([]);
	});

	it("should not return games from other creators", async () => {
		// Given: Games from different creators
		const creator1 = "creator-session-123";
		const creator2 = "creator-session-456";

		const game1 = new Game(
			new GameId("550e8400-e29b-41d4-a716-446655440001"),
			"Creator 1 Game",
			new GameStatus("準備中"),
			10,
			0,
			new Date(),
			new Date(),
			creator1,
		);
		const game2 = new Game(
			new GameId("550e8400-e29b-41d4-a716-446655440002"),
			"Creator 2 Game",
			new GameStatus("準備中"),
			15,
			0,
			new Date(),
			new Date(),
			creator2,
		);

		await repository.create(game1);
		await repository.create(game2);

		// When: Getting games for creator1
		const result = await useCase.execute({ creatorId: creator1 });

		// Then: Should return only creator1's game
		expect(result.games).toHaveLength(1);
		expect(result.games[0].name).toBe("Creator 1 Game");
	});

	it("should include correct status in game DTOs", async () => {
		// Given: Games with different statuses
		const creatorId = "creator-session-123";
		const game1 = new Game(
			new GameId("550e8400-e29b-41d4-a716-446655440001"),
			"Preparing Game",
			new GameStatus("準備中"),
			10,
			0,
			new Date(),
			new Date(),
			creatorId,
		);
		const game2 = new Game(
			new GameId("550e8400-e29b-41d4-a716-446655440002"),
			"Active Game",
			new GameStatus("出題中"),
			10,
			3,
			new Date(),
			new Date(),
			creatorId,
		);
		const game3 = new Game(
			new GameId("550e8400-e29b-41d4-a716-446655440003"),
			"Closed Game",
			new GameStatus("締切"),
			10,
			10,
			new Date(),
			new Date(),
			creatorId,
		);

		await repository.create(game1);
		await repository.create(game2);
		await repository.create(game3);

		// When: Getting games
		const result = await useCase.execute({ creatorId });

		// Then: Should include correct statuses
		expect(result.games).toHaveLength(3);
		expect(result.games[0].status).toBe("準備中");
		expect(result.games[1].status).toBe("出題中");
		expect(result.games[2].status).toBe("締切");
	});

	it("should calculate available slots correctly", async () => {
		// Given: Game with players
		const creatorId = "creator-session-123";
		const game = new Game(
			new GameId("550e8400-e29b-41d4-a716-446655440001"),
			"Test Game",
			new GameStatus("出題中"),
			20,
			7,
			new Date(),
			new Date(),
			creatorId,
		);

		await repository.create(game);

		// When: Getting games
		const result = await useCase.execute({ creatorId });

		// Then: Should calculate available slots
		expect(result.games[0].maxPlayers).toBe(20);
		expect(result.games[0].currentPlayers).toBe(7);
		expect(result.games[0].availableSlots).toBe(13);
	});

	it("should handle game with full capacity", async () => {
		// Given: Game at full capacity
		const creatorId = "creator-session-123";
		const game = new Game(
			new GameId("550e8400-e29b-41d4-a716-446655440001"),
			"Full Game",
			new GameStatus("出題中"),
			10,
			10,
			new Date(),
			new Date(),
			creatorId,
		);

		await repository.create(game);

		// When: Getting games
		const result = await useCase.execute({ creatorId });

		// Then: Should show 0 available slots
		expect(result.games[0].availableSlots).toBe(0);
	});

	it("should include all required fields in GameManagementDto", async () => {
		// Given: A game
		const creatorId = "creator-session-123";
		const gameId = "550e8400-e29b-41d4-a716-446655440001";
		const game = new Game(
			new GameId(gameId),
			"Test Game",
			new GameStatus("準備中"),
			15,
			3,
			new Date(),
			new Date(),
			creatorId,
		);

		await repository.create(game);

		// When: Getting games
		const result = await useCase.execute({ creatorId });

		// Then: Should include all required DTO fields
		const dto = result.games[0];
		expect(dto.id).toBe(gameId);
		expect(dto.name).toBe("Test Game");
		expect(dto.status).toBe("準備中");
		expect(dto.maxPlayers).toBe(15);
		expect(dto.currentPlayers).toBe(3);
		expect(dto.availableSlots).toBe(12);
	});

	it("should handle multiple games with various statuses", async () => {
		// Given: 5 games with different statuses
		const creatorId = "creator-session-123";
		const games = [
			new Game(
				new GameId("550e8400-e29b-41d4-a716-446655440001"),
				"Game 1",
				new GameStatus("準備中"),
				10,
				0,
				new Date(),
				new Date(),
				creatorId,
			),
			new Game(
				new GameId("550e8400-e29b-41d4-a716-446655440002"),
				"Game 2",
				new GameStatus("出題中"),
				20,
				5,
				new Date(),
				new Date(),
				creatorId,
			),
			new Game(
				new GameId("550e8400-e29b-41d4-a716-446655440003"),
				"Game 3",
				new GameStatus("締切"),
				15,
				15,
				new Date(),
				new Date(),
				creatorId,
			),
			new Game(
				new GameId("550e8400-e29b-41d4-a716-446655440004"),
				"Game 4",
				new GameStatus("準備中"),
				30,
				0,
				new Date(),
				new Date(),
				creatorId,
			),
			new Game(
				new GameId("550e8400-e29b-41d4-a716-446655440005"),
				"Game 5",
				new GameStatus("出題中"),
				25,
				12,
				new Date(),
				new Date(),
				creatorId,
			),
		];

		for (const game of games) {
			await repository.create(game);
		}

		// When: Getting games
		const result = await useCase.execute({ creatorId });

		// Then: Should return all 5 games
		expect(result.games).toHaveLength(5);
	});
});
