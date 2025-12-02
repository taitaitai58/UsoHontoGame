/**
 * localStorage Persistence Tests
 * Feature: 008-i18n-support / US2
 * Test-Driven Development: Write tests first, ensure they FAIL before implementation
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LANGUAGE_STORAGE_KEY } from './constants';
import { getStoredLanguage, setStoredLanguage } from './storage';
import type { Language } from './types';

describe('i18n Storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getStoredLanguage', () => {
    it('should return null when no language is stored', () => {
      const result = getStoredLanguage();

      expect(result).toBeNull();
    });

    it('should return stored language when valid', () => {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');

      const result = getStoredLanguage();

      expect(result).toBe('en');
    });

    it('should return null for invalid language value', () => {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, 'invalid');

      const result = getStoredLanguage();

      expect(result).toBeNull();
    });

    it('should return null when localStorage throws error', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      const result = getStoredLanguage();

      expect(result).toBeNull();
    });
  });

  describe('setStoredLanguage', () => {
    it('should store language in localStorage', () => {
      setStoredLanguage('en');

      expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    });

    it('should update existing stored language', () => {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, 'ja');

      setStoredLanguage('en');

      expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    });

    it('should handle localStorage errors gracefully', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      // Should not throw
      expect(() => setStoredLanguage('en')).not.toThrow();
    });

    it('should accept Japanese language', () => {
      setStoredLanguage('ja');

      expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('ja');
    });

    it('should accept English language', () => {
      setStoredLanguage('en');

      expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    });
  });

  describe('Type Safety', () => {
    it('should only accept valid Language types', () => {
      const validLanguages: Language[] = ['ja', 'en'];

      for (const lang of validLanguages) {
        setStoredLanguage(lang);
        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe(lang);
      }
    });
  });
});
