// Unit tests for NotFoundPage component
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NotFoundPage } from "@/components/pages/NotFoundPage";

// Mock next/link
vi.mock("next/link", () => ({
	default: ({ children, href }: { children: React.ReactNode; href: string }) => (
		<a href={href}>{children}</a>
	),
}));

describe("NotFoundPage", () => {
	it("should render without crashing", () => {
		render(<NotFoundPage />);
		expect(screen.getByText("404")).toBeInTheDocument();
	});

	it("should display 404 heading", () => {
		render(<NotFoundPage />);
		const heading = screen.getByRole("heading", { name: "404" });
		expect(heading).toBeInTheDocument();
		expect(heading).toHaveClass("text-6xl", "font-bold", "text-gray-900");
	});

	it("should display Japanese error message", () => {
		render(<NotFoundPage />);
		expect(
			screen.getByRole("heading", { name: "ページが見つかりません" }),
		).toBeInTheDocument();
	});

	it("should display description text", () => {
		render(<NotFoundPage />);
		expect(
			screen.getByText(
				/お探しのページは存在しないか、移動または削除された可能性があります/,
			),
		).toBeInTheDocument();
	});

	it("should render link to join page", () => {
		render(<NotFoundPage />);
		const link = screen.getByRole("link", { name: "ゲーム参加ページへ" });
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute("href", "/join");
	});

	it("should apply correct styling classes to container", () => {
		const { container } = render(<NotFoundPage />);
		const mainDiv = container.firstChild as HTMLElement;
		expect(mainDiv).toHaveClass(
			"min-h-screen",
			"flex",
			"items-center",
			"justify-center",
		);
	});
});
