/**
 * Textarea Component
 * Feature: 009-apple-hig-ui-redesign - Extensions
 * Apple HIG-compliant textarea with variants and states
 */

'use client';

import { forwardRef, useState, type TextareaHTMLAttributes } from 'react';
import { classNames } from '@/lib/design-system/classNames';

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaVariant = 'default' | 'filled' | 'outlined';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  size?: TextareaSize;
  variant?: TextareaVariant;
  showCount?: boolean;
  resize?: boolean;
  className?: string;
}

/**
 * Textarea Component
 *
 * Apple HIG-compliant multi-line text input with validation and character count.
 *
 * @example
 * ```tsx
 * <Textarea
 *   label="Comment"
 *   placeholder="Enter your comment"
 *   maxLength={500}
 *   showCount
 *   rows={6}
 * />
 * ```
 *
 * @example
 * ```tsx
 * <Textarea
 *   label="Description"
 *   error
 *   errorMessage="Required field"
 *   required
 * />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    helperText,
    error = false,
    errorMessage,
    size = 'md',
    variant = 'default',
    showCount = false,
    resize = true,
    className,
    id,
    disabled = false,
    required = false,
    readOnly = false,
    maxLength,
    rows = 4,
    value,
    defaultValue,
    onChange,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref
) {
  const [charCount, setCharCount] = useState(
    value ? String(value).length : defaultValue ? String(defaultValue).length : 0
  );

  const randomId = Math.random().toString(36).substr(2, 9);
  const textareaId = id || `textarea-${randomId}`;
  const helperId = helperText ? `${textareaId}-helper` : undefined;
  const errorId = error && errorMessage ? `${textareaId}-error` : undefined;
  const describedBy = errorId || helperId || ariaDescribedBy;

  const baseStyles = classNames(
    'textarea-base',
    'w-full',
    'rounded-md',
    'border',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0',
    'dark:bg-gray-800 dark:text-white',
    !resize && 'resize-none'
  );

  const sizeStyles = {
    sm: classNames('textarea-sm', 'px-3 py-1.5 text-sm'),
    md: classNames('textarea-md', 'px-4 py-2 text-base'),
    lg: classNames('textarea-lg', 'px-5 py-3 text-lg'),
  };

  const variantStyles = {
    default: classNames(
      'textarea-default',
      'bg-white',
      'border-gray-300 dark:border-gray-600',
      'hover:border-gray-400 dark:hover:border-gray-500'
    ),
    filled: classNames(
      'textarea-filled',
      'bg-gray-100 dark:bg-gray-700',
      'border-transparent',
      'hover:bg-gray-200 dark:hover:bg-gray-600'
    ),
    outlined: classNames(
      'textarea-outlined',
      'bg-transparent',
      'border-2 border-gray-400 dark:border-gray-500',
      'hover:border-gray-600 dark:hover:border-gray-400'
    ),
  };

  const stateStyles = classNames(
    error && 'textarea-error border-red-500 focus:ring-red-500',
    disabled && 'textarea-disabled bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-60'
  );

  const textareaClassName = classNames(
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    stateStyles,
    className
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length);
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="textarea-wrapper w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="textarea-label block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="textarea-container relative">
        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClassName}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          rows={rows}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-label={ariaLabel}
          aria-invalid={error}
          aria-describedby={describedBy}
          {...props}
        />

        {showCount && maxLength && (
          <div className="textarea-count absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
            {charCount} / {maxLength}
          </div>
        )}
      </div>

      {helperText && !error && (
        <p
          id={helperId}
          className="textarea-helper-text mt-2 text-sm text-gray-500 dark:text-gray-400"
        >
          {helperText}
        </p>
      )}

      {error && errorMessage && (
        <p id={errorId} className="textarea-error-text mt-2 text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
});
