/**
 * Tests for Checkbox component
 * Feature: 009-apple-hig-ui-redesign - Extensions
 * Apple HIG-compliant checkbox with variants and states
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  describe('Rendering', () => {
    it('should render checkbox element', () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Checkbox label="Accept terms" />);
      expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
    });

    it('should render with description', () => {
      render(<Checkbox label="Subscribe" description="Receive email updates" />);
      expect(screen.getByText('Receive email updates')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('should be unchecked by default', () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it('should be checked when defaultChecked', () => {
      render(<Checkbox defaultChecked />);
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should be controlled with checked prop', () => {
      render(<Checkbox checked={true} onChange={() => {}} />);
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should be disabled', () => {
      render(<Checkbox disabled />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });

    it('should be required', () => {
      render(<Checkbox required />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeRequired();
    });

    it('should show error state', () => {
      render(<Checkbox error errorMessage="Required field" label="Terms" />);
      expect(screen.getByText('Required field')).toBeInTheDocument();
    });

    it('should apply error class', () => {
      const { container } = render(<Checkbox error />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass('checkbox-error');
    });

    it('should apply disabled class', () => {
      const { container } = render(<Checkbox disabled />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass('checkbox-disabled');
    });
  });

  describe('Interaction', () => {
    it('should call onChange when clicked', () => {
      const onChange = vi.fn();
      render(<Checkbox onChange={onChange} />);
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      expect(onChange).toHaveBeenCalled();
    });

    it('should toggle checked state', () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);
    });

    it('should not toggle when disabled', () => {
      const onChange = vi.fn();
      render(<Checkbox disabled onChange={onChange} />);
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Sizes', () => {
    it('should apply sm size class', () => {
      const { container } = render(<Checkbox size="sm" />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass('checkbox-sm');
    });

    it('should apply md size class (default)', () => {
      const { container } = render(<Checkbox size="md" />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass('checkbox-md');
    });

    it('should apply lg size class', () => {
      const { container } = render(<Checkbox size="lg" />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass('checkbox-lg');
    });
  });

  describe('Accessibility', () => {
    it('should have proper id when provided', () => {
      render(<Checkbox id="terms" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('id', 'terms');
    });

    it('should link label to checkbox', () => {
      render(<Checkbox id="terms" label="Accept terms" />);
      const label = screen.getByText('Accept terms');
      expect(label).toHaveAttribute('for', 'terms');
    });

    it('should have aria-label when provided', () => {
      render(<Checkbox aria-label="Accept" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'Accept');
    });

    it('should have aria-invalid when error', () => {
      render(<Checkbox error />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-describedby with description', () => {
      render(<Checkbox id="terms" description="You must accept" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-describedby', 'terms-description');
    });

    it('should have aria-describedby with error message', () => {
      render(<Checkbox id="terms" error errorMessage="Required" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-describedby', 'terms-error');
    });
  });

  describe('Custom Classes', () => {
    it('should merge custom className', () => {
      const { container } = render(<Checkbox className="custom-checkbox" />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass('custom-checkbox');
      expect(checkbox).toHaveClass('checkbox-base');
    });
  });

  describe('Real-world Use Cases', () => {
    it('should work as terms acceptance', () => {
      render(
        <Checkbox
          label="I accept the terms and conditions"
          description="You must accept to continue"
          required
        />
      );
      expect(screen.getByLabelText(/I accept the terms/)).toBeInTheDocument();
      expect(screen.getByText('You must accept to continue')).toBeInTheDocument();
    });

    it('should work with validation error', () => {
      render(<Checkbox label="Subscribe" error errorMessage="You must check this box" />);
      expect(screen.getByText('You must check this box')).toBeInTheDocument();
    });

    it('should work in a list', () => {
      const options = ['Option 1', 'Option 2', 'Option 3'];
      render(
        <div>
          {options.map((option) => (
            <Checkbox key={option} label={option} />
          ))}
        </div>
      );
      options.forEach((option) => {
        expect(screen.getByLabelText(option)).toBeInTheDocument();
      });
    });
  });

  describe('Base Styles', () => {
    it('should have checkbox-base class', () => {
      const { container } = render(<Checkbox />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass('checkbox-base');
    });
  });
});
