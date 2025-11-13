// E2E Test: Game List Display
// Feature: 002-game-preparation
// Tests the game list page for moderators

import { expect, test } from "@playwright/test";

test.describe("Game List Page", () => {
	test.beforeEach(async ({ page }) => {
		// Set up session (prerequisite)
		await page.goto("/");
		await page.fill('input[name="nickname"]', "TestModerator");
		await page.click('button[type="submit"]');
		await page.waitForURL("/top");
	});

	test("should display game list page", async ({ page }) => {
		// When: Navigate to games list
		await page.goto("/games");

		// Then: Should show page header
		await expect(page.locator("h1")).toContainText("ゲーム管理");
		await expect(page.locator("text=作成したゲームの一覧")).toBeVisible();
	});

	test("should show create game button", async ({ page }) => {
		// When: View game list
		await page.goto("/games");

		// Then: Should have create button
		const createButton = page.locator('a[href="/games/create"]');
		await expect(createButton).toBeVisible();
		await expect(createButton).toContainText("新しいゲームを作成");
	});

	test("should show empty state when no games exist", async ({ page }) => {
		// Given: No games created (fresh session)

		// When: View game list
		await page.goto("/games");

		// Then: Should show empty state
		await expect(page.locator("text=ゲームがありません")).toBeVisible();
		await expect(
			page.locator("text=新しいゲームを作成して始めましょう"),
		).toBeVisible();
	});

	test("should display created games in list", async ({ page }) => {
		// Given: Create a game first
		await page.goto("/games/create");
		await page.fill('input[name="playerLimit"]', "10");
		await page.click('button[type="submit"]');
		await page.waitForURL("/top");

		// When: Navigate to games list
		await page.goto("/games");

		// Then: Should display the game
		const gameCards = page.locator('[class*="grid"]').locator('div[class*="rounded-lg"]');
		await expect(gameCards.first()).toBeVisible();
	});

	test("should display game with status badge", async ({ page }) => {
		// Given: Create a game
		await page.goto("/games/create");
		await page.fill('input[name="playerLimit"]', "15");
		await page.click('button[type="submit"]');
		await page.waitForURL("/top");

		// When: View game list
		await page.goto("/games");

		// Then: Should show status badge (準備中)
		await expect(page.locator("text=準備中")).toBeVisible();
	});

	test("should show player count information", async ({ page }) => {
		// Given: Create a game
		await page.goto("/games/create");
		await page.fill('input[name="playerLimit"]', "20");
		await page.click('button[type="submit"]');
		await page.waitForURL("/top");

		// When: View game list
		await page.goto("/games");

		// Then: Should display player info
		await expect(page.locator("text=参加者:")).toBeVisible();
		await expect(page.locator("text=残り枠:")).toBeVisible();
	});

	test("should display multiple games", async ({ page }) => {
		// Given: Create multiple games
		for (let i = 1; i <= 3; i++) {
			await page.goto("/games/create");
			await page.fill('input[name="playerLimit"]', `${i * 10}`);
			await page.click('button[type="submit"]');
			await page.waitForURL("/top");
		}

		// When: View game list
		await page.goto("/games");

		// Then: Should show count
		await expect(page.locator("text=3件")).toBeVisible();
	});

	test("should redirect to home if no session", async ({ page }) => {
		// Given: Clear session
		await page.context().clearCookies();

		// When: Try to access game list
		await page.goto("/games");

		// Then: Should redirect to home
		await page.waitForURL("/");
	});

	test("should handle empty game list gracefully", async ({ page }) => {
		// Given: No games exist

		// When: View game list
		await page.goto("/games");

		// Then: Should not show error, just empty state
		await expect(page.locator("text=ゲームがありません")).toBeVisible();
		await expect(page.locator('[class*="border-red"]')).not.toBeVisible();
	});

	test("should show game list header with count", async ({ page }) => {
		// Given: Create one game
		await page.goto("/games/create");
		await page.fill('input[name="playerLimit"]', "10");
		await page.click('button[type="submit"]');
		await page.waitForURL("/top");

		// When: View game list
		await page.goto("/games");

		// Then: Should show header with count
		await expect(page.locator("h2")).toContainText("作成したゲーム");
		await expect(page.locator("text=1件")).toBeVisible();
	});
});
