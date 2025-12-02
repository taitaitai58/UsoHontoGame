// 404 Not Found Page Component
// Presentational component for 404 error page

'use client';

import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';

/**
 * NotFoundPage - Component for 404 Not Found page
 * Pure presentational component with no business logic
 * Displayed when users navigate to routes that don't exist
 */
export function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">{t('errors.pageNotFound')}</h2>
        <p className="text-gray-600 mb-8">{t('errors.pageNotFoundDescription')}</p>
        <Link
          href="/join"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          {t('navigation.joinGame')}
        </Link>
      </div>
    </div>
  );
}
