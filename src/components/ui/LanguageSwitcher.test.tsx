/**
 * LanguageSwitcher Component Tests
 * Feature: 008-i18n-support / US1
 * Test-Driven Development: Write tests first, ensure they FAIL before implementation
 */

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/providers/LanguageProvider';
import { LanguageSwitcher } from './LanguageSwitcher';

describe('LanguageSwitcher', () => {
  const renderWithProvider = (ui: React.ReactElement, initialLanguage?: 'ja' | 'en') => {
    return render(<LanguageProvider initialLanguage={initialLanguage}>{ui}</LanguageProvider>);
  };

  describe('Rendering', () => {
    it('should render language switcher button', () => {
      renderWithProvider(<LanguageSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should show EN when current language is Japanese', () => {
      renderWithProvider(<LanguageSwitcher />, 'ja');

      expect(screen.getByText('EN')).toBeInTheDocument();
    });

    it('should show 日本語 when current language is English', () => {
      renderWithProvider(<LanguageSwitcher />, 'en');

      expect(screen.getByText('日本語')).toBeInTheDocument();
    });
  });

  describe('Language Switching', () => {
    it('should switch to English when clicked from Japanese', async () => {
      renderWithProvider(<LanguageSwitcher />, 'ja');
      const user = userEvent.setup();

      const button = screen.getByRole('button');
      await user.click(button);

      // After click, should show Japanese label (meaning we switched to English)
      expect(screen.getByText('日本語')).toBeInTheDocument();
    });

    it('should switch to Japanese when clicked from English', async () => {
      renderWithProvider(<LanguageSwitcher />, 'en');
      const user = userEvent.setup();

      const button = screen.getByRole('button');
      await user.click(button);

      // After click, should show EN label (meaning we switched to Japanese)
      expect(screen.getByText('EN')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label', () => {
      renderWithProvider(<LanguageSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toHaveAccessibleName();
    });

    it('should be keyboard accessible', () => {
      renderWithProvider(<LanguageSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Custom Props', () => {
    it('should accept className prop', () => {
      renderWithProvider(<LanguageSwitcher className="custom-class" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });
});
