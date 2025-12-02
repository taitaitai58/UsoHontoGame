/**
 * i18n Constants
 * Feature: 008-i18n-support
 */

import type { Language } from './types';

/**
 * Default language when no preference is set
 */
export const DEFAULT_LANGUAGE: Language = 'ja';

/**
 * All supported languages
 */
export const SUPPORTED_LANGUAGES: readonly Language[] = ['ja', 'en'] as const;

/**
 * localStorage key for language preference
 */
export const LANGUAGE_STORAGE_KEY = 'uso-honto-language';

/**
 * Cookie key for language preference (server-side access)
 */
export const LANGUAGE_COOKIE_KEY = 'uso-honto-language';

/**
 * Locale mapping for Intl API
 */
export const LOCALE_MAP: Record<Language, string> = {
  ja: 'ja-JP',
  en: 'en-US',
};
