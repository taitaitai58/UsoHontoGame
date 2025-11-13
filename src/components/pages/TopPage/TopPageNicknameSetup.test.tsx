// Unit tests for TopPageNicknameSetup component
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopPageNicknameSetup } from "@/components/pages/TopPage";

// Mock NicknameInput component
vi.mock("@/components/domain/session/NicknameInput", () => ({
	NicknameInput: () => (
		<div data-testid="nickname-input">Mocked NicknameInput</div>
	),
}));

describe("TopPageNicknameSetup", () => {
	it("should render without crashing", () => {
		render(<TopPageNicknameSetup />);
		expect(screen.getByTestId("nickname-input")).toBeInTheDocument();
	});

	it("should render NicknameInput component", () => {
		render(<TopPageNicknameSetup />);
		expect(screen.getByTestId("nickname-input")).toBeInTheDocument();
		expect(screen.getByText("Mocked NicknameInput")).toBeInTheDocument();
	});

	it("should center content on screen", () => {
		const { container } = render(<TopPageNicknameSetup />);
		const mainDiv = container.firstChild as HTMLElement;
		expect(mainDiv).toHaveClass(
			"flex",
			"min-h-screen",
			"items-center",
			"justify-center",
		);
	});

	it("should apply correct background color", () => {
		const { container } = render(<TopPageNicknameSetup />);
		const mainDiv = container.firstChild as HTMLElement;
		expect(mainDiv).toHaveClass("bg-gray-50");
	});
});
