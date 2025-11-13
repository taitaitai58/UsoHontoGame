// Unit tests for GameCreatePage component
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GameCreatePage } from "@/components/pages/GameCreatePage";

// Mock GameForm component
vi.mock("@/components/domain/game/GameForm", () => ({
	GameForm: () => <div data-testid="game-form">Mocked GameForm</div>,
}));

describe("GameCreatePage", () => {
	it("should render without crashing", () => {
		render(<GameCreatePage />);
		expect(screen.getByTestId("game-form")).toBeInTheDocument();
	});

	it("should render GameForm component", () => {
		render(<GameCreatePage />);
		expect(screen.getByTestId("game-form")).toBeInTheDocument();
		expect(screen.getByText("Mocked GameForm")).toBeInTheDocument();
	});

	it("should use main semantic element", () => {
		const { container } = render(<GameCreatePage />);
		const mainElement = container.querySelector("main");
		expect(mainElement).toBeInTheDocument();
	});

	it("should apply correct styling classes", () => {
		const { container } = render(<GameCreatePage />);
		const mainElement = container.querySelector("main");
		expect(mainElement).toHaveClass("min-h-screen", "bg-gray-50", "py-8");
	});
});
