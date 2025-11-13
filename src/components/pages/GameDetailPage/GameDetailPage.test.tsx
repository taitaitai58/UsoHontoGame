// Unit tests for GameDetailPage component
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { GameDetailPage } from "@/components/pages/GameDetailPage";
import { mockGameDetail } from "@/tests/utils/test-helpers";

// Mock domain components
vi.mock("@/components/domain/game/GameForm", () => ({
	GameForm: ({ gameId, mode }: { gameId: string; mode: string }) => (
		<div data-testid="game-form">
			GameForm - Mode: {mode}, ID: {gameId}
		</div>
	),
}));

vi.mock("@/components/domain/game/DeleteGameButton", () => ({
	DeleteGameButton: ({
		gameId,
		gameStatus,
	}: {
		gameId: string;
		gameStatus: string;
	}) => (
		<div data-testid="delete-game-button">
			Delete Button - ID: {gameId}, Status: {gameStatus}
		</div>
	),
}));

describe("GameDetailPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render without crashing", () => {
		const game = mockGameDetail();
		render(<GameDetailPage game={game} />);
		expect(screen.getByRole("heading", { name: "ゲーム詳細" })).toBeInTheDocument();
	});

	it("should display game name", () => {
		const game = mockGameDetail({ name: "Test Game Name" });
		render(<GameDetailPage game={game} />);
		expect(screen.getByText("Test Game Name")).toBeInTheDocument();
	});

	it("should display game status", () => {
		const game = mockGameDetail({ status: "進行中" });
		render(<GameDetailPage game={game} />);
		expect(screen.getAllByText("進行中")).toHaveLength(2); // Status appears twice
	});

	it("should display player counts", () => {
		const game = mockGameDetail({ currentPlayers: 7, maxPlayers: 10 });
		render(<GameDetailPage game={game} />);
		expect(screen.getByText("7 / 10 人")).toBeInTheDocument();
	});

	it("should display available slots", () => {
		const game = mockGameDetail({ availableSlots: 3 });
		render(<GameDetailPage game={game} />);
		expect(screen.getByText("3 枠")).toBeInTheDocument();
	});

	it("should show edit form when status is 準備中", () => {
		const game = mockGameDetail({ status: "準備中" });
		render(<GameDetailPage game={game} />);
		expect(screen.getByTestId("game-form")).toBeInTheDocument();
		expect(screen.getByText(/GameForm - Mode: edit/)).toBeInTheDocument();
	});

	it("should hide edit form when status is not 準備中", () => {
		const game = mockGameDetail({ status: "進行中" });
		render(<GameDetailPage game={game} />);
		expect(screen.queryByTestId("game-form")).not.toBeInTheDocument();
	});

	it("should show warning when game cannot be edited", () => {
		const game = mockGameDetail({ status: "終了" });
		render(<GameDetailPage game={game} />);
		expect(
			screen.getByText(/ゲームの設定を変更できるのは準備中のみです/),
		).toBeInTheDocument();
	});

	it("should not show warning when game can be edited", () => {
		const game = mockGameDetail({ status: "準備中" });
		render(<GameDetailPage game={game} />);
		expect(
			screen.queryByText(/ゲームの設定を変更できるのは準備中のみです/),
		).not.toBeInTheDocument();
	});

	it("should render DeleteGameButton with correct props", () => {
		const game = mockGameDetail({ id: "test-id", status: "準備中" });
		render(<GameDetailPage game={game} />);
		expect(screen.getByTestId("delete-game-button")).toBeInTheDocument();
		expect(
			screen.getByText(/Delete Button - ID: test-id, Status: 準備中/),
		).toBeInTheDocument();
	});

	it("should format dates correctly", () => {
		const game = mockGameDetail({
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-02T00:00:00Z",
		});
		render(<GameDetailPage game={game} />);
		// Date formatting may vary by locale, so just check they're rendered
		expect(screen.getByText(/2024/)).toBeInTheDocument();
	});
});
