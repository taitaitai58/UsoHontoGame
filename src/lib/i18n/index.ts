/**
 * i18n Library
 * Feature: 008-i18n-support
 *
 * Central export for all i18n functionality
 */

// Export constants
export {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  LOCALE_MAP,
  SUPPORTED_LANGUAGES,
} from './constants';
// Export storage utilities
export { getStoredLanguage, setStoredLanguage } from './storage';

// Export translations
export { translations } from './translations';
// Export types
export type {
  AnswerTranslations,
  CommonTranslations,
  EmptyStateTranslations,
  ErrorTranslations,
  GameStatusTranslations,
  GameTranslations,
  Language,
  LanguageContextValue,
  LanguageProviderProps,
  LanguageSwitcherProps,
  MessageTranslations,
  NavigationTranslations,
  ResultsTranslations,
  SessionTranslations,
  TranslationKey,
  Translations,
  TranslationsByLanguage,
  UseLanguageReturn,
} from './types';
// Export utilities
export { formatDate, formatNumber, getTranslation } from './utils';
