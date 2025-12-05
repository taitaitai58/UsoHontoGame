/**
 * Typography Component
 * Feature: 009-apple-hig-ui-redesign - Phase 3: US1
 * Apple HIG-compliant typography with semantic variants
 */

'use client';

import { type HTMLAttributes, type ReactNode } from 'react';
import { classNames } from '@/lib/design-system/classNames';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body'
  | 'bodyLarge'
  | 'bodySmall'
  | 'caption'
  | 'overline';
export type TypographyWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type TypographyAlign = 'left' | 'center' | 'right';

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  /** Typography variant */
  variant?: TypographyVariant;
  /** Font weight */
  weight?: TypographyWeight;
  /** Text alignment */
  align?: TypographyAlign;
  /** Children content */
  children: ReactNode;
  /** Render as different HTML element */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  /** Custom className */
  className?: string;
}

/**
 * Typography Component
 *
 * Provides consistent typography across the application following Apple HIG.
 * Uses SF Pro-inspired system font stack with proper sizing and spacing.
 *
 * @example
 * ```tsx
 * <Typography variant="h1">Page Title</Typography>
 * <Typography variant="body" weight="medium">Body text</Typography>
 * <Typography variant="caption" as="span">Small caption</Typography>
 * ```
 */
export function Typography({
  variant = 'body',
  weight = 'regular',
  align = 'left',
  children,
  as,
  className,
  ...props
}: TypographyProps) {
  // Determine semantic HTML element
  const defaultElement: Record<TypographyVariant, string> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    body: 'p',
    bodyLarge: 'p',
    bodySmall: 'p',
    caption: 'span',
    overline: 'span',
  };

  const Component = (as || defaultElement[variant]) as any;

  // Typography variant styles (Apple HIG scale)
  const variantStyles: Record<TypographyVariant, string> = {
    h1: 'text-4xl leading-tight', // 36px
    h2: 'text-3xl leading-tight', // 30px
    h3: 'text-2xl leading-snug', // 24px
    h4: 'text-xl leading-snug', // 20px
    h5: 'text-lg leading-normal', // 18px
    h6: 'text-base leading-normal', // 16px
    body: 'text-base leading-relaxed', // 16px
    bodyLarge: 'text-lg leading-relaxed', // 18px
    bodySmall: 'text-sm leading-relaxed', // 14px
    caption: 'text-xs leading-normal', // 12px
    overline: 'text-xs uppercase tracking-wider leading-normal', // 12px
  };

  // Weight styles
  const weightStyles: Record<TypographyWeight, string> = {
    regular: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  // Alignment styles
  const alignStyles: Record<TypographyAlign, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  // Default weights for headings
  const defaultWeights: Partial<Record<TypographyVariant, TypographyWeight>> = {
    h1: 'bold',
    h2: 'bold',
    h3: 'semibold',
    h4: 'semibold',
    h5: 'medium',
    h6: 'medium',
  };

  const effectiveWeight =
    variant.startsWith('h') && weight === 'regular' ? defaultWeights[variant] || weight : weight;

  const typographyClassName = classNames(
    'typography-base',
    `typography-${variant}`,
    variantStyles[variant],
    weightStyles[effectiveWeight],
    alignStyles[align],
    'text-gray-900 dark:text-gray-100',
    className
  );

  return (
    <Component className={typographyClassName} {...props}>
      {children}
    </Component>
  );
}
