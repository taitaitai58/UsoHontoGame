/**
 * LanguageProvider Tests
 * Feature: 008-i18n-support / US1
 * Test-Driven Development: Write tests first, ensure they FAIL before implementation
 */

import { render, renderHook, screen } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageProvider } from './LanguageProvider';

describe('LanguageProvider', () => {
  describe('Initial State', () => {
    it('should provide default Japanese language', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: ({ children }) => <LanguageProvider>{children}</LanguageProvider>,
      });

      expect(result.current.language).toBe('ja');
    });

    it('should accept initialLanguage prop', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: ({ children }) => (
          <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
        ),
      });

      expect(result.current.language).toBe('en');
    });
  });

  describe('Language Switching', () => {
    it('should switch to English when setLanguage is called', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: ({ children }) => <LanguageProvider>{children}</LanguageProvider>,
      });

      act(() => {
        result.current.setLanguage('en');
      });

      expect(result.current.language).toBe('en');
    });

    it('should toggle between languages with toggleLanguage', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: ({ children }) => (
          <LanguageProvider initialLanguage="ja">{children}</LanguageProvider>
        ),
      });

      // Start with ja, toggle to en
      act(() => {
        result.current.toggleLanguage();
      });
      expect(result.current.language).toBe('en');

      // Toggle back to ja
      act(() => {
        result.current.toggleLanguage();
      });
      expect(result.current.language).toBe('ja');
    });
  });

  describe('Translation Function', () => {
    it('should return Japanese translation by default', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: ({ children }) => <LanguageProvider>{children}</LanguageProvider>,
      });

      expect(result.current.t('common.save')).toBe('保存');
    });

    it('should return English translation when language is en', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: ({ children }) => <LanguageProvider>{children}</LanguageProvider>,
      });

      act(() => {
        result.current.setLanguage('en');
      });

      expect(result.current.t('common.save')).toBe('Save');
    });

    it('should handle nested translation keys', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: ({ children }) => (
          <LanguageProvider initialLanguage="ja">{children}</LanguageProvider>
        ),
      });

      expect(result.current.t('game.status.preparing')).toBe('準備中');

      act(() => {
        result.current.setLanguage('en');
      });

      expect(result.current.t('game.status.preparing')).toBe('Preparing');
    });
  });

  describe('Rendering', () => {
    it('should render children', () => {
      render(
        <LanguageProvider>
          <div data-testid="child">Test Child</div>
        </LanguageProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('Persistence (US2)', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should initialize with stored language from localStorage', () => {
      localStorage.setItem('uso-honto-language', 'en');

      const { result } = renderHook(() => useLanguage(), {
        wrapper: ({ children }) => <LanguageProvider>{children}</LanguageProvider>,
      });

      expect(result.current.language).toBe('en');
    });

    it('should initialize with Japanese when no stored language', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: ({ children }) => <LanguageProvider>{children}</LanguageProvider>,
      });

      expect(result.current.language).toBe('ja');
    });

    it('should persist language to localStorage when setLanguage is called', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: ({ children }) => <LanguageProvider>{children}</LanguageProvider>,
      });

      act(() => {
        result.current.setLanguage('en');
      });

      expect(localStorage.getItem('uso-honto-language')).toBe('en');
    });

    it('should persist language to localStorage when toggleLanguage is called', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: ({ children }) => <LanguageProvider>{children}</LanguageProvider>,
      });

      act(() => {
        result.current.toggleLanguage();
      });

      expect(localStorage.getItem('uso-honto-language')).toBe('en');

      act(() => {
        result.current.toggleLanguage();
      });

      expect(localStorage.getItem('uso-honto-language')).toBe('ja');
    });

    it('should use initialLanguage prop over localStorage', () => {
      localStorage.setItem('uso-honto-language', 'en');

      const { result } = renderHook(() => useLanguage(), {
        wrapper: ({ children }) => (
          <LanguageProvider initialLanguage="ja">{children}</LanguageProvider>
        ),
      });

      expect(result.current.language).toBe('ja');
    });
  });
});
