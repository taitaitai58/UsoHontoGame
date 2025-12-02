/**
 * Translation Completeness Tests
 * Feature: 008-i18n-support / US3
 * Test-Driven Development: Verify all translation keys exist in both languages
 */

import { describe, expect, it } from 'vitest';
import { translations } from './translations';
import type { Language, Translations } from './types';

describe('Translation Completeness', () => {
  const languages: Language[] = ['ja', 'en'];

  describe('Structure Validation', () => {
    it('should have translations for both languages', () => {
      expect(translations).toHaveProperty('ja');
      expect(translations).toHaveProperty('en');
    });

    it('should have all required namespaces', () => {
      const requiredNamespaces = [
        'common',
        'navigation',
        'game',
        'session',
        'answer',
        'results',
        'errors',
        'messages',
        'emptyState',
      ];

      for (const lang of languages) {
        for (const namespace of requiredNamespaces) {
          expect(translations[lang]).toHaveProperty(namespace);
        }
      }
    });
  });

  describe('Key Parity', () => {
    it('should have matching keys in common namespace', () => {
      const jaKeys = Object.keys(translations.ja.common);
      const enKeys = Object.keys(translations.en.common);

      expect(jaKeys.sort()).toEqual(enKeys.sort());
    });

    it('should have matching keys in navigation namespace', () => {
      const jaKeys = Object.keys(translations.ja.navigation);
      const enKeys = Object.keys(translations.en.navigation);

      expect(jaKeys.sort()).toEqual(enKeys.sort());
    });

    it('should have matching keys in game namespace', () => {
      const jaKeys = Object.keys(translations.ja.game);
      const enKeys = Object.keys(translations.en.game);

      expect(jaKeys.sort()).toEqual(enKeys.sort());
    });

    it('should have matching keys in game.status sub-namespace', () => {
      const jaKeys = Object.keys(translations.ja.game.status);
      const enKeys = Object.keys(translations.en.game.status);

      expect(jaKeys.sort()).toEqual(enKeys.sort());
    });

    it('should have matching keys in session namespace', () => {
      const jaKeys = Object.keys(translations.ja.session);
      const enKeys = Object.keys(translations.en.session);

      expect(jaKeys.sort()).toEqual(enKeys.sort());
    });

    it('should have matching keys in answer namespace', () => {
      const jaKeys = Object.keys(translations.ja.answer);
      const enKeys = Object.keys(translations.en.answer);

      expect(jaKeys.sort()).toEqual(enKeys.sort());
    });

    it('should have matching keys in results namespace', () => {
      const jaKeys = Object.keys(translations.ja.results);
      const enKeys = Object.keys(translations.en.results);

      expect(jaKeys.sort()).toEqual(enKeys.sort());
    });

    it('should have matching keys in errors namespace', () => {
      const jaKeys = Object.keys(translations.ja.errors);
      const enKeys = Object.keys(translations.en.errors);

      expect(jaKeys.sort()).toEqual(enKeys.sort());
    });

    it('should have matching keys in messages namespace', () => {
      const jaKeys = Object.keys(translations.ja.messages);
      const enKeys = Object.keys(translations.en.messages);

      expect(jaKeys.sort()).toEqual(enKeys.sort());
    });

    it('should have matching keys in emptyState namespace', () => {
      const jaKeys = Object.keys(translations.ja.emptyState);
      const enKeys = Object.keys(translations.en.emptyState);

      expect(jaKeys.sort()).toEqual(enKeys.sort());
    });
  });

  describe('Value Completeness', () => {
    it('should have non-empty values in Japanese translations', () => {
      const checkNonEmpty = (obj: Translations, path = '') => {
        for (const [key, value] of Object.entries(obj)) {
          const fullPath = path ? `${path}.${key}` : key;
          if (typeof value === 'string') {
            expect(value.trim(), `${fullPath} should not be empty`).not.toBe('');
          } else if (typeof value === 'object' && value !== null) {
            checkNonEmpty(value as Translations, fullPath);
          }
        }
      };

      checkNonEmpty(translations.ja);
    });

    it('should have non-empty values in English translations', () => {
      const checkNonEmpty = (obj: Translations, path = '') => {
        for (const [key, value] of Object.entries(obj)) {
          const fullPath = path ? `${path}.${key}` : key;
          if (typeof value === 'string') {
            expect(value.trim(), `${fullPath} should not be empty`).not.toBe('');
          } else if (typeof value === 'object' && value !== null) {
            checkNonEmpty(value as Translations, fullPath);
          }
        }
      };

      checkNonEmpty(translations.en);
    });
  });

  describe('Translation Quality', () => {
    it('should not have placeholder text in Japanese', () => {
      const checkNoPlaceholders = (obj: Translations) => {
        for (const value of Object.values(obj)) {
          if (typeof value === 'string') {
            expect(value).not.toMatch(/TODO|FIXME|XXX/i);
          } else if (typeof value === 'object' && value !== null) {
            checkNoPlaceholders(value as Translations);
          }
        }
      };

      checkNoPlaceholders(translations.ja);
    });

    it('should not have placeholder text in English', () => {
      const checkNoPlaceholders = (obj: Translations) => {
        for (const value of Object.values(obj)) {
          if (typeof value === 'string') {
            expect(value).not.toMatch(/TODO|FIXME|XXX/i);
          } else if (typeof value === 'object' && value !== null) {
            checkNoPlaceholders(value as Translations);
          }
        }
      };

      checkNoPlaceholders(translations.en);
    });
  });
});
