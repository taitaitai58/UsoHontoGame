/**
 * Tests for Select component
 * Feature: 009-apple-hig-ui-redesign
 * Apple HIG-compliant select/dropdown with variants and states
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from './Select';

describe('Select', () => {
  const mockOptions = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ];

  describe('Rendering', () => {
    it('should render select element', () => {
      render(<Select options={mockOptions} />);
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<Select options={mockOptions} placeholder="Select option" />);
      expect(screen.getByText('Select option')).toBeInTheDocument();
    });

    it('should render all options', () => {
      render(<Select options={mockOptions} />);
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.options).toHaveLength(3);
    });

    it('should render with label', () => {
      render(<Select options={mockOptions} label="Choose" />);
      expect(screen.getByLabelText('Choose')).toBeInTheDocument();
    });

    it('should render with helper text', () => {
      render(<Select options={mockOptions} helperText="Select an option" />);
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('should select an option', () => {
      const onChange = vi.fn();
      render(<Select options={mockOptions} onChange={onChange} />);
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: '2' } });
      expect(onChange).toHaveBeenCalled();
    });

    it('should have correct value when controlled', () => {
      render(<Select options={mockOptions} value="2" onChange={() => {}} />);
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('2');
    });

    it('should have default value', () => {
      render(<Select options={mockOptions} defaultValue="3" />);
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('3');
    });
  });

  describe('Sizes', () => {
    it('should apply sm size class', () => {
      const { container } = render(<Select options={mockOptions} size="sm" />);
      const select = container.querySelector('select');
      expect(select).toHaveClass('select-sm');
    });

    it('should apply md size class (default)', () => {
      const { container } = render(<Select options={mockOptions} size="md" />);
      const select = container.querySelector('select');
      expect(select).toHaveClass('select-md');
    });

    it('should apply lg size class', () => {
      const { container } = render(<Select options={mockOptions} size="lg" />);
      const select = container.querySelector('select');
      expect(select).toHaveClass('select-lg');
    });
  });

  describe('Variants', () => {
    it('should apply default variant', () => {
      const { container } = render(<Select options={mockOptions} variant="default" />);
      const select = container.querySelector('select');
      expect(select).toHaveClass('select-default');
    });

    it('should apply filled variant', () => {
      const { container } = render(<Select options={mockOptions} variant="filled" />);
      const select = container.querySelector('select');
      expect(select).toHaveClass('select-filled');
    });

    it('should apply outlined variant', () => {
      const { container } = render(<Select options={mockOptions} variant="outlined" />);
      const select = container.querySelector('select');
      expect(select).toHaveClass('select-outlined');
    });
  });

  describe('States', () => {
    it('should apply error state', () => {
      const { container } = render(
        <Select options={mockOptions} error errorMessage="Invalid selection" />
      );
      const select = container.querySelector('select');
      expect(select).toHaveClass('select-error');
      expect(screen.getByText('Invalid selection')).toBeInTheDocument();
    });

    it('should not show error message without error prop', () => {
      render(<Select options={mockOptions} errorMessage="Error message" />);
      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
    });

    it('should be disabled', () => {
      render(<Select options={mockOptions} disabled />);
      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
    });

    it('should apply disabled class', () => {
      const { container } = render(<Select options={mockOptions} disabled />);
      const select = container.querySelector('select');
      expect(select).toHaveClass('select-disabled');
    });

    it('should be required', () => {
      render(<Select options={mockOptions} required />);
      const select = screen.getByRole('combobox');
      expect(select).toBeRequired();
    });
  });

  describe('Accessibility', () => {
    it('should have proper id when provided', () => {
      render(<Select options={mockOptions} id="country" />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('id', 'country');
    });

    it('should link label to select with htmlFor', () => {
      render(<Select options={mockOptions} id="country" label="Country" />);
      const label = screen.getByText('Country');
      expect(label).toHaveAttribute('for', 'country');
    });

    it('should have aria-label when provided', () => {
      render(<Select options={mockOptions} aria-label="Choose option" />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-label', 'Choose option');
    });

    it('should have aria-invalid when error', () => {
      render(<Select options={mockOptions} error />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-describedby with helper text', () => {
      render(<Select options={mockOptions} id="test" helperText="Helper" />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-describedby', 'test-helper');
    });

    it('should have aria-describedby with error message', () => {
      render(<Select options={mockOptions} id="test" error errorMessage="Error" />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-describedby', 'test-error');
    });
  });

  describe('Custom Classes', () => {
    it('should merge custom className', () => {
      const { container } = render(<Select options={mockOptions} className="custom-select" />);
      const select = container.querySelector('select');
      expect(select).toHaveClass('custom-select');
      expect(select).toHaveClass('select-base');
    });
  });

  describe('Option Groups', () => {
    const groupedOptions = [
      { value: '1', label: 'Option 1', group: 'Group A' },
      { value: '2', label: 'Option 2', group: 'Group A' },
      { value: '3', label: 'Option 3', group: 'Group B' },
    ];

    it('should render optgroups', () => {
      const { container } = render(<Select options={groupedOptions} />);
      const optgroups = container.querySelectorAll('optgroup');
      expect(optgroups).toHaveLength(2);
    });

    it('should have correct optgroup labels', () => {
      const { container } = render(<Select options={groupedOptions} />);
      const groupA = container.querySelector('optgroup[label="Group A"]');
      const groupB = container.querySelector('optgroup[label="Group B"]');
      expect(groupA).toBeInTheDocument();
      expect(groupB).toBeInTheDocument();
    });
  });

  describe('Disabled Options', () => {
    const optionsWithDisabled = [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2', disabled: true },
      { value: '3', label: 'Option 3' },
    ];

    it('should render disabled option', () => {
      const { container } = render(<Select options={optionsWithDisabled} />);
      const option2 = container.querySelector('option[value="2"]');
      expect(option2).toBeDisabled();
    });

    it('should render enabled options', () => {
      const { container } = render(<Select options={optionsWithDisabled} />);
      const option1 = container.querySelector('option[value="1"]');
      const option3 = container.querySelector('option[value="3"]');
      expect(option1).not.toBeDisabled();
      expect(option3).not.toBeDisabled();
    });
  });

  describe('Real-world Use Cases', () => {
    it('should work as country selector', () => {
      const countries = [
        { value: 'us', label: 'United States' },
        { value: 'uk', label: 'United Kingdom' },
        { value: 'jp', label: 'Japan' },
      ];
      render(
        <Select options={countries} label="Country" placeholder="Select a country" required />
      );
      expect(screen.getByLabelText(/Country/)).toBeInTheDocument();
      expect(screen.getByText('Select a country')).toBeInTheDocument();
    });

    it('should work as category selector with groups', () => {
      const categories = [
        { value: 'apple', label: 'Apple', group: 'Fruits' },
        { value: 'banana', label: 'Banana', group: 'Fruits' },
        { value: 'carrot', label: 'Carrot', group: 'Vegetables' },
      ];
      render(<Select options={categories} label="Category" />);
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('should work with validation error', () => {
      render(
        <Select
          options={mockOptions}
          label="Required Field"
          error
          errorMessage="This field is required"
          required
        />
      );
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });

  describe('Base Styles', () => {
    it('should have select-base class', () => {
      const { container } = render(<Select options={mockOptions} />);
      const select = container.querySelector('select');
      expect(select).toHaveClass('select-base');
    });
  });
});
