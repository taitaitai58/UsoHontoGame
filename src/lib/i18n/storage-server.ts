/**
 * Storage Persistence Utilities (Server-Side)
 * Feature: 008-i18n-support / US2
 *
 * Handles reading and writing language preference to cookies (server-side only)
 * Uses Next.js cookies() API which can only be used in Server Components and Server Actions
 */

'use server';

import { cookies } from 'next/headers';
import { LANGUAGE_COOKIE_KEY, SUPPORTED_LANGUAGES } from './constants';
import type { Language } from './types';

/**
 * Get stored language from cookie (server-side access)
 *
 * @returns Stored language if valid, null otherwise
 */
export async function getStoredLanguageCookie(): Promise<Language | null> {
  try {
    const cookieStore = await cookies();
    const stored = cookieStore.get(LANGUAGE_COOKIE_KEY)?.value;

    if (!stored) {
      return null;
    }

    // Validate that stored value is a supported language
    if (SUPPORTED_LANGUAGES.includes(stored as Language)) {
      return stored as Language;
    }

    return null;
  } catch (error) {
    // Cookie access might fail in certain contexts
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to read language from cookie:', error);
    }
    return null;
  }
}

/**
 * Store language preference to cookie (server-side persistence)
 *
 * @param language - Language to store
 */
export async function setStoredLanguageCookie(language: Language): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(LANGUAGE_COOKIE_KEY, language, {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  } catch (error) {
    // Cookie access might fail in certain contexts
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to save language to cookie:', error);
    }
  }
}
