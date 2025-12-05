/**
 * Tests for Textarea component
 * Feature: 009-apple-hig-ui-redesign - Extensions
 * Apple HIG-compliant textarea with variants and states
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  describe('Rendering', () => {
    it('should render textarea element', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<Textarea placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should render with value', () => {
      render(<Textarea value="Test value" onChange={() => {}} />);
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Test value');
    });

    it('should render with label', () => {
      render(<Textarea label="Comment" />);
      expect(screen.getByLabelText('Comment')).toBeInTheDocument();
    });

    it('should render with helper text', () => {
      render(<Textarea helperText="Enter your comment" />);
      expect(screen.getByText('Enter your comment')).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('should apply sm size class', () => {
      const { container } = render(<Textarea size="sm" />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('textarea-sm');
    });

    it('should apply md size class (default)', () => {
      const { container } = render(<Textarea size="md" />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('textarea-md');
    });

    it('should apply lg size class', () => {
      const { container } = render(<Textarea size="lg" />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('textarea-lg');
    });
  });

  describe('Variants', () => {
    it('should apply default variant', () => {
      const { container } = render(<Textarea variant="default" />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('textarea-default');
    });

    it('should apply filled variant', () => {
      const { container } = render(<Textarea variant="filled" />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('textarea-filled');
    });

    it('should apply outlined variant', () => {
      const { container } = render(<Textarea variant="outlined" />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('textarea-outlined');
    });
  });

  describe('States', () => {
    it('should apply error state', () => {
      const { container } = render(<Textarea error errorMessage="Invalid input" />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('textarea-error');
      expect(screen.getByText('Invalid input')).toBeInTheDocument();
    });

    it('should not show error message without error prop', () => {
      render(<Textarea errorMessage="Error message" />);
      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
    });

    it('should be disabled', () => {
      render(<Textarea disabled />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    it('should apply disabled class', () => {
      const { container } = render(<Textarea disabled />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('textarea-disabled');
    });

    it('should be required', () => {
      render(<Textarea required />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeRequired();
    });

    it('should be readonly', () => {
      render(<Textarea readOnly />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('readonly');
    });
  });

  describe('Rows', () => {
    it('should have default rows', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.rows).toBe(4);
    });

    it('should accept custom rows', () => {
      render(<Textarea rows={10} />);
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.rows).toBe(10);
    });
  });

  describe('Character Count', () => {
    it('should show character count when maxLength is set', () => {
      render(<Textarea maxLength={100} showCount />);
      expect(screen.getByText('0 / 100')).toBeInTheDocument();
    });

    it('should update character count on input', () => {
      render(<Textarea maxLength={100} showCount />);
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Hello' } });
      expect(screen.getByText('5 / 100')).toBeInTheDocument();
    });

    it('should not show count without maxLength', () => {
      const { container } = render(<Textarea showCount />);
      const count = container.querySelector('.textarea-count');
      expect(count).not.toBeInTheDocument();
    });
  });

  describe('Event Handlers', () => {
    it('should call onChange when text changes', () => {
      const onChange = vi.fn();
      render(<Textarea onChange={onChange} />);
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'test' } });
      expect(onChange).toHaveBeenCalled();
    });

    it('should call onFocus when focused', () => {
      const onFocus = vi.fn();
      render(<Textarea onFocus={onFocus} />);
      const textarea = screen.getByRole('textbox');
      fireEvent.focus(textarea);
      expect(onFocus).toHaveBeenCalled();
    });

    it('should call onBlur when blurred', () => {
      const onBlur = vi.fn();
      render(<Textarea onBlur={onBlur} />);
      const textarea = screen.getByRole('textbox');
      fireEvent.blur(textarea);
      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper id when provided', () => {
      render(<Textarea id="comment" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('id', 'comment');
    });

    it('should link label to textarea', () => {
      render(<Textarea id="comment" label="Comment" />);
      const label = screen.getByText('Comment');
      expect(label).toHaveAttribute('for', 'comment');
    });

    it('should have aria-label when provided', () => {
      render(<Textarea aria-label="Feedback" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-label', 'Feedback');
    });

    it('should have aria-invalid when error', () => {
      render(<Textarea error />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-describedby with helper text', () => {
      render(<Textarea id="test" helperText="Helper" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'test-helper');
    });

    it('should have aria-describedby with error message', () => {
      render(<Textarea id="test" error errorMessage="Error" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'test-error');
    });
  });

  describe('Resize', () => {
    it('should be resizable by default', () => {
      const { container } = render(<Textarea />);
      const textarea = container.querySelector('textarea');
      expect(textarea).not.toHaveClass('resize-none');
    });

    it('should disable resize when specified', () => {
      const { container } = render(<Textarea resize={false} />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('resize-none');
    });
  });

  describe('Custom Classes', () => {
    it('should merge custom className', () => {
      const { container } = render(<Textarea className="custom-textarea" />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('custom-textarea');
      expect(textarea).toHaveClass('textarea-base');
    });
  });

  describe('Real-world Use Cases', () => {
    it('should work as comment field', () => {
      render(
        <Textarea
          label="Comment"
          placeholder="Enter your comment"
          maxLength={500}
          showCount
          rows={6}
          required
        />
      );
      expect(screen.getByLabelText(/Comment/)).toBeInTheDocument();
      expect(screen.getByText('0 / 500')).toBeInTheDocument();
    });

    it('should work as feedback form', () => {
      render(
        <Textarea
          label="Feedback"
          helperText="Tell us what you think"
          placeholder="Your feedback..."
          rows={8}
        />
      );
      expect(screen.getByPlaceholderText('Your feedback...')).toBeInTheDocument();
    });

    it('should work with validation error', () => {
      render(
        <Textarea label="Description" error errorMessage="Description is required" required />
      );
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });
  });

  describe('Base Styles', () => {
    it('should have textarea-base class', () => {
      const { container } = render(<Textarea />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('textarea-base');
    });
  });
});
