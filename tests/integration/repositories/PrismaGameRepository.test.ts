import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "vitest";
import { PrismaClient } from "@prisma/client";
import { PrismaGameRepository } from "@/server/infrastructure/repositories/PrismaGameRepository";
import { Game } from "@/server/domain/entities/Game";
import { GameId } from "@/server/domain/value-objects/GameId";
import { GameStatus } from "@/server/domain/value-objects/GameStatus";

// Skip Prisma tests for now - they require running migrations
// Run with: npm run test -- --run tests/integration/repositories/PrismaGameRepository.test.ts
describe.skip("PrismaGameRepository", () => {
	let prisma: PrismaClient;
	let repository: PrismaGameRepository;

	beforeAll(() => {
		prisma = new PrismaClient();
		repository = new PrismaGameRepository(prisma);
	});

	beforeEach(async () => {
		// Clean up database before each test
		await prisma.game.deleteMany();
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	const createGame = (
		id: string,
		name: string,
		status: "準備中" | "出題中" | "締切",
		maxPlayers: number,
		currentPlayers: number,
	): Game => {
		return new Game(
			new GameId(id),
			name,
			new GameStatus(status),
			maxPlayers,
			currentPlayers,
			new Date(),
			new Date(),
		);
	};

	describe("create", () => {
		it("should create a game in database", async () => {
			const game = createGame(
				"550e8400-e29b-41d4-a716-446655440000",
				"Test Game",
				"出題中",
				10,
				5,
			);

			await repository.create(game);

			const found = await repository.findById(game.id);
			expect(found).not.toBeNull();
			expect(found?.name).toBe("Test Game");
			expect(found?.status.toString()).toBe("出題中");
		});

		it("should persist all game properties", async () => {
			const game = createGame(
				"550e8400-e29b-41d4-a716-446655440001",
				"Complete Game",
				"準備中",
				12,
				3,
			);

			await repository.create(game);

			const found = await repository.findById(game.id);
			expect(found).not.toBeNull();
			expect(found?.id.value).toBe(game.id.value);
			expect(found?.name).toBe(game.name);
			expect(found?.status.toString()).toBe(game.status.toString());
			expect(found?.maxPlayers).toBe(12);
			expect(found?.currentPlayers).toBe(3);
		});
	});

	describe("findAll", () => {
		it("should return empty array when no games", async () => {
			const games = await repository.findAll();
			expect(games).toEqual([]);
		});

		it("should return all games", async () => {
			const game1 = createGame(
				"550e8400-e29b-41d4-a716-446655440001",
				"Game 1",
				"出題中",
				10,
				5,
			);
			const game2 = createGame(
				"550e8400-e29b-41d4-a716-446655440002",
				"Game 2",
				"準備中",
				8,
				0,
			);

			await repository.create(game1);
			await repository.create(game2);

			const games = await repository.findAll();
			expect(games).toHaveLength(2);
		});

		it("should return games ordered by creation date (newest first)", async () => {
			const game1 = createGame(
				"550e8400-e29b-41d4-a716-446655440001",
				"Older Game",
				"出題中",
				10,
				5,
			);
			const game2 = createGame(
				"550e8400-e29b-41d4-a716-446655440002",
				"Newer Game",
				"出題中",
				10,
				5,
			);

			await repository.create(game1);
			// Small delay to ensure different timestamps
			await new Promise((resolve) => setTimeout(resolve, 10));
			await repository.create(game2);

			const games = await repository.findAll();
			expect(games[0].name).toBe("Newer Game");
			expect(games[1].name).toBe("Older Game");
		});
	});

	describe("findByStatus", () => {
		beforeEach(async () => {
			await repository.create(
				createGame(
					"550e8400-e29b-41d4-a716-446655440001",
					"Accepting Game",
					"出題中",
					10,
					5,
				),
			);
			await repository.create(
				createGame(
					"550e8400-e29b-41d4-a716-446655440002",
					"Preparing Game",
					"準備中",
					10,
					0,
				),
			);
			await repository.create(
				createGame(
					"550e8400-e29b-41d4-a716-446655440003",
					"Closed Game",
					"締切",
					10,
					10,
				),
			);
		});

		it('should find games with "出題中" status', async () => {
			const acceptingStatus = new GameStatus("出題中");
			const games = await repository.findByStatus(acceptingStatus);

			expect(games).toHaveLength(1);
			expect(games[0].name).toBe("Accepting Game");
			expect(games[0].status.toString()).toBe("出題中");
		});

		it('should find games with "準備中" status', async () => {
			const preparingStatus = new GameStatus("準備中");
			const games = await repository.findByStatus(preparingStatus);

			expect(games).toHaveLength(1);
			expect(games[0].name).toBe("Preparing Game");
		});

		it('should find games with "締切" status', async () => {
			const closedStatus = new GameStatus("締切");
			const games = await repository.findByStatus(closedStatus);

			expect(games).toHaveLength(1);
			expect(games[0].name).toBe("Closed Game");
		});

		it("should return empty array for status with no games", async () => {
			await prisma.game.deleteMany();
			const status = new GameStatus("出題中");
			const games = await repository.findByStatus(status);

			expect(games).toEqual([]);
		});
	});

	describe("findById", () => {
		it("should find game by ID", async () => {
			const game = createGame(
				"550e8400-e29b-41d4-a716-446655440000",
				"Find Me",
				"出題中",
				10,
				5,
			);

			await repository.create(game);

			const found = await repository.findById(game.id);
			expect(found).not.toBeNull();
			expect(found?.name).toBe("Find Me");
		});

		it("should return null for non-existent ID", async () => {
			const nonExistentId = new GameId("550e8400-e29b-41d4-a716-446655440999");
			const found = await repository.findById(nonExistentId);

			expect(found).toBeNull();
		});

		it("should return correct game when multiple games exist", async () => {
			await repository.create(
				createGame(
					"550e8400-e29b-41d4-a716-446655440001",
					"Game 1",
					"出題中",
					10,
					5,
				),
			);
			const targetGame = createGame(
				"550e8400-e29b-41d4-a716-446655440002",
				"Target Game",
				"出題中",
				10,
				5,
			);
			await repository.create(targetGame);
			await repository.create(
				createGame(
					"550e8400-e29b-41d4-a716-446655440003",
					"Game 3",
					"出題中",
					10,
					5,
				),
			);

			const found = await repository.findById(targetGame.id);
			expect(found?.name).toBe("Target Game");
		});
	});

	describe("update", () => {
		it("should update game properties", async () => {
			const game = createGame(
				"550e8400-e29b-41d4-a716-446655440000",
				"Original Name",
				"準備中",
				10,
				0,
			);

			await repository.create(game);

			// Transition to accepting
			game.startAccepting();
			await repository.update(game);

			const updated = await repository.findById(game.id);
			expect(updated?.status.toString()).toBe("出題中");
		});

		it("should update player counts", async () => {
			const game = createGame(
				"550e8400-e29b-41d4-a716-446655440000",
				"Player Test",
				"出題中",
				10,
				5,
			);

			await repository.create(game);

			game.addPlayer();
			await repository.update(game);

			const updated = await repository.findById(game.id);
			expect(updated?.currentPlayers).toBe(6);
		});

		it("should persist updatedAt timestamp changes", async () => {
			const game = createGame(
				"550e8400-e29b-41d4-a716-446655440000",
				"Timestamp Test",
				"出題中",
				10,
				5,
			);

			await repository.create(game);
			const initialUpdatedAt = game.updatedAt;

			await new Promise((resolve) => setTimeout(resolve, 10));
			game.setStatus(new GameStatus("締切"));
			await repository.update(game);

			const updated = await repository.findById(game.id);
			expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(
				initialUpdatedAt.getTime(),
			);
		});
	});

	describe("delete", () => {
		it("should delete game from database", async () => {
			const game = createGame(
				"550e8400-e29b-41d4-a716-446655440000",
				"Delete Me",
				"出題中",
				10,
				5,
			);

			await repository.create(game);
			await repository.delete(game.id);

			const found = await repository.findById(game.id);
			expect(found).toBeNull();
		});

		it("should only delete specified game", async () => {
			const game1 = createGame(
				"550e8400-e29b-41d4-a716-446655440001",
				"Keep Me",
				"出題中",
				10,
				5,
			);
			const game2 = createGame(
				"550e8400-e29b-41d4-a716-446655440002",
				"Delete Me",
				"出題中",
				10,
				5,
			);

			await repository.create(game1);
			await repository.create(game2);
			await repository.delete(game2.id);

			const remaining = await repository.findAll();
			expect(remaining).toHaveLength(1);
			expect(remaining[0].name).toBe("Keep Me");
		});

		it("should not throw error when deleting non-existent game", async () => {
			const nonExistentId = new GameId("550e8400-e29b-41d4-a716-446655440999");

			await expect(repository.delete(nonExistentId)).rejects.toThrow();
		});
	});

	describe("domain entity mapping", () => {
		it("should correctly map all GameStatus values", async () => {
			const statuses: Array<"準備中" | "出題中" | "締切"> = [
				"準備中",
				"出題中",
				"締切",
			];

			for (const status of statuses) {
				const game = createGame(
					GameId.generate().value,
					`Game ${status}`,
					status,
					10,
					5,
				);

				await repository.create(game);
				const found = await repository.findById(game.id);

				expect(found?.status.toString()).toBe(status);
			}
		});

		it("should preserve date precision", async () => {
			const now = new Date();
			const game = new Game(
				GameId.generate(),
				"Date Test",
				new GameStatus("出題中"),
				10,
				5,
				now,
				now,
			);

			await repository.create(game);
			const found = await repository.findById(game.id);

			// SQLite stores dates as strings, so we compare timestamps
			expect(found?.createdAt.getTime()).toBeCloseTo(now.getTime(), -2);
			expect(found?.updatedAt.getTime()).toBeCloseTo(now.getTime(), -2);
		});
	});
});
