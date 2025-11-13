// Unit tests for GameListPage component
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GameListPage } from "@/components/pages/GameListPage";
import { mockGameDto } from "@/tests/utils/test-helpers";
import type { GameDto } from "@/server/application/dto/responses/GameDto";

// Mock GameListClient component
vi.mock("@/components/domain/game/GameListClient", () => ({
	GameListClient: ({
		games,
		managementView,
	}: {
		games: GameDto[];
		managementView: boolean;
	}) => (
		<div data-testid="game-list-client">
			Games: {games.length}, Management: {managementView.toString()}
		</div>
	),
}));

describe("GameListPage", () => {
	const mockGames = [
		mockGameDto({ id: "game-1", name: "Game 1" }),
		mockGameDto({ id: "game-2", name: "Game 2" }),
	];

	it("should render without crashing", () => {
		render(<GameListPage games={mockGames} />);
		expect(screen.getByRole("heading", { name: "ゲーム管理" })).toBeInTheDocument();
	});

	it("should display page title", () => {
		render(<GameListPage games={mockGames} />);
		expect(screen.getByRole("heading", { name: "ゲーム管理" })).toBeInTheDocument();
	});

	it("should display page description", () => {
		render(<GameListPage games={mockGames} />);
		expect(
			screen.getByText("作成したゲームの一覧を確認・管理できます"),
		).toBeInTheDocument();
	});

	it("should render create button with correct link", () => {
		render(<GameListPage games={mockGames} />);
		const createButton = screen.getByRole("link", {
			name: /新しいゲームを作成/,
		});
		expect(createButton).toBeInTheDocument();
		expect(createButton).toHaveAttribute("href", "/games/create");
	});

	it("should pass games to GameListClient", () => {
		render(<GameListPage games={mockGames} />);
		expect(screen.getByTestId("game-list-client")).toBeInTheDocument();
		expect(screen.getByText("Games: 2, Management: true")).toBeInTheDocument();
	});

	it("should handle empty games array", () => {
		render(<GameListPage games={[]} />);
		expect(screen.getByText("Games: 0, Management: true")).toBeInTheDocument();
	});

	it("should always pass managementView=true to GameListClient", () => {
		render(<GameListPage games={mockGames} />);
		expect(screen.getByText(/Management: true/)).toBeInTheDocument();
	});
});
