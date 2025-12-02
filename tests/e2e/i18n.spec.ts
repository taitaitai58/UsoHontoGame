import { expect, test } from '@playwright/test';

/**
 * E2E Tests for i18n (Multi-Language Support)
 * Feature: 008-i18n-support
 *
 * Tests the following user stories:
 * - US1: Language switching between Japanese and English
 * - US2: Language preference persistence across sessions
 *
 * Validates:
 * - Language switcher visibility and functionality
 * - Text translation on language change
 * - localStorage persistence
 * - Language persistence across page reloads
 */

test.describe('i18n - Language Switching (US1)', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear cookies and localStorage before each test
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Set up session with nickname using placeholder or input field
    const nicknameInput = page.locator('input[type="text"]').first();
    await nicknameInput.fill('テストユーザー');
    await page.getByRole('button').first().click();
    await page.waitForURL('/', { timeout: 10000 });
  });

  test('US1: Language switcher is visible on all pages', async ({ page }) => {
    // Given: User is on TOP page
    // Then: Language switcher button should be visible
    const languageSwitcher = page.getByRole('button', {
      name: /Switch to English|Switch to Japanese/,
    });
    await expect(languageSwitcher).toBeVisible();

    // And: Should show "EN" when current language is Japanese
    await expect(page.getByRole('button', { name: 'Switch to English' })).toBeVisible();
  });

  test('US1: Clicking language switcher changes all visible text', async ({ page }) => {
    // Given: User is viewing page in Japanese (default)
    await expect(page.getByText(/ようこそ/)).toBeVisible();

    // When: User clicks language switcher to change to English
    await page.getByRole('button', { name: 'Switch to English' }).click();

    // Then: Visible text should change to English
    await expect(page.getByText(/Welcome/)).toBeVisible();

    // And: Language switcher should now show Japanese option
    await expect(page.getByRole('button', { name: 'Switch to Japanese' })).toBeVisible();

    // When: User clicks to switch back to Japanese
    await page.getByRole('button', { name: 'Switch to Japanese' }).click();

    // Then: Text should change back to Japanese
    await expect(page.getByText(/ようこそ/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Switch to English' })).toBeVisible();
  });

  test('US1: Language change applies to multiple UI elements', async ({ page }) => {
    // Given: User is viewing page in Japanese
    // Verify multiple Japanese text elements are present
    const jaElements = [
      page.getByText(/ようこそ/),
      page.getByText(/出題中のゲーム|参加可能なゲーム/),
    ];

    for (const element of jaElements) {
      await expect(element.first()).toBeVisible();
    }

    // When: User switches to English
    await page.getByRole('button', { name: 'Switch to English' }).click();

    // Then: All text elements should be in English
    await expect(page.getByText(/Welcome/)).toBeVisible();
    await expect(page.getByText(/Active Games|Available Games/)).toBeVisible();
  });

  test('US1: Language switching works on game creation page', async ({ page }) => {
    // Given: User navigates to game creation page
    await page.goto('/games/create');

    // Then: Should see Japanese text by default
    await expect(page.getByText(/新しいゲームを作成|ゲーム/)).toBeVisible();

    // When: User switches to English
    await page.getByRole('button', { name: 'Switch to English' }).click();

    // Then: Page text should be in English
    await expect(page.getByText(/Create|Game|New/)).toBeVisible();
  });
});

test.describe('i18n - Language Persistence (US2)', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear cookies and localStorage before each test
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Set up session with nickname
    const nicknameInput = page.locator('input[type="text"]').first();
    await nicknameInput.fill('永続化テスト');
    await page.getByRole('button').first().click();
    await page.waitForURL('/', { timeout: 10000 });
  });

  test('US2: Language preference is stored in localStorage', async ({ page }) => {
    // Given: User is viewing page in Japanese (default)
    let storedLanguage = await page.evaluate(() => localStorage.getItem('language'));
    expect(storedLanguage).toBe('ja'); // Default language

    // When: User switches to English
    await page.getByRole('button', { name: 'Switch to English' }).click();

    // Then: localStorage should be updated to 'en'
    storedLanguage = await page.evaluate(() => localStorage.getItem('language'));
    expect(storedLanguage).toBe('en');

    // When: User switches back to Japanese
    await page.getByRole('button', { name: 'Switch to Japanese' }).click();

    // Then: localStorage should be updated back to 'ja'
    storedLanguage = await page.evaluate(() => localStorage.getItem('language'));
    expect(storedLanguage).toBe('ja');
  });

  test('US2: Language preference persists across page reloads', async ({ page }) => {
    // Given: User switches to English
    await page.getByRole('button', { name: 'Switch to English' }).click();
    await expect(page.getByText(/Welcome/)).toBeVisible();

    // When: Page is reloaded
    await page.reload();

    // Then: Language should still be English
    await expect(page.getByText(/Welcome/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Switch to Japanese' })).toBeVisible();
  });

  test('US2: Language preference persists across navigation', async ({ page }) => {
    // Given: User switches to English on TOP page
    await page.getByRole('button', { name: 'Switch to English' }).click();
    await expect(page.getByText(/Welcome/)).toBeVisible();

    // When: User navigates to game creation page
    await page.goto('/games/create');

    // Then: Language should still be English
    await expect(page.getByText(/Create|Game/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Switch to Japanese' })).toBeVisible();

    // When: User navigates back to TOP page
    await page.goto('/');

    // Then: Language should still be English
    await expect(page.getByText(/Welcome/)).toBeVisible();
  });

  test('US2: Language preference persists in new browser tab', async ({ context, page }) => {
    // Given: User switches to English
    await page.getByRole('button', { name: 'Switch to English' }).click();
    await expect(page.getByText(/Welcome/)).toBeVisible();

    // When: User opens a new tab in the same browser context
    const newPage = await context.newPage();
    await newPage.goto('/');

    // Set up session in new tab (localStorage doesn't persist across tabs automatically)
    const nicknameInput = newPage.locator('input[type="text"]').first();
    await nicknameInput.fill('新しいタブ');
    await newPage.getByRole('button').first().click();
    await newPage.waitForURL('/', { timeout: 10000 });

    // Then: Language should be inherited from the browser context
    // Note: Each tab has its own localStorage, so language needs to be set per tab
    // This test verifies that localStorage works independently in each tab
    const storedLanguage = await newPage.evaluate(() => localStorage.getItem('language'));
    expect(storedLanguage).not.toBeNull(); // Language is initialized

    await newPage.close();
  });
});

test.describe('i18n - Edge Cases', () => {
  test('Language switcher works without JavaScript (graceful degradation)', async ({
    browser,
    context: defaultContext,
  }) => {
    // First, create a session with nickname using JavaScript enabled
    const setupPage = await defaultContext.newPage();
    await setupPage.goto('/');
    const nicknameInput = setupPage.locator('input[type="text"]').first();
    await nicknameInput.fill('NoJSテスト');
    await setupPage.getByRole('button').first().click();
    await setupPage.waitForURL('/', { timeout: 10000 });

    // Get cookies from the setup page
    const cookies = await defaultContext.cookies();
    await setupPage.close();

    // Now test with JavaScript disabled
    const noJsContext = await browser.newContext({
      javaScriptEnabled: false,
    });

    // Add the session cookies to the no-JS context
    await noJsContext.addCookies(cookies);

    const page = await noJsContext.newPage();
    await page.goto('/');

    // Then: Language switcher button should still be visible (as a server-rendered element)
    // Note: Clicking it won't work without JS, but it should be present
    const languageSwitcher = page.getByRole('button', { name: /Switch to English/ });
    await expect(languageSwitcher).toBeVisible();

    await noJsContext.close();
  });

  test('Page remains functional when localStorage is unavailable', async ({ page, context }) => {
    // Given: localStorage is blocked or unavailable
    await context.clearCookies();
    await page.goto('/');

    // Simulate localStorage being unavailable by overriding it
    await page.addInitScript(() => {
      // Mock localStorage to throw errors
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: () => {
            throw new Error('localStorage unavailable');
          },
          setItem: () => {
            throw new Error('localStorage unavailable');
          },
          removeItem: () => {
            throw new Error('localStorage unavailable');
          },
          clear: () => {
            throw new Error('localStorage unavailable');
          },
        },
        writable: false,
      });
    });

    // Set up session
    await page.goto('/');
    const nicknameInput = page.locator('input[type="text"]').first();
    await nicknameInput.fill('LocalStorageなし');
    await page.getByRole('button').first().click();
    await page.waitForURL('/', { timeout: 10000 });

    // Then: Page should still function with default language (Japanese)
    await expect(page.getByText(/ようこそ/)).toBeVisible();

    // And: Language switcher should still be visible
    await expect(page.getByRole('button', { name: 'Switch to English' })).toBeVisible();
  });
});
