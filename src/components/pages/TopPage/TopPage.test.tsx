// Unit tests for TopPage component
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopPage } from "@/components/pages/TopPage";
import { mockGame } from "@/tests/utils/test-helpers";
import type { Game } from "@/server/domain/entities/Game";

// Mock GameList component
vi.mock("@/components/domain/game/GameList", () => ({
	GameList: ({ games }: { games: Game[] }) => (
		<div data-testid="game-list">
			Game Count: {games.length}
		</div>
	),
}));

describe("TopPage", () => {
	const mockGames = [
		mockGame({ id: "game-1", name: "Game 1" }),
		mockGame({ id: "game-2", name: "Game 2" }),
	];

	it("should render without crashing", () => {
		render(<TopPage nickname="田中太郎" games={mockGames} />);
		expect(screen.getByText(/ようこそ/)).toBeInTheDocument();
	});

	it("should display welcome message with nickname", () => {
		render(<TopPage nickname="田中太郎" games={mockGames} />);
		expect(screen.getByText(/ようこそ、田中太郎さん!/)).toBeInTheDocument();
	});

	it("should pass games array to GameList component", () => {
		render(<TopPage nickname="山田花子" games={mockGames} />);
		expect(screen.getByTestId("game-list")).toBeInTheDocument();
		expect(screen.getByText("Game Count: 2")).toBeInTheDocument();
	});

	it("should handle empty games array", () => {
		render(<TopPage nickname="佐藤次郎" games={[]} />);
		expect(screen.getByTestId("game-list")).toBeInTheDocument();
		expect(screen.getByText("Game Count: 0")).toBeInTheDocument();
	});

	it("should apply correct layout classes", () => {
		const { container } = render(<TopPage nickname="田中" games={[]} />);
		const outerDiv = container.firstChild as HTMLElement;
		expect(outerDiv).toHaveClass("min-h-screen", "bg-gray-50", "p-8");
	});

	it("should contain heading element", () => {
		render(<TopPage nickname="田中太郎" games={mockGames} />);
		const heading = screen.getByRole("heading", { level: 1 });
		expect(heading).toBeInTheDocument();
		expect(heading).toHaveClass("text-3xl", "font-bold", "text-gray-900");
	});
});
