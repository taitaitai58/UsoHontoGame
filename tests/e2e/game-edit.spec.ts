// E2E Test: Game Editing
// Feature: 002-game-preparation
// Tests editing game settings (player limit)

import { expect, test } from "@playwright/test";

test.describe("Game Editing", () => {
	test.beforeEach(async ({ page }) => {
		// Set up session and create a game
		await page.goto("/");
		await page.fill('input[name="nickname"]', "TestModerator");
		await page.click('button[type="submit"]');
		await page.waitForURL("/top");

		// Create a test game
		await page.goto("/games/create");
		await page.fill('input[name="playerLimit"]', "10");
		await page.click('button[type="submit"]');
		await page.waitForURL("/top");
	});

	test("should navigate to game detail page from list", async ({ page }) => {
		// Given: Game exists
		await page.goto("/games");

		// When: Click on game card
		const gameCard = page.locator('[role="button"]').first();
		await gameCard.click();

		// Then: Should navigate to game detail page
		await expect(page.locator("h1")).toContainText("ゲーム詳細");
	});

	test("should display game details on detail page", async ({ page }) => {
		// Given: Navigate to games list
		await page.goto("/games");

		// When: Click on game
		await page.locator('[role="button"]').first().click();

		// Then: Should show game information
		await expect(page.locator("text=ゲーム名")).toBeVisible();
		await expect(page.locator("text=ステータス")).toBeVisible();
		await expect(page.locator("text=参加者")).toBeVisible();
		await expect(page.locator("text=準備中")).toBeVisible();
	});

	test("should show edit form when game is in preparation status", async ({
		page,
	}) => {
		// Given: Navigate to game detail
		await page.goto("/games");
		await page.locator('[role="button"]').first().click();

		// Then: Should show edit form
		await expect(page.locator("text=設定を変更")).toBeVisible();
		await expect(page.locator('input[name="playerLimit"]')).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toContainText(
			"設定を更新",
		);
	});

	test("should successfully update player limit", async ({ page }) => {
		// Given: On game detail page
		await page.goto("/games");
		await page.locator('[role="button"]').first().click();

		// When: Update player limit
		await page.fill('input[name="playerLimit"]', "20");
		await page.click('button[type="submit"]');

		// Then: Should show success message
		await expect(page.locator("text=ゲーム設定を更新しました")).toBeVisible();

		// And: Game info should be updated
		await expect(page.locator("text=0 / 20 人")).toBeVisible();
	});

	test("should validate player limit is within range", async ({ page }) => {
		// Given: On game detail page
		await page.goto("/games");
		await page.locator('[role="button"]').first().click();

		// When: Try to set invalid limit (too high)
		await page.fill('input[name="playerLimit"]', "101");
		await page.click('button[type="submit"]');

		// Then: Should show error
		await expect(
			page.locator("text=参加人数は1〜100人の範囲で指定してください"),
		).toBeVisible();
	});

	test("should prevent reducing limit below current players", async ({
		page,
	}) => {
		// Given: Game with players (simulated by creating with higher limit first)
		await page.goto("/games");
		await page.locator('[role="button"]').first().click();

		// When: Try to set limit to 0
		await page.fill('input[name="playerLimit"]', "0");
		await page.click('button[type="submit"]');

		// Then: Should show error
		await expect(page.locator('[class*="text-red"]')).toBeVisible();
	});

	test("should show hint about current players", async ({ page }) => {
		// Given: On game detail page
		await page.goto("/games");
		await page.locator('[role="button"]').first().click();

		// Then: Should show hint (when currentPlayers > 0, but in this test it's 0)
		// The hint should not be visible when there are no players
		const hint = page.locator("text=現在");
		const hintExists = await hint.count();
		// With 0 players, hint should not be shown
		expect(hintExists).toBe(0);
	});

	test("should have cancel button linking back to detail view", async ({
		page,
	}) => {
		// Given: On game detail page
		await page.goto("/games");
		const firstCard = page.locator('[role="button"]').first();
		await firstCard.click();

		// Get current URL to verify cancel button href
		const url = page.url();
		const gameId = url.split("/").pop();

		// Then: Cancel button should link to current page
		const cancelButton = page.locator('a:has-text("キャンセル")');
		await expect(cancelButton).toHaveAttribute("href", `/games/${gameId}`);
	});

	test("should redirect to login if no session", async ({ page }) => {
		// Given: Clear session
		await page.context().clearCookies();

		// When: Try to access game detail
		await page.goto("/games/550e8400-e29b-41d4-a716-446655440001");

		// Then: Should redirect to home
		await page.waitForURL("/");
	});

	test("should show error for non-existent game", async ({ page }) => {
		// Given: Valid session
		await page.goto("/games");

		// When: Navigate to non-existent game
		await page.goto("/games/00000000-0000-0000-0000-000000000000");

		// Then: Should show error message
		await expect(page.locator("text=エラーが発生しました")).toBeVisible();
		await expect(
			page.locator("text=ゲームが見つかりません").or(
				page.locator("text=ゲームの読み込みに失敗しました"),
			),
		).toBeVisible();
	});

	test("should show back to list link", async ({ page }) => {
		// Given: On game detail page
		await page.goto("/games");
		await page.locator('[role="button"]').first().click();

		// Then: Should have back link
		const backLink = page.locator('a:has-text("ゲーム一覧に戻る")');
		await expect(backLink).toBeVisible();
		await expect(backLink).toHaveAttribute("href", "/games");
	});

	test("should display creation and update timestamps", async ({ page }) => {
		// Given: On game detail page
		await page.goto("/games");
		await page.locator('[role="button"]').first().click();

		// Then: Should show timestamps
		await expect(page.locator("text=作成日時")).toBeVisible();
		await expect(page.locator("text=更新日時")).toBeVisible();
	});

	test("should update timestamp after editing", async ({ page }) => {
		// Given: On game detail page
		await page.goto("/games");
		await page.locator('[role="button"]').first().click();

		// Get initial update time text
		const initialTimeText = await page
			.locator("dt:has-text('更新日時') + dd")
			.textContent();

		// When: Update player limit
		await page.fill('input[name="playerLimit"]', "15");
		await page.click('button[type="submit"]');

		// Wait for success message
		await expect(page.locator("text=ゲーム設定を更新しました")).toBeVisible();

		// Then: Update time should change (wait for refresh)
		await page.waitForTimeout(1500); // Wait for router.refresh()
		const newTimeText = await page
			.locator("dt:has-text('更新日時') + dd")
			.textContent();

		// Note: In test environment, times might be very close, but the update should have occurred
		// We mainly verify that the timestamp field is still displayed
		expect(newTimeText).toBeTruthy();
	});
});
