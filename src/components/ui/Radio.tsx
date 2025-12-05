/**
 * Radio Component
 * Feature: 009-apple-hig-ui-redesign - Extensions
 * Apple HIG-compliant radio button with groups
 */

'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { classNames } from '@/lib/design-system/classNames';

export type RadioSize = 'sm' | 'md' | 'lg';
export type RadioLayout = 'vertical' | 'horizontal';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: string;
  description?: string;
  size?: RadioSize;
  className?: string;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  size?: RadioSize;
  layout?: RadioLayout;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  'aria-label'?: string;
  className?: string;
}

/**
 * Radio Component
 *
 * Individual radio button with label and description support.
 *
 * @example
 * ```tsx
 * <Radio
 *   name="option"
 *   value="1"
 *   label="Option 1"
 *   description="Description"
 * />
 * ```
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    label,
    description,
    size = 'md',
    className,
    id,
    disabled = false,
    required = false,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref
) {
  const randomId = Math.random().toString(36).substr(2, 9);
  const radioId = id || `radio-${randomId}`;
  const descriptionId = description ? `${radioId}-description` : undefined;
  const describedBy = descriptionId || ariaDescribedBy;

  const sizeStyles = {
    sm: classNames('radio-sm', 'w-4 h-4'),
    md: classNames('radio-md', 'w-5 h-5'),
    lg: classNames('radio-lg', 'w-6 h-6'),
  };

  const baseStyles = classNames(
    'radio-base',
    'rounded-full',
    'border-2',
    'border-gray-300 dark:border-gray-600',
    'bg-white dark:bg-gray-800',
    'text-blue-600 dark:text-blue-400',
    'focus:ring-2 focus:ring-blue-500 focus:ring-offset-0',
    'transition-colors duration-150',
    'cursor-pointer'
  );

  const stateStyles = classNames(disabled && 'radio-disabled cursor-not-allowed opacity-60');

  const radioClassName = classNames(baseStyles, sizeStyles[size], stateStyles, className);

  return (
    <div className="radio-wrapper">
      <div className="flex items-start gap-2">
        <input
          ref={ref}
          type="radio"
          id={radioId}
          className={radioClassName}
          disabled={disabled}
          required={required}
          aria-describedby={describedBy}
          {...props}
        />

        {label && (
          <div className="flex-1">
            <label
              htmlFor={radioId}
              className={classNames(
                'radio-label',
                'block text-sm font-medium text-gray-700 dark:text-gray-300',
                disabled && 'opacity-60 cursor-not-allowed',
                !disabled && 'cursor-pointer'
              )}
            >
              {label}
            </label>

            {description && (
              <p
                id={descriptionId}
                className="radio-description mt-1 text-sm text-gray-500 dark:text-gray-400"
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

/**
 * RadioGroup Component
 *
 * Group of radio buttons with shared state and validation.
 *
 * @example
 * ```tsx
 * <RadioGroup
 *   name="option"
 *   label="Choose option"
 *   options={[
 *     { value: '1', label: 'Option 1' },
 *     { value: '2', label: 'Option 2' }
 *   ]}
 *   defaultValue="1"
 * />
 * ```
 */
export function RadioGroup({
  name,
  options,
  value,
  defaultValue,
  onChange,
  label,
  helperText,
  error = false,
  errorMessage,
  size = 'md',
  layout = 'vertical',
  disabled = false,
  required = false,
  id,
  'aria-label': ariaLabel,
  className,
}: RadioGroupProps) {
  const randomId = Math.random().toString(36).substr(2, 9);
  const groupId = id || `radiogroup-${randomId}`;
  const labelId = label ? `${groupId}-label` : undefined;
  const helperId = helperText ? `${groupId}-helper` : undefined;
  const errorId = error && errorMessage ? `${groupId}-error` : undefined;

  const layoutStyles = {
    vertical: 'flex-col gap-3',
    horizontal: 'flex-row flex-wrap gap-4',
  };

  const handleChange = (optionValue: string) => {
    if (onChange) {
      onChange(optionValue);
    }
  };

  return (
    <div className={classNames('radiogroup-wrapper', 'w-full', className)}>
      {label && (
        <label
          id={labelId}
          className="radiogroup-label block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        role="radiogroup"
        aria-labelledby={labelId}
        aria-label={ariaLabel}
        className={classNames('radiogroup-options', 'flex', layoutStyles[layout])}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            description={option.description}
            size={size}
            disabled={disabled || option.disabled}
            required={required}
            checked={value !== undefined ? value === option.value : undefined}
            defaultChecked={defaultValue === option.value}
            onChange={(e) => e.target.checked && handleChange(option.value)}
            aria-invalid={error}
          />
        ))}
      </div>

      {helperText && !error && (
        <p
          id={helperId}
          className="radiogroup-helper-text mt-2 text-sm text-gray-500 dark:text-gray-400"
        >
          {helperText}
        </p>
      )}

      {error && errorMessage && (
        <p
          id={errorId}
          className="radiogroup-error-text mt-2 text-sm text-red-600 dark:text-red-400"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
