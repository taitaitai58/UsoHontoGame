/**
 * VisuallyHidden Component
 * Feature: 009-apple-hig-ui-redesign - Phase 7: Accessibility
 * Hide content visually but keep it accessible to screen readers
 */

'use client';

import { type HTMLAttributes, type ReactNode } from 'react';
import { classNames } from '@/lib/design-system/classNames';

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
  /** Content to hide visually */
  children: ReactNode;
  /** Render as different HTML element */
  as?: 'span' | 'div' | 'p';
  /** Custom className */
  className?: string;
}

/**
 * VisuallyHidden Component
 *
 * Hides content visually while keeping it accessible to screen readers.
 * Useful for providing additional context for assistive technologies.
 *
 * @example
 * ```tsx
 * <button>
 *   <Icon name="close" />
 *   <VisuallyHidden>Close dialog</VisuallyHidden>
 * </button>
 * ```
 *
 * @example
 * ```tsx
 * <VisuallyHidden as="div">
 *   This text is hidden visually but read by screen readers
 * </VisuallyHidden>
 * ```
 */
export function VisuallyHidden({
  children,
  as: Component = 'span',
  className,
  ...props
}: VisuallyHiddenProps) {
  const visuallyHiddenClassName = classNames('sr-only', className);

  return (
    <Component className={visuallyHiddenClassName} {...props}>
      {children}
    </Component>
  );
}
