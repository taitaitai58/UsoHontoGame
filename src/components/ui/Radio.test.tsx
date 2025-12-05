/**
 * Tests for Radio component
 * Feature: 009-apple-hig-ui-redesign - Extensions
 * Apple HIG-compliant radio button with groups
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Radio, RadioGroup } from './Radio';

describe('Radio', () => {
  describe('Rendering', () => {
    it('should render radio element', () => {
      render(<Radio value="option1" />);
      const radio = screen.getByRole('radio');
      expect(radio).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Radio value="option1" label="Option 1" />);
      expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
    });

    it('should render with description', () => {
      render(<Radio value="option1" label="Option 1" description="Description text" />);
      expect(screen.getByText('Description text')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('should be unchecked by default', () => {
      render(<Radio value="option1" />);
      const radio = screen.getByRole('radio') as HTMLInputElement;
      expect(radio.checked).toBe(false);
    });

    it('should be checked when defaultChecked', () => {
      render(<Radio value="option1" defaultChecked />);
      const radio = screen.getByRole('radio') as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });

    it('should be disabled', () => {
      render(<Radio value="option1" disabled />);
      const radio = screen.getByRole('radio');
      expect(radio).toBeDisabled();
    });

    it('should be required', () => {
      render(<Radio value="option1" required />);
      const radio = screen.getByRole('radio');
      expect(radio).toBeRequired();
    });
  });

  describe('Interaction', () => {
    it('should call onChange when clicked', () => {
      const onChange = vi.fn();
      render(<Radio value="option1" onChange={onChange} />);
      const radio = screen.getByRole('radio');
      fireEvent.click(radio);
      expect(onChange).toHaveBeenCalled();
    });

    it('should not call onChange when disabled', () => {
      const onChange = vi.fn();
      render(<Radio value="option1" disabled onChange={onChange} />);
      const radio = screen.getByRole('radio');
      fireEvent.click(radio);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Sizes', () => {
    it('should apply sm size class', () => {
      const { container } = render(<Radio value="1" size="sm" />);
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass('radio-sm');
    });

    it('should apply md size class (default)', () => {
      const { container } = render(<Radio value="1" size="md" />);
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass('radio-md');
    });

    it('should apply lg size class', () => {
      const { container } = render(<Radio value="1" size="lg" />);
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass('radio-lg');
    });
  });

  describe('Accessibility', () => {
    it('should have proper id when provided', () => {
      render(<Radio value="1" id="option1" />);
      const radio = screen.getByRole('radio');
      expect(radio).toHaveAttribute('id', 'option1');
    });

    it('should link label to radio', () => {
      render(<Radio value="1" id="option1" label="Option 1" />);
      const label = screen.getByText('Option 1');
      expect(label).toHaveAttribute('for', 'option1');
    });

    it('should have aria-describedby with description', () => {
      render(<Radio value="1" id="option1" description="Description" />);
      const radio = screen.getByRole('radio');
      expect(radio).toHaveAttribute('aria-describedby', 'option1-description');
    });
  });

  describe('Base Styles', () => {
    it('should have radio-base class', () => {
      const { container } = render(<Radio value="1" />);
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass('radio-base');
    });
  });
});

describe('RadioGroup', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  describe('Rendering', () => {
    it('should render all options', () => {
      render(<RadioGroup name="test" options={options} />);
      expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Option 3')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<RadioGroup name="test" label="Choose option" options={options} />);
      expect(screen.getByText('Choose option')).toBeInTheDocument();
    });

    it('should render with helper text', () => {
      render(<RadioGroup name="test" helperText="Select one option" options={options} />);
      expect(screen.getByText('Select one option')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('should have default value selected', () => {
      render(<RadioGroup name="test" defaultValue="option2" options={options} />);
      const radio = screen.getByLabelText('Option 2') as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });

    it('should call onChange with selected value', () => {
      const onChange = vi.fn();
      render(<RadioGroup name="test" options={options} onChange={onChange} />);
      const radio = screen.getByLabelText('Option 2');
      fireEvent.click(radio);
      expect(onChange).toHaveBeenCalled();
    });

    it('should be controlled with value prop', () => {
      render(<RadioGroup name="test" value="option3" onChange={() => {}} options={options} />);
      const radio = screen.getByLabelText('Option 3') as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });
  });

  describe('Error State', () => {
    it('should show error message', () => {
      render(<RadioGroup name="test" error errorMessage="Required field" options={options} />);
      expect(screen.getByText('Required field')).toBeInTheDocument();
    });

    it('should apply error state to all radios', () => {
      const { container } = render(<RadioGroup name="test" error options={options} />);
      const radios = container.querySelectorAll('input[type="radio"]');
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('Disabled State', () => {
    it('should disable all radios', () => {
      render(<RadioGroup name="test" disabled options={options} />);
      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toBeDisabled();
      });
    });

    it('should disable specific option', () => {
      const optionsWithDisabled = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2', disabled: true },
        { value: 'option3', label: 'Option 3' },
      ];
      render(<RadioGroup name="test" options={optionsWithDisabled} />);
      const radio2 = screen.getByLabelText('Option 2');
      expect(radio2).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have radiogroup role', () => {
      render(<RadioGroup name="test" options={options} />);
      const group = screen.getByRole('radiogroup');
      expect(group).toBeInTheDocument();
    });

    it('should have aria-label when provided', () => {
      render(<RadioGroup name="test" aria-label="Options" options={options} />);
      const group = screen.getByRole('radiogroup');
      expect(group).toHaveAttribute('aria-label', 'Options');
    });

    it('should have aria-labelledby with label', () => {
      render(<RadioGroup name="test" id="test" label="Options" options={options} />);
      const group = screen.getByRole('radiogroup');
      expect(group).toHaveAttribute('aria-labelledby', 'test-label');
    });

    it('should have required attribute', () => {
      render(<RadioGroup name="test" required options={options} />);
      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toBeRequired();
      });
    });
  });

  describe('Layout', () => {
    it('should default to vertical layout', () => {
      const { container } = render(<RadioGroup name="test" options={options} />);
      const group = container.querySelector('[role="radiogroup"]');
      expect(group).toHaveClass('flex-col');
    });

    it('should support horizontal layout', () => {
      const { container } = render(
        <RadioGroup name="test" layout="horizontal" options={options} />
      );
      const group = container.querySelector('[role="radiogroup"]');
      expect(group).toHaveClass('flex-row');
    });
  });

  describe('Real-world Use Cases', () => {
    it('should work as survey question', () => {
      const surveyOptions = [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'maybe', label: 'Maybe' },
      ];
      render(
        <RadioGroup
          name="survey"
          label="Do you agree?"
          helperText="Select one option"
          options={surveyOptions}
          required
        />
      );
      expect(screen.getByText('Do you agree?')).toBeInTheDocument();
      expect(screen.getByLabelText('Yes')).toBeInTheDocument();
    });
  });
});
