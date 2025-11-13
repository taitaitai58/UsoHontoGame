// Unit tests for GameDetailPageError component
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { GameDetailPageError } from "@/components/pages/GameDetailPage";

describe("GameDetailPageError", () => {
	it("should render without crashing", () => {
		render(<GameDetailPageError errorMessage="Test error" />);
		expect(screen.getByText("Test error")).toBeInTheDocument();
	});

	it("should display error heading", () => {
		render(<GameDetailPageError errorMessage="Error" />);
		expect(
			screen.getByRole("heading", { name: "エラーが発生しました" }),
		).toBeInTheDocument();
	});

	it("should display error message", () => {
		const errorMessage = "ゲームの読み込みに失敗しました";
		render(<GameDetailPageError errorMessage={errorMessage} />);
		expect(screen.getByText(errorMessage)).toBeInTheDocument();
	});

	it("should render link to game list", () => {
		render(<GameDetailPageError errorMessage="Error" />);
		const link = screen.getByRole("link", { name: "ゲーム一覧に戻る" });
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute("href", "/games");
	});

	it("should apply error styling", () => {
		const { container } = render(
			<GameDetailPageError errorMessage="Error" />,
		);
		const errorDiv = container.querySelector(".border-red-200");
		expect(errorDiv).toBeInTheDocument();
		expect(errorDiv).toHaveClass("bg-red-50");
	});

	it("should display custom error messages", () => {
		const customError = "カスタムエラーメッセージ";
		render(<GameDetailPageError errorMessage={customError} />);
		expect(screen.getByText(customError)).toBeInTheDocument();
	});
});
