// Error component for ResponseStatusPage
// Feature: 006-results-dashboard (User Story 1)
// Displays error state when dashboard data cannot be loaded

'use client';

import { Header } from '@/components/ui/Header';
import { useLanguage } from '@/hooks/useLanguage';
import type { ResponseStatusPageErrorProps } from './ResponseStatusPage.types';

/**
 * ResponseStatusPageError - Error state component
 * Displayed when response status data fetching fails
 *
 * @param props - Error props including error message
 */
export function ResponseStatusPageError({ errorMessage }: ResponseStatusPageErrorProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-900">{t('errors.errorOccurred')}</h2>
          <p className="mt-2 text-sm text-red-800">{errorMessage}</p>
          <a href="/games" className="mt-4 inline-block text-sm font-medium text-red-900 underline">
            {t('navigation.gameList')}
          </a>
        </div>
      </div>
    </div>
  );
}
