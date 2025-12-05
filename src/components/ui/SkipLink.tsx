/**
 * SkipLink Component
 * Feature: 009-apple-hig-ui-redesign - Phase 7: Accessibility
 * Allow keyboard users to skip to main content
 */

'use client';

import { type HTMLAttributes } from 'react';
import { classNames } from '@/lib/design-system/classNames';

export interface SkipLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  /** Target element ID to skip to */
  targetId: string;
  /** Link text */
  children: string;
  /** Custom className */
  className?: string;
}

/**
 * SkipLink Component
 *
 * Provides a keyboard-accessible link to skip to main content.
 * Hidden by default, visible on focus for keyboard users.
 *
 * @example
 * ```tsx
 * <SkipLink targetId="main-content">Skip to main content</SkipLink>
 * ```
 */
export function SkipLink({ targetId, children, className, ...props }: SkipLinkProps) {
  const skipLinkClassName = classNames(
    'skip-link',
    'sr-only',
    'focus:not-sr-only',
    'focus:absolute',
    'focus:top-4',
    'focus:left-4',
    'focus:z-[1000]',
    'focus:px-4',
    'focus:py-2',
    'focus:bg-blue-600',
    'focus:text-white',
    'focus:rounded-md',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'focus:ring-offset-2',
    'transition-all',
    'duration-150',
    className
  );

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a href={`#${targetId}`} onClick={handleClick} className={skipLinkClassName} {...props}>
      {children}
    </a>
  );
}
