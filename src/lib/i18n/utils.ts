/**
 * i18n Utilities
 * Feature: 008-i18n-support
 *
 * Helper functions for translation, formatting, and locale operations
 */

import { DEFAULT_LANGUAGE, LOCALE_MAP } from './constants';
import { translations } from './translations';
import type { Language, TranslationKey } from './types';

/**
 * Get translated text by key path with fallback to Japanese
 *
 * @param language - Current language
 * @param key - Translation key in dot notation
 * @returns Translated string
 */
export function getTranslation(language: Language, key: TranslationKey): string {
  // Split key into namespace and nested keys
  const keys = key.split('.');

  // Navigate to the translation value
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic path navigation required
  let value: any = translations[language];

  for (const k of keys) {
    value = value?.[k];
  }

  // If translation found, return it
  if (typeof value === 'string') {
    return value;
  }

  // Fallback to Japanese if translation not found
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic path navigation required
  let fallbackValue: any = translations[DEFAULT_LANGUAGE];

  for (const k of keys) {
    fallbackValue = fallbackValue?.[k];
  }

  if (typeof fallbackValue === 'string') {
    // Log warning in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Missing translation: ${language}.${key}`);
    }
    return fallbackValue;
  }

  // Last resort: return the key itself
  if (process.env.NODE_ENV === 'development') {
    console.error(`Translation not found: ${key}`);
  }
  return key;
}

/**
 * Format a date according to the current locale
 *
 * @param language - Current language
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  language: Language,
  date: Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const locale = LOCALE_MAP[language];
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
}

/**
 * Format a number according to the current locale
 *
 * @param language - Current language
 * @param num - Number to format
 * @param options - Intl.NumberFormat options
 * @returns Formatted number string
 */
export function formatNumber(
  language: Language,
  num: number,
  options?: Intl.NumberFormatOptions
): string {
  const locale = LOCALE_MAP[language];
  const formatter = new Intl.NumberFormat(locale, options);
  return formatter.format(num);
}
