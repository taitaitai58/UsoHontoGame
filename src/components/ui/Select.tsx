/**
 * Select Component
 * Feature: 009-apple-hig-ui-redesign
 * Apple HIG-compliant select/dropdown with variants and states
 */

'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { classNames } from '@/lib/design-system/classNames';

export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectVariant = 'default' | 'filled' | 'outlined';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  size?: SelectSize;
  variant?: SelectVariant;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

/**
 * Select Component
 *
 * Apple HIG-compliant select/dropdown with proper styling and accessibility.
 * Supports option groups, disabled options, and various size/variant combinations.
 *
 * @example
 * ```tsx
 * <Select
 *   options={[
 *     { value: '1', label: 'Option 1' },
 *     { value: '2', label: 'Option 2' }
 *   ]}
 *   label="Choose"
 *   placeholder="Select option"
 * />
 * ```
 *
 * @example
 * ```tsx
 * <Select
 *   options={[
 *     { value: 'apple', label: 'Apple', group: 'Fruits' },
 *     { value: 'carrot', label: 'Carrot', group: 'Vegetables' }
 *   ]}
 *   size="lg"
 *   variant="outlined"
 * />
 * ```
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    helperText,
    error = false,
    errorMessage,
    size = 'md',
    variant = 'default',
    options,
    placeholder,
    className,
    id,
    disabled = false,
    required = false,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref
) {
  const randomId = Math.random().toString(36).substr(2, 9);
  const selectId = id || `select-${randomId}`;
  const helperId = helperText ? `${selectId}-helper` : undefined;
  const errorId = error && errorMessage ? `${selectId}-error` : undefined;
  const describedBy = errorId || helperId || ariaDescribedBy;

  const baseStyles = classNames(
    'select-base',
    'w-full',
    'rounded-md',
    'border',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0',
    'dark:bg-gray-800 dark:text-white',
    'appearance-none',
    'bg-no-repeat',
    'pr-10'
  );

  const sizeStyles = {
    sm: classNames('select-sm', 'px-3 py-1.5 text-sm'),
    md: classNames('select-md', 'px-4 py-2 text-base'),
    lg: classNames('select-lg', 'px-5 py-3 text-lg'),
  };

  const variantStyles = {
    default: classNames(
      'select-default',
      'bg-white',
      'border-gray-300 dark:border-gray-600',
      'hover:border-gray-400 dark:hover:border-gray-500'
    ),
    filled: classNames(
      'select-filled',
      'bg-gray-100 dark:bg-gray-700',
      'border-transparent',
      'hover:bg-gray-200 dark:hover:bg-gray-600'
    ),
    outlined: classNames(
      'select-outlined',
      'bg-transparent',
      'border-2 border-gray-400 dark:border-gray-500',
      'hover:border-gray-600 dark:hover:border-gray-400'
    ),
  };

  const stateStyles = classNames(
    error && 'select-error border-red-500 focus:ring-red-500',
    disabled && 'select-disabled bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-60'
  );

  const selectClassName = classNames(
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    stateStyles,
    className
  );

  // Group options by group name
  const groupedOptions = options.reduce(
    (acc, option) => {
      const groupName = option.group || '__ungrouped__';
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(option);
      return acc;
    },
    {} as Record<string, SelectOption[]>
  );

  const hasGroups = Object.keys(groupedOptions).length > 1 || !groupedOptions.__ungrouped__;

  return (
    <div className="select-wrapper w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="select-label block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="select-container relative">
        <select
          ref={ref}
          id={selectId}
          className={selectClassName}
          disabled={disabled}
          required={required}
          aria-label={ariaLabel}
          aria-invalid={error}
          aria-describedby={describedBy}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {hasGroups
            ? Object.entries(groupedOptions).map(([groupName, groupOptions]) => {
                if (groupName === '__ungrouped__') {
                  return groupOptions.map((option) => (
                    <option key={option.value} value={option.value} disabled={option.disabled}>
                      {option.label}
                    </option>
                  ));
                }
                return (
                  <optgroup key={groupName} label={groupName}>
                    {groupOptions.map((option) => (
                      <option key={option.value} value={option.value} disabled={option.disabled}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                );
              })
            : options.map((option) => (
                <option key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </option>
              ))}
        </select>

        {/* Dropdown Arrow */}
        <div className="select-arrow absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {helperText && !error && (
        <p
          id={helperId}
          className="select-helper-text mt-2 text-sm text-gray-500 dark:text-gray-400"
        >
          {helperText}
        </p>
      )}

      {error && errorMessage && (
        <p id={errorId} className="select-error-text mt-2 text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
});
