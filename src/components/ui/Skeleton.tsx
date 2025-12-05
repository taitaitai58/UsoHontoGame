/**
 * Skeleton Component
 * Feature: 009-apple-hig-ui-redesign - Phase 6: US4
 * Apple HIG-compliant loading skeleton
 */

'use client';

import { type HTMLAttributes } from 'react';
import { classNames } from '@/lib/design-system/classNames';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Skeleton variant */
  variant?: SkeletonVariant;
  /** Width (CSS value) */
  width?: string | number;
  /** Height (CSS value) */
  height?: string | number;
  /** Custom className */
  className?: string;
}

/**
 * Skeleton Component
 *
 * Loading placeholder with subtle animation.
 *
 * @example
 * ```tsx
 * <Skeleton variant="text" width="200px" />
 * <Skeleton variant="circular" width={40} height={40} />
 * <Skeleton variant="rectangular" height="100px" />
 * ```
 */
export function Skeleton({ variant = 'text', width, height, className, ...props }: SkeletonProps) {
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const skeletonClassName = classNames(
    'skeleton-base',
    `skeleton-${variant}`,
    'bg-gray-200 dark:bg-gray-700',
    'animate-pulse',
    variantStyles[variant],
    className
  );

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return <div className={skeletonClassName} style={style} {...props} />;
}
