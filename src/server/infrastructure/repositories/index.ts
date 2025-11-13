// Repository Factory with Dependency Injection
// Feature: 002-game-preparation
// Provides game repository instances based on environment

import type { IGameRepository } from "@/server/domain/repositories/IGameRepository";
import { InMemoryGameRepository } from "./InMemoryGameRepository";
import { PrismaGameRepository } from "./PrismaGameRepository";
import { PrismaClient } from "../../../generated/prisma/client";

/**
 * Repository configuration
 */
type RepositoryType = "memory" | "prisma";

const REPOSITORY_TYPE: RepositoryType =
	(process.env.REPOSITORY_TYPE as RepositoryType) || "prisma";

/**
 * Singleton Prisma client instance
 */
let prismaClient: PrismaClient | null = null;

/**
 * Gets Prisma client instance (singleton)
 */
function getPrismaClient(): PrismaClient {
	if (!prismaClient) {
		prismaClient = new PrismaClient();
	}
	return prismaClient;
}

/**
 * Creates game repository instance based on configuration
 * @returns IGameRepository implementation
 */
export function createGameRepository(): IGameRepository {
	switch (REPOSITORY_TYPE) {
		case "prisma":
			return new PrismaGameRepository(getPrismaClient());
		case "memory":
		default:
			return InMemoryGameRepository.getInstance();
	}
}

/**
 * Closes database connections (for testing and shutdown)
 */
export async function closeRepositoryConnections(): Promise<void> {
	if (prismaClient) {
		await prismaClient.$disconnect();
		prismaClient = null;
	}
}

// Export repository implementations for testing
export { InMemoryGameRepository } from "./InMemoryGameRepository";
export { PrismaGameRepository } from "./PrismaGameRepository";
