/**
 * Checkbox Component
 * Feature: 009-apple-hig-ui-redesign - Extensions
 * Apple HIG-compliant checkbox with variants and states
 */

'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { classNames } from '@/lib/design-system/classNames';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: string;
  description?: string;
  error?: boolean;
  errorMessage?: string;
  size?: CheckboxSize;
  className?: string;
}

/**
 * Checkbox Component
 *
 * Apple HIG-compliant checkbox with proper styling and accessibility.
 * Supports label, description, validation states, and size variants.
 *
 * @example
 * ```tsx
 * <Checkbox
 *   label="Accept terms"
 *   description="You must accept to continue"
 *   required
 * />
 * ```
 *
 * @example
 * ```tsx
 * <Checkbox
 *   label="Subscribe to newsletter"
 *   defaultChecked
 *   size="lg"
 * />
 * ```
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    description,
    error = false,
    errorMessage,
    size = 'md',
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
  const checkboxId = id || `checkbox-${randomId}`;
  const descriptionId = description ? `${checkboxId}-description` : undefined;
  const errorId = error && errorMessage ? `${checkboxId}-error` : undefined;
  const describedBy = errorId || descriptionId || ariaDescribedBy;

  const sizeStyles = {
    sm: classNames('checkbox-sm', 'w-4 h-4'),
    md: classNames('checkbox-md', 'w-5 h-5'),
    lg: classNames('checkbox-lg', 'w-6 h-6'),
  };

  const baseStyles = classNames(
    'checkbox-base',
    'rounded',
    'border-2',
    'border-gray-300 dark:border-gray-600',
    'bg-white dark:bg-gray-800',
    'text-blue-600 dark:text-blue-400',
    'focus:ring-2 focus:ring-blue-500 focus:ring-offset-0',
    'transition-colors duration-150',
    'cursor-pointer'
  );

  const stateStyles = classNames(
    error && 'checkbox-error border-red-500',
    disabled && 'checkbox-disabled cursor-not-allowed opacity-60'
  );

  const checkboxClassName = classNames(baseStyles, sizeStyles[size], stateStyles, className);

  return (
    <div className="checkbox-wrapper">
      <div className="flex items-start gap-2">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={checkboxClassName}
          disabled={disabled}
          required={required}
          aria-label={ariaLabel}
          aria-invalid={error}
          aria-describedby={describedBy}
          {...props}
        />

        {label && (
          <div className="flex-1">
            <label
              htmlFor={checkboxId}
              className={classNames(
                'checkbox-label',
                'block text-sm font-medium text-gray-700 dark:text-gray-300',
                disabled && 'opacity-60 cursor-not-allowed',
                !disabled && 'cursor-pointer'
              )}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {description && !error && (
              <p
                id={descriptionId}
                className="checkbox-description mt-1 text-sm text-gray-500 dark:text-gray-400"
              >
                {description}
              </p>
            )}

            {error && errorMessage && (
              <p
                id={errorId}
                className="checkbox-error-text mt-1 text-sm text-red-600 dark:text-red-400"
              >
                {errorMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
