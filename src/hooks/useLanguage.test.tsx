/**
 * useLanguage Hook Tests
 * Feature: 008-i18n-support / US1
 * Test-Driven Development: Write tests first, ensure they FAIL before implementation
 */

import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/providers/LanguageProvider';
import { useLanguage } from './useLanguage';

describe('useLanguage', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LanguageProvider initialLanguage="ja">{children}</LanguageProvider>
  );

  describe('Hook API', () => {
    it('should return all required properties', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      expect(result.current).toHaveProperty('language');
      expect(result.current).toHaveProperty('setLanguage');
      expect(result.current).toHaveProperty('toggleLanguage');
      expect(result.current).toHaveProperty('t');
      expect(result.current).toHaveProperty('formatDate');
      expect(result.current).toHaveProperty('formatNumber');
    });

    it('should have correct function types', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      expect(typeof result.current.setLanguage).toBe('function');
      expect(typeof result.current.toggleLanguage).toBe('function');
      expect(typeof result.current.t).toBe('function');
      expect(typeof result.current.formatDate).toBe('function');
      expect(typeof result.current.formatNumber).toBe('function');
    });
  });

  describe('Language State', () => {
    it('should return current language', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      expect(result.current.language).toBe('ja');
    });

    it('should update language when setLanguage is called', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      act(() => {
        result.current.setLanguage('en');
      });

      expect(result.current.language).toBe('en');
    });
  });

  describe('Translation Function', () => {
    it('should translate common keys', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      expect(result.current.t('common.cancel')).toBe('キャンセル');

      act(() => {
        result.current.setLanguage('en');
      });

      expect(result.current.t('common.cancel')).toBe('Cancel');
    });

    it('should translate navigation keys', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      expect(result.current.t('navigation.home')).toBe('ホーム');

      act(() => {
        result.current.setLanguage('en');
      });

      expect(result.current.t('navigation.home')).toBe('Home');
    });

    it('should translate game keys', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      expect(result.current.t('game.title')).toBe('ウソホントゲーム');

      act(() => {
        result.current.setLanguage('en');
      });

      expect(result.current.t('game.title')).toBe('Two Truths and a Lie');
    });
  });

  describe('Format Date', () => {
    it('should format date in Japanese locale', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });
      const date = new Date(2025, 10, 27); // November 27, 2025

      const formatted = result.current.formatDate(date, { dateStyle: 'long' });

      expect(formatted).toContain('2025');
      expect(formatted).toContain('11');
      expect(formatted).toContain('27');
    });

    it('should format date in English locale', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });
      const date = new Date(2025, 10, 27);

      act(() => {
        result.current.setLanguage('en');
      });

      const formatted = result.current.formatDate(date, { dateStyle: 'long' });

      expect(formatted).toContain('2025');
      expect(formatted).toContain('27');
    });
  });

  describe('Format Number', () => {
    it('should format number in Japanese locale', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      const formatted = result.current.formatNumber(1234567);

      expect(formatted).toBe('1,234,567');
    });

    it('should format number in English locale', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      act(() => {
        result.current.setLanguage('en');
      });

      const formatted = result.current.formatNumber(1234567);

      expect(formatted).toBe('1,234,567');
    });
  });
});
