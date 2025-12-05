/**
 * Spinner Component
 * Feature: 009-apple-hig-ui-redesign
 * Apple HIG-compliant loading spinner with variants and states
 */

'use client';

import { type HTMLAttributes } from 'react';
import { classNames } from '@/lib/design-system/classNames';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'secondary' | 'light' | 'dark';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /** Size of the spinner */
  size?: SpinnerSize;
  /** Color variant */
  variant?: SpinnerVariant;
  /** Optional text label below spinner */
  label?: string;
  /** Center the spinner */
  centered?: boolean;
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** Custom className */
  className?: string;
}

/**
 * Spinner Component
 *
 * Apple HIG-compliant loading indicator with size and color variants.
 * Provides proper accessibility attributes and optional text label.
 *
 * @example
 * ```tsx
 * <Spinner size="md" label="Loading..." />
 * ```
 *
 * @example
 * ```tsx
 * <Spinner size="lg" variant="primary" centered />
 * ```
 *
 * @example
 * ```tsx
 * <Spinner size="sm" variant="light" aria-label="Loading content" />
 * ```
 */
export function Spinner({
  size = 'md',
  variant = 'primary',
  label,
  centered = false,
  'aria-label': ariaLabel = 'Loading',
  className,
  ...props
}: SpinnerProps) {
  const sizeStyles = {
    sm: classNames('spinner-sm', 'w-4 h-4', 'border-2'),
    md: classNames('spinner-md', 'w-8 h-8', 'border-3'),
    lg: classNames('spinner-lg', 'w-12 h-12', 'border-4'),
    xl: classNames('spinner-xl', 'w-16 h-16', 'border-4'),
  };

  const variantStyles = {
    primary: classNames(
      'spinner-primary',
      'border-blue-600',
      'border-t-transparent',
      'dark:border-blue-400'
    ),
    secondary: classNames(
      'spinner-secondary',
      'border-gray-600',
      'border-t-transparent',
      'dark:border-gray-400'
    ),
    light: classNames('spinner-light', 'border-white', 'border-t-transparent'),
    dark: classNames(
      'spinner-dark',
      'border-gray-900',
      'border-t-transparent',
      'dark:border-gray-100'
    ),
  };

  const spinnerClassName = classNames(
    'spinner-base',
    'rounded-full',
    'animate-spin',
    sizeStyles[size],
    variantStyles[variant],
    className
  );

  const wrapperClassName = classNames(
    'spinner-wrapper',
    'inline-flex',
    'flex-col',
    'items-center',
    'gap-2',
    centered && 'flex justify-center items-center'
  );

  return (
    <div className={wrapperClassName}>
      <div
        role="status"
        aria-label={ariaLabel}
        aria-live="polite"
        className={spinnerClassName}
        {...props}
      />
      {label && (
        <p className="spinner-label text-sm text-gray-600 dark:text-gray-400 text-center">
          {label}
        </p>
      )}
    </div>
  );
}
