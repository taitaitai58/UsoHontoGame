// Test utilities and mock data factories for component testing
import type { Game } from "@/server/domain/entities/Game";
import type { GameDto } from "@/server/application/dto/responses/GameDto";
import type { GameDetail } from "@/components/pages/GameDetailPage/GameDetailPage.types";
import type { PresenterWithLieDto } from "@/server/application/dto/responses/PresenterWithLieDto";

/**
 * Mock Game entity factory
 */
export const mockGame = (overrides: Partial<Game> = {}): Game => {
	const defaultGame: Game = {
		id: "test-game-id",
		name: "Test Game",
		maxPlayers: 10,
		currentPlayers: 0,
		status: "準備中",
		createdAt: new Date("2024-01-01T00:00:00Z"),
		updatedAt: new Date("2024-01-02T00:00:00Z"),
		presenters: [],
		...overrides,
	} as Game;

	return defaultGame;
};

/**
 * Mock GameDto factory
 */
export const mockGameDto = (overrides: Partial<GameDto> = {}): GameDto => ({
	id: "test-game-id",
	name: "Test Game",
	status: "準備中",
	currentPlayers: 5,
	maxPlayers: 10,
	availableSlots: 5,
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-02T00:00:00Z",
	...overrides,
});

/**
 * Mock GameDetail factory for GameDetailPage
 */
export const mockGameDetail = (
	overrides: Partial<GameDetail> = {},
): GameDetail => ({
	id: "test-game-id",
	name: "Test Game",
	status: "準備中",
	maxPlayers: 10,
	currentPlayers: 5,
	availableSlots: 5,
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-02T00:00:00Z",
	...overrides,
});

/**
 * Mock PresenterWithLieDto factory
 */
export const mockPresenterWithLieDto = (
	overrides: Partial<PresenterWithLieDto> = {},
): PresenterWithLieDto => ({
	id: "test-presenter-id",
	nickname: "Test Presenter",
	episodes: [],
	...overrides,
});

/**
 * Mock usePresenterManagementPage hook return value
 */
export const mockUsePresenterManagementPageReturn = (
	overrides: Partial<any> = {},
) => ({
	presenters: [],
	selectedPresenter: undefined,
	isLoading: false,
	error: null,
	handlePresenterAdded: vi.fn(),
	handlePresenterRemoved: vi.fn(),
	handleEpisodeAdded: vi.fn(),
	handlePresenterSelected: vi.fn(),
	...overrides,
});
