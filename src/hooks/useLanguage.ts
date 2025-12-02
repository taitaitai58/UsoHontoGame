/**
 * useLanguage Hook
 * Feature: 008-i18n-support / US1
 *
 * Custom hook to access language context
 */

'use client';

import { useContext } from 'react';
import type { UseLanguageReturn } from '@/lib/i18n';
import { LanguageContext } from '@/providers/LanguageProvider';

/**
 * Hook to access language context
 *
 * @returns Language context value with current language, setLanguage, toggleLanguage, t, formatDate, formatNumber
 * @throws Error if used outside LanguageProvider
 */
export function useLanguage(): UseLanguageReturn {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
}
