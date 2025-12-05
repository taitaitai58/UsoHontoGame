/**
 * Tests for Spinner component
 * Feature: 009-apple-hig-ui-redesign
 * Apple HIG-compliant loading spinner with variants and states
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  describe('Rendering', () => {
    it('should render spinner element', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    it('should render with default size', () => {
      const { container } = render(<Spinner />);
      const spinner = container.querySelector('.spinner-base');
      expect(spinner).toHaveClass('spinner-md');
    });

    it('should have loading accessibility label', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });
  });

  describe('Sizes', () => {
    it('should apply sm size class', () => {
      const { container } = render(<Spinner size="sm" />);
      const spinner = container.querySelector('.spinner-base');
      expect(spinner).toHaveClass('spinner-sm');
    });

    it('should apply md size class (default)', () => {
      const { container } = render(<Spinner size="md" />);
      const spinner = container.querySelector('.spinner-base');
      expect(spinner).toHaveClass('spinner-md');
    });

    it('should apply lg size class', () => {
      const { container } = render(<Spinner size="lg" />);
      const spinner = container.querySelector('.spinner-base');
      expect(spinner).toHaveClass('spinner-lg');
    });

    it('should apply xl size class', () => {
      const { container } = render(<Spinner size="xl" />);
      const spinner = container.querySelector('.spinner-base');
      expect(spinner).toHaveClass('spinner-xl');
    });
  });

  describe('Variants', () => {
    it('should apply primary variant (default)', () => {
      const { container } = render(<Spinner variant="primary" />);
      const spinner = container.querySelector('.spinner-base');
      expect(spinner).toHaveClass('spinner-primary');
    });

    it('should apply secondary variant', () => {
      const { container } = render(<Spinner variant="secondary" />);
      const spinner = container.querySelector('.spinner-base');
      expect(spinner).toHaveClass('spinner-secondary');
    });

    it('should apply light variant', () => {
      const { container } = render(<Spinner variant="light" />);
      const spinner = container.querySelector('.spinner-base');
      expect(spinner).toHaveClass('spinner-light');
    });

    it('should apply dark variant', () => {
      const { container } = render(<Spinner variant="dark" />);
      const spinner = container.querySelector('.spinner-base');
      expect(spinner).toHaveClass('spinner-dark');
    });
  });

  describe('Label', () => {
    it('should render text label', () => {
      render(<Spinner label="Loading data" />);
      expect(screen.getByText('Loading data')).toBeInTheDocument();
    });

    it('should not render label by default', () => {
      const { container } = render(<Spinner />);
      const label = container.querySelector('.spinner-label');
      expect(label).not.toBeInTheDocument();
    });

    it('should render label below spinner', () => {
      const { container } = render(<Spinner label="Please wait" />);
      const label = container.querySelector('.spinner-label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveClass('text-center');
    });
  });

  describe('Accessibility', () => {
    it('should have role="status"', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have default aria-label', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });

    it('should accept custom aria-label', () => {
      render(<Spinner aria-label="Loading content" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Loading content');
    });

    it('should have aria-live="polite"', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Custom Classes', () => {
    it('should merge custom className', () => {
      const { container } = render(<Spinner className="custom-spinner" />);
      const spinner = container.querySelector('.spinner-base');
      expect(spinner).toHaveClass('custom-spinner');
      expect(spinner).toHaveClass('spinner-base');
    });
  });

  describe('HTML Attributes', () => {
    it('should pass through data attributes', () => {
      const { container } = render(<Spinner data-testid="custom-spinner" />);
      const spinner = screen.getByTestId('custom-spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('should pass through id attribute', () => {
      render(<Spinner id="my-spinner" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('id', 'my-spinner');
    });
  });

  describe('Real-world Use Cases', () => {
    it('should work as page loader', () => {
      render(<Spinner size="lg" label="Loading page..." />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading page...')).toBeInTheDocument();
    });

    it('should work as button loader', () => {
      const { container } = render(<Spinner size="sm" variant="light" />);
      const spinner = container.querySelector('.spinner-base');
      expect(spinner).toHaveClass('spinner-sm');
      expect(spinner).toHaveClass('spinner-light');
    });

    it('should work as inline loader', () => {
      render(<Spinner size="sm" label="Processing..." />);
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should have animation class', () => {
      const { container } = render(<Spinner />);
      const spinner = container.querySelector('.spinner-base');
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  describe('Center Alignment', () => {
    it('should center spinner when centered prop is true', () => {
      const { container } = render(<Spinner centered />);
      const wrapper = container.querySelector('.spinner-wrapper');
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('justify-center');
      expect(wrapper).toHaveClass('items-center');
    });

    it('should not center by default', () => {
      const { container } = render(<Spinner />);
      const wrapper = container.querySelector('.spinner-wrapper');
      expect(wrapper).not.toHaveClass('justify-center');
    });
  });
});
