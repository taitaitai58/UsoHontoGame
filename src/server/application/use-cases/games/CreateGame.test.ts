import { beforeEach, describe, expect, it } from "vitest";
import { CreateGame } from "@/server/application/use-cases/games/CreateGame";
import { InMemoryGameRepository } from "@/server/infrastructure/repositories/InMemoryGameRepository";
import type { IGameRepository } from "@/server/domain/repositories/IGameRepository";
import { ValidationError } from "@/server/domain/errors/ValidationError";

describe("CreateGame", () => {
	let repository: IGameRepository;
	let useCase: CreateGame;

	beforeEach(() => {
		repository = InMemoryGameRepository.getInstance();
		useCase = new CreateGame(repository);
	});

	describe("execute", () => {
		it("should create a game with valid player limit", async () => {
			const input = {
				creatorId: "session-123",
				playerLimit: 10,
			};

			const result = await useCase.execute(input);

			expect(result.id).toBeDefined();
			expect(result.name).toBeNull(); // Name is null when not provided
			expect(result.status).toBe("準備中");
			expect(result.maxPlayers).toBe(10);
			expect(result.currentPlayers).toBe(0);
			expect(result.createdAt).toBeInstanceOf(Date);
		});

		it("should persist game to repository", async () => {
			const input = {
				creatorId: "session-123",
				playerLimit: 8,
			};

			const result = await useCase.execute(input);

			// Verify game was persisted
			const games = await repository.findAll();
			const createdGame = games.find((g) => g.id.value === result.id);

			expect(createdGame).toBeDefined();
			expect(createdGame?.maxPlayers).toBe(8);
		});

		it("should create game with player limit of 1 (minimum)", async () => {
			const input = {
				creatorId: "session-123",
				playerLimit: 1,
			};

			const result = await useCase.execute(input);

			expect(result.maxPlayers).toBe(1);
		});

		it("should create game with player limit of 100 (maximum)", async () => {
			const input = {
				creatorId: "session-123",
				playerLimit: 100,
			};

			const result = await useCase.execute(input);

			expect(result.maxPlayers).toBe(100);
		});

		it("should throw ValidationError for player limit below 1", async () => {
			const input = {
				creatorId: "session-123",
				playerLimit: 0,
			};

			await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
			await expect(useCase.execute(input)).rejects.toThrow(
				"Player limit must be between 1 and 100",
			);
		});

		it("should throw ValidationError for negative player limit", async () => {
			const input = {
				creatorId: "session-123",
				playerLimit: -5,
			};

			await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
		});

		it("should throw ValidationError for player limit above 100", async () => {
			const input = {
				creatorId: "session-123",
				playerLimit: 101,
			};

			await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
			await expect(useCase.execute(input)).rejects.toThrow(
				"Player limit must be between 1 and 100",
			);
		});

		it("should generate unique game IDs", async () => {
			const input = {
				creatorId: "session-123",
				playerLimit: 10,
			};

			const result1 = await useCase.execute(input);
			const result2 = await useCase.execute(input);

			expect(result1.id).not.toBe(result2.id);
		});

		it("should create multiple games independently", async () => {
			const games = await Promise.all([
				useCase.execute({ creatorId: "session-1", playerLimit: 10 }),
				useCase.execute({ creatorId: "session-2", playerLimit: 20 }),
				useCase.execute({ creatorId: "session-3", playerLimit: 30 }),
			]);

			expect(games).toHaveLength(3);
			expect(new Set(games.map((g) => g.id)).size).toBe(3); // All unique IDs
			expect(games[0].maxPlayers).toBe(10);
			expect(games[1].maxPlayers).toBe(20);
			expect(games[2].maxPlayers).toBe(30);
		});

		it("should set current players to 0 for new games", async () => {
			const input = {
				creatorId: "session-123",
				playerLimit: 50,
			};

			const result = await useCase.execute(input);

			expect(result.currentPlayers).toBe(0);
		});

	it("should create game with custom name when provided", async () => {
		const input = {
			creatorId: "session-123",
			name: "My Custom Game",
			playerLimit: 10,
		};

		const result = await useCase.execute(input);

		// Name should be the provided custom name
		expect(result.name).toBe("My Custom Game");
		expect(result.id).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
		);
	});

		it("should always create games in 準備中 status", async () => {
			const inputs = [
				{ creatorId: "session-1", playerLimit: 1 },
				{ creatorId: "session-2", playerLimit: 50 },
				{ creatorId: "session-3", playerLimit: 100 },
			];

			for (const input of inputs) {
				const result = await useCase.execute(input);
				expect(result.status).toBe("準備中");
			}
		});
	});
});
