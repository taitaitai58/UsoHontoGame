// E2E Test: Game Creation Flow
// Feature: 002-game-preparation
// Tests the complete game creation flow from /games/create

import { expect, test } from "@playwright/test";

test.describe("Game Creation Flow", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to home page and set nickname (prerequisite)
		await page.goto("/");
		await page.fill('input[name="nickname"]', "TestModerator");
		await page.click('button[type="submit"]');
		await page.waitForURL("/top");
	});

	test("should display game creation form", async ({ page }) => {
		await page.goto("/games/create");

		// Check page title
		await expect(page.locator("h1")).toContainText("新しいゲームを作成");

		// Check form elements
		await expect(page.locator('input[name="playerLimit"]')).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toContainText(
			"ゲームを作成",
		);
		await expect(page.locator('a[href="/top"]')).toContainText(
			"キャンセル",
		);
	});

	test("should create game with valid player limit", async ({ page }) => {
		await page.goto("/games/create");

		// Fill in player limit
		await page.fill('input[name="playerLimit"]', "15");

		// Submit form
		await page.click('button[type="submit"]');

		// Should show success message
		await expect(
			page.locator("text=ゲームを作成しました！"),
		).toBeVisible();

		// Should redirect to TOP page
		await page.waitForURL("/top", { timeout: 3000 });

		// Verify we're on TOP page
		await expect(page).toHaveURL("/top");
	});

	test("should create game with minimum player limit (1)", async ({
		page,
	}) => {
		await page.goto("/games/create");

		await page.fill('input[name="playerLimit"]', "1");
		await page.click('button[type="submit"]');

		await expect(
			page.locator("text=ゲームを作成しました！"),
		).toBeVisible();
		await page.waitForURL("/top", { timeout: 3000 });
	});

	test("should create game with maximum player limit (100)", async ({
		page,
	}) => {
		await page.goto("/games/create");

		await page.fill('input[name="playerLimit"]', "100");
		await page.click('button[type="submit"]');

		await expect(
			page.locator("text=ゲームを作成しました！"),
		).toBeVisible();
		await page.waitForURL("/top", { timeout: 3000 });
	});

	test("should show validation error for player limit below 1", async ({
		page,
	}) => {
		await page.goto("/games/create");

		await page.fill('input[name="playerLimit"]', "0");
		await page.click('button[type="submit"]');

		// Should show validation error
		await expect(
			page.locator("text=プレイヤー数は1以上でなければなりません"),
		).toBeVisible();

		// Should NOT redirect
		await expect(page).toHaveURL("/games/create");
	});

	test("should show validation error for player limit above 100", async ({
		page,
	}) => {
		await page.goto("/games/create");

		await page.fill('input[name="playerLimit"]', "101");
		await page.click('button[type="submit"]');

		// Should show validation error
		await expect(
			page.locator("text=プレイヤー数は100以下でなければなりません"),
		).toBeVisible();

		// Should NOT redirect
		await expect(page).toHaveURL("/games/create");
	});

	test("should show validation error for negative player limit", async ({
		page,
	}) => {
		await page.goto("/games/create");

		await page.fill('input[name="playerLimit"]', "-5");
		await page.click('button[type="submit"]');

		// Should show validation error
		await expect(
			page.locator("text=プレイヤー数は1以上でなければなりません"),
		).toBeVisible();
	});

	test("should disable form during submission", async ({ page }) => {
		await page.goto("/games/create");

		await page.fill('input[name="playerLimit"]', "20");

		// Click submit
		await page.click('button[type="submit"]');

		// Check that button shows "作成中..." and is disabled
		const submitButton = page.locator('button[type="submit"]');
		await expect(submitButton).toContainText("作成中...");
		await expect(submitButton).toBeDisabled();

		// Input should also be disabled
		await expect(page.locator('input[name="playerLimit"]')).toBeDisabled();
	});

	test("should allow canceling back to TOP page", async ({ page }) => {
		await page.goto("/games/create");

		// Click cancel link
		await page.click('a[href="/top"]');

		// Should navigate to TOP page
		await expect(page).toHaveURL("/top");
	});

	test("should show help text about game status", async ({ page }) => {
		await page.goto("/games/create");

		// Check for help text
		await expect(page.locator("text=準備中")).toBeVisible();
		await expect(page.locator("text=プレゼンター")).toBeVisible();
	});

	test("should handle missing session gracefully", async ({ page }) => {
		// Clear cookies to simulate missing session
		await page.context().clearCookies();

		await page.goto("/games/create");

		await page.fill('input[name="playerLimit"]', "10");
		await page.click('button[type="submit"]');

		// Should show session error
		await expect(
			page.locator("text=セッションが見つかりません"),
		).toBeVisible();
	});

	test("should create multiple games independently", async ({ page }) => {
		// Create first game
		await page.goto("/games/create");
		await page.fill('input[name="playerLimit"]', "10");
		await page.click('button[type="submit"]');
		await page.waitForURL("/top", { timeout: 3000 });

		// Create second game
		await page.goto("/games/create");
		await page.fill('input[name="playerLimit"]', "20");
		await page.click('button[type="submit"]');
		await page.waitForURL("/top", { timeout: 3000 });

		// Create third game
		await page.goto("/games/create");
		await page.fill('input[name="playerLimit"]', "30");
		await page.click('button[type="submit"]');
		await page.waitForURL("/top", { timeout: 3000 });

		// All should succeed independently
		await expect(page).toHaveURL("/top");
	});
});
