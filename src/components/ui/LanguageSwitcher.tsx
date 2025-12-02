/**
 * LanguageSwitcher Component
 * Feature: 008-i18n-support / US1
 *
 * UI component for switching between Japanese and English
 */

'use client';

import { useLanguage } from '@/hooks/useLanguage';
import type { LanguageSwitcherProps } from '@/lib/i18n';

/**
 * Language Switcher Component
 *
 * Renders a button that toggles between Japanese and English.
 * Shows the opposite language label (e.g., shows "EN" when viewing in Japanese)
 */
export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { language, toggleLanguage } = useLanguage();

  // Show the opposite language (what user can switch TO)
  const label = language === 'ja' ? 'EN' : '日本語';
  const ariaLabel = language === 'ja' ? 'Switch to English' : 'Switch to Japanese';

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`rounded px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-100 ${className}`}
      aria-label={ariaLabel}
    >
      {label}
    </button>
  );
}
