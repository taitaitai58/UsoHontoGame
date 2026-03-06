/**
 * Header Component
 * Feature: 008-i18n-support / US1
 *
 * Application header with language switcher
 */

'use client';

import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSwitcher } from './LanguageSwitcher';

/**
 * Header Component
 *
 * Renders application header with navigation and language switcher
 */
export function Header() {
  const { t } = useLanguage();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold text-gray-900">ウソホントゲーム</div>
          <nav className="flex items-center gap-2" aria-label="メインナビゲーション">
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
            >
              {t('navigation.participantTop')}
            </Link>
            <Link
              href="/games"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
            >
              {t('navigation.gameManagement')}
            </Link>
          </nav>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
