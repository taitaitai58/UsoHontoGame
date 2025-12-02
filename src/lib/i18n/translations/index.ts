/**
 * Translations Index
 * Feature: 008-i18n-support
 *
 * Central export for all translation objects
 */

import type { TranslationsByLanguage } from '../types';
import { en } from './en';
import { ja } from './ja';

/**
 * All translations indexed by language code
 */
export const translations: TranslationsByLanguage = {
  ja,
  en,
} as const;
