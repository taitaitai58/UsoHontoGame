// Unit tests for GameListPageError component
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { GameListPageError } from "@/components/pages/GameListPage";

describe("GameListPageError", () => {
	it("should render without crashing", () => {
		render(<GameListPageError errorMessage="Test error" />);
		expect(screen.getByText("Test error")).toBeInTheDocument();
	});

	it("should display error message", () => {
		const errorMessage = "ゲームの読み込みに失敗しました";
		render(<GameListPageError errorMessage={errorMessage} />);
		expect(screen.getByText(errorMessage)).toBeInTheDocument();
	});

	it("should apply error styling", () => {
		const { container } = render(
			<GameListPageError errorMessage="Error" />,
		);
		const errorDiv = container.querySelector(".border-red-200");
		expect(errorDiv).toBeInTheDocument();
		expect(errorDiv).toHaveClass("bg-red-50");
	});

	it("should display custom error messages", () => {
		const customError = "カスタムエラーメッセージ";
		render(<GameListPageError errorMessage={customError} />);
		expect(screen.getByText(customError)).toBeInTheDocument();
	});
});
