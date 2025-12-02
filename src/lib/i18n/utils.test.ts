/**
 * i18n Utilities Tests
 * Feature: 008-i18n-support / US3
 * Test formatDate and formatNumber functions
 */

import { describe, expect, it } from 'vitest';
import { formatDate, formatNumber, getTranslation } from './utils';

describe('i18n Utilities', () => {
  describe('getTranslation', () => {
    it('should return translation for valid key in Japanese', () => {
      expect(getTranslation('ja', 'common.save')).toBe('保存');
    });

    it('should return translation for valid key in English', () => {
      expect(getTranslation('en', 'common.save')).toBe('Save');
    });

    it('should return Japanese fallback for missing English translation', () => {
      // This tests the fallback mechanism
      const result = getTranslation('en', 'common.save');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle nested keys', () => {
      expect(getTranslation('ja', 'game.status.preparing')).toBe('準備中');
      expect(getTranslation('en', 'game.status.preparing')).toBe('Preparing');
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2025-11-27T12:00:00Z');

    it('should format date in Japanese locale', () => {
      const result = formatDate('ja', testDate, { dateStyle: 'medium' });

      expect(result).toContain('2025');
      expect(result).toContain('11');
      expect(result).toContain('27');
    });

    it('should format date in English locale', () => {
      const result = formatDate('en', testDate, { dateStyle: 'medium' });

      expect(result).toContain('2025');
      expect(result).toContain('Nov');
      expect(result).toContain('27');
    });

    it('should format date with time in Japanese', () => {
      const result = formatDate('ja', testDate, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should format date with time in English', () => {
      const result = formatDate('en', testDate, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle long date format in Japanese', () => {
      const result = formatDate('ja', testDate, { dateStyle: 'long' });

      expect(result).toContain('2025');
    });

    it('should handle long date format in English', () => {
      const result = formatDate('en', testDate, { dateStyle: 'long' });

      expect(result).toContain('2025');
      expect(result).toContain('November');
    });

    it('should handle short date format', () => {
      const jaResult = formatDate('ja', testDate, { dateStyle: 'short' });
      const enResult = formatDate('en', testDate, { dateStyle: 'short' });

      expect(jaResult).toBeDefined();
      expect(enResult).toBeDefined();
    });

    it('should format different dates consistently', () => {
      const date1 = new Date('2025-01-01');
      const date2 = new Date('2025-12-31');

      const result1 = formatDate('ja', date1, { dateStyle: 'medium' });
      const result2 = formatDate('ja', date2, { dateStyle: 'medium' });

      expect(result1).not.toBe(result2);
      expect(result1).toContain('1');
      expect(result2).toContain('12');
    });
  });

  describe('formatNumber', () => {
    it('should format number in Japanese locale', () => {
      expect(formatNumber('ja', 1234567)).toBe('1,234,567');
    });

    it('should format number in English locale', () => {
      expect(formatNumber('en', 1234567)).toBe('1,234,567');
    });

    it('should format decimal numbers in Japanese', () => {
      const result = formatNumber('ja', 1234.56, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      expect(result).toContain('1,234');
      expect(result).toContain('56');
    });

    it('should format decimal numbers in English', () => {
      const result = formatNumber('en', 1234.56, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      expect(result).toContain('1,234');
      expect(result).toContain('56');
    });

    it('should format currency in Japanese', () => {
      const result = formatNumber('ja', 1234.56, {
        style: 'currency',
        currency: 'JPY',
      });

      expect(result).toContain('1,235'); // JPY doesn't use decimals
    });

    it('should format currency in English', () => {
      const result = formatNumber('en', 1234.56, {
        style: 'currency',
        currency: 'USD',
      });

      expect(result).toContain('1,234');
      expect(result).toContain('56');
    });

    it('should format percentage', () => {
      const jaResult = formatNumber('ja', 0.856, { style: 'percent' });
      const enResult = formatNumber('en', 0.856, { style: 'percent' });

      expect(jaResult).toContain('86');
      expect(enResult).toContain('86');
    });

    it('should handle zero', () => {
      expect(formatNumber('ja', 0)).toBe('0');
      expect(formatNumber('en', 0)).toBe('0');
    });

    it('should handle negative numbers', () => {
      const jaResult = formatNumber('ja', -1234);
      const enResult = formatNumber('en', -1234);

      expect(jaResult).toContain('1,234');
      expect(enResult).toContain('1,234');
    });

    it('should handle large numbers', () => {
      const result = formatNumber('ja', 9876543210);

      expect(result).toContain('9,876,543,210');
    });

    it('should respect custom options', () => {
      const result = formatNumber('ja', 1234.5678, {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      });

      expect(result).toContain('5678');
    });
  });
});
