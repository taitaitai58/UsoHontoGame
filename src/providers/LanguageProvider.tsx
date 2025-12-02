/**
 * Language Provider
 * Feature: 008-i18n-support / US1, US2
 *
 * React Context provider for language state management with localStorage persistence
 */

'use client';

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type {
  Language,
  LanguageContextValue,
  LanguageProviderProps,
  TranslationKey,
} from '@/lib/i18n';
import { DEFAULT_LANGUAGE, formatDate, formatNumber, getTranslation } from '@/lib/i18n';
import { getStoredLanguage, setLanguageCookie, setStoredLanguage } from '@/lib/i18n/storage';

/**
 * Language Context
 */
export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

/**
 * Language Provider Component
 *
 * Provides language state and translation functions to all child components
 * Features:
 * - US1: Language switching between Japanese and English
 * - US2: Persist language preference to localStorage
 */
export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  // Initialize with prop, then check localStorage in useEffect to avoid SSR mismatch
  const [language, setLanguageState] = useState<Language>(initialLanguage || DEFAULT_LANGUAGE);
  const [_isHydrated, setIsHydrated] = useState(false);

  // US2: Load language from localStorage on mount (client-side only)
  useEffect(() => {
    // Only read from localStorage if no initialLanguage prop was provided
    if (!initialLanguage) {
      const stored = getStoredLanguage();
      if (stored) {
        setLanguageState(stored);
      }
    }
    setIsHydrated(true);
  }, [initialLanguage]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    // US2: Persist to localStorage (client-side)
    setStoredLanguage(lang);
    // Persist to cookie (for server-side access)
    setLanguageCookie(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const newLang = prev === 'ja' ? 'en' : 'ja';
      // US2: Persist to localStorage (client-side)
      setStoredLanguage(newLang);
      // Persist to cookie (for server-side access)
      setLanguageCookie(newLang);
      return newLang;
    });
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return getTranslation(language, key);
    },
    [language]
  );

  const formatDateFn = useCallback(
    (date: Date, options?: Intl.DateTimeFormatOptions): string => {
      return formatDate(language, date, options);
    },
    [language]
  );

  const formatNumberFn = useCallback(
    (num: number, options?: Intl.NumberFormatOptions): string => {
      return formatNumber(language, num, options);
    },
    [language]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      formatDate: formatDateFn,
      formatNumber: formatNumberFn,
    }),
    [language, setLanguage, toggleLanguage, t, formatDateFn, formatNumberFn]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
