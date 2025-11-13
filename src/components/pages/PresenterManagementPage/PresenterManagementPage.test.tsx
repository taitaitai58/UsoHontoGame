// Unit tests for PresenterManagementPage component
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PresenterManagementPage } from "@/components/pages/PresenterManagementPage";
import {
	mockPresenterWithLieDto,
	mockUsePresenterManagementPageReturn,
} from "@/tests/utils/test-helpers";

// Mock the custom hook
const mockUsePresenterManagementPage = vi.fn();
vi.mock(
	"@/components/pages/PresenterManagementPage/hooks/usePresenterManagementPage",
	() => ({
		usePresenterManagementPage: () => mockUsePresenterManagementPage(),
	}),
);

// Mock domain components
vi.mock("@/components/domain/game/PresenterList", () => ({
	PresenterList: () => <div data-testid="presenter-list">Presenter List</div>,
}));

vi.mock("@/components/domain/game/PresenterForm", () => ({
	PresenterForm: () => <div data-testid="presenter-form">Presenter Form</div>,
}));

vi.mock("@/components/domain/game/EpisodeForm", () => ({
	EpisodeForm: () => <div data-testid="episode-form">Episode Form</div>,
}));

describe("PresenterManagementPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render without crashing", () => {
		mockUsePresenterManagementPage.mockReturnValue(
			mockUsePresenterManagementPageReturn(),
		);
		render(<PresenterManagementPage gameId="test-game-id" />);
		expect(
			screen.getByRole("heading", { name: "プレゼンター管理" }),
		).toBeInTheDocument();
	});

	it("should show loading state when isLoading is true", () => {
		mockUsePresenterManagementPage.mockReturnValue(
			mockUsePresenterManagementPageReturn({ isLoading: true }),
		);
		render(<PresenterManagementPage gameId="test-game-id" />);
		expect(screen.getByText("読み込み中...")).toBeInTheDocument();
	});

	it("should not show main content when loading", () => {
		mockUsePresenterManagementPage.mockReturnValue(
			mockUsePresenterManagementPageReturn({ isLoading: true }),
		);
		render(<PresenterManagementPage gameId="test-game-id" />);
		expect(
			screen.queryByRole("heading", { name: "プレゼンター管理" }),
		).not.toBeInTheDocument();
	});

	it("should display error message when error is present", () => {
		mockUsePresenterManagementPage.mockReturnValue(
			mockUsePresenterManagementPageReturn({ error: "Test error message" }),
		);
		render(<PresenterManagementPage gameId="test-game-id" />);
		expect(screen.getByText("Test error message")).toBeInTheDocument();
		expect(screen.getByRole("alert")).toBeInTheDocument();
	});

	it("should render PresenterForm", () => {
		mockUsePresenterManagementPage.mockReturnValue(
			mockUsePresenterManagementPageReturn(),
		);
		render(<PresenterManagementPage gameId="test-game-id" />);
		expect(screen.getByTestId("presenter-form")).toBeInTheDocument();
	});

	it("should render PresenterList", () => {
		mockUsePresenterManagementPage.mockReturnValue(
			mockUsePresenterManagementPageReturn(),
		);
		render(<PresenterManagementPage gameId="test-game-id" />);
		expect(screen.getByTestId("presenter-list")).toBeInTheDocument();
	});

	it("should show EpisodeForm when presenter is selected", () => {
		const selectedPresenter = mockPresenterWithLieDto({
			id: "presenter-1",
			nickname: "Test Presenter",
		});
		mockUsePresenterManagementPage.mockReturnValue(
			mockUsePresenterManagementPageReturn({
				selectedPresenter,
			}),
		);
		render(<PresenterManagementPage gameId="test-game-id" />);
		expect(screen.getByTestId("episode-form")).toBeInTheDocument();
	});

	it("should show placeholder when no presenter is selected", () => {
		mockUsePresenterManagementPage.mockReturnValue(
			mockUsePresenterManagementPageReturn({
				selectedPresenter: undefined,
			}),
		);
		render(<PresenterManagementPage gameId="test-game-id" />);
		expect(
			screen.getByText("プレゼンターを選択してエピソードを追加してください"),
		).toBeInTheDocument();
		expect(screen.queryByTestId("episode-form")).not.toBeInTheDocument();
	});

	it("should display summary section with presenter count", () => {
		const presenters = [
			mockPresenterWithLieDto({ id: "1" }),
			mockPresenterWithLieDto({ id: "2" }),
		];
		mockUsePresenterManagementPage.mockReturnValue(
			mockUsePresenterManagementPageReturn({ presenters }),
		);
		render(<PresenterManagementPage gameId="test-game-id" />);
		expect(screen.getByText("登録状況")).toBeInTheDocument();
		expect(screen.getByText("2")).toBeInTheDocument(); // Presenter count
		expect(screen.getByText("/10")).toBeInTheDocument();
	});

	it("should calculate completed presenters correctly", () => {
		const completedPresenter = mockPresenterWithLieDto({
			id: "1",
			episodes: [
				{ id: "e1", text: "Episode 1", isLie: false, order: 0 },
				{ id: "e2", text: "Episode 2", isLie: false, order: 1 },
				{ id: "e3", text: "Episode 3", isLie: true, order: 2 },
			],
		});
		const incompletePresenter = mockPresenterWithLieDto({
			id: "2",
			episodes: [{ id: "e1", text: "Episode 1", isLie: false, order: 0 }],
		});
		mockUsePresenterManagementPage.mockReturnValue(
			mockUsePresenterManagementPageReturn({
				presenters: [completedPresenter, incompletePresenter],
			}),
		);
		render(<PresenterManagementPage gameId="test-game-id" />);
		// Complete: 1, Incomplete: 1
		const statElements = screen.getAllByText("1");
		expect(statElements.length).toBeGreaterThan(0);
	});

	it("should display page description", () => {
		mockUsePresenterManagementPage.mockReturnValue(
			mockUsePresenterManagementPageReturn(),
		);
		render(<PresenterManagementPage gameId="test-game-id" />);
		expect(
			screen.getByText(
				/プレゼンターを追加し、それぞれに3つのエピソード/,
			),
		).toBeInTheDocument();
	});
});
