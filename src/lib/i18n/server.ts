/**
 * Server-Side i18n Utilities
 * Feature: 008-i18n-support
 *
 * Translation functions for Server Actions and Server Components
 * Uses cookies for language detection since React Context is unavailable on the server
 */

'use server';

import { DEFAULT_LANGUAGE } from './constants';
import { getStoredLanguageCookie } from './storage-server';
import type { TranslationKey } from './types';
import { getTranslation } from './utils';

/**
 * Server-side translation function
 *
 * Retrieves the current language from cookies and returns the translated text
 * Falls back to DEFAULT_LANGUAGE (ja) if no cookie is set
 *
 * @param key - Translation key in dot notation (e.g., 'game.createGame')
 * @returns Translated string in the user's language
 *
 * @example
 * ```typescript
 * import { t } from '@/lib/i18n/server';
 *
 * export async function createGameAction(formData: FormData) {
 *   try {
 *     // ... game creation logic
 *     return {
 *       success: true,
 *       message: await t('action.game.create.success'),
 *     };
 *   } catch (error) {
 *     return {
 *       success: false,
 *       errors: { _form: [await t('action.game.create.error')] },
 *     };
 *   }
 * }
 * ```
 */
export async function t(key: TranslationKey): Promise<string> {
  const language = (await getStoredLanguageCookie()) ?? DEFAULT_LANGUAGE;
  return getTranslation(language, key);
}

/**
 * Get current language from cookie
 *
 * @returns Current language or DEFAULT_LANGUAGE if not set
 */
export async function getCurrentLanguage() {
  return (await getStoredLanguageCookie()) ?? DEFAULT_LANGUAGE;
}
