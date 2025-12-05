/**
 * Pagination Component
 * Feature: 009-apple-hig-ui-redesign - Phase 6: US4
 * Apple HIG-compliant pagination with keyboard navigation
 */

'use client';

import { classNames } from '@/lib/design-system/classNames';

export interface PaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Number of page buttons to show */
  siblingCount?: number;
  /** Custom className */
  className?: string;
}

/**
 * Pagination Component
 *
 * Keyboard-accessible pagination with ellipsis for large page counts.
 *
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={3}
 *   totalPages={10}
 *   onPageChange={(page) => console.log(page)}
 * />
 * ```
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}: PaginationProps) {
  const getPageNumbers = (): (number | string)[] => {
    const totalNumbers = siblingCount * 2 + 3; // siblings + first + last + current
    const totalBlocks = totalNumbers + 2; // + 2 ellipsis

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftEllipsis = leftSiblingIndex > 2;
    const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

    if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, '...', totalPages];
    }

    if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [1, '...', ...rightRange];
    }

    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [1, '...', ...middleRange, '...', totalPages];
  };

  const pages = getPageNumbers();

  const buttonClassName = (page: number | string) =>
    classNames(
      'pagination-button',
      'min-w-[44px] h-[44px]',
      'flex items-center justify-center',
      'rounded-md',
      'text-sm font-medium',
      'transition-colors duration-150',
      'focus:outline-none focus:ring-2 focus:ring-blue-500',
      typeof page === 'number' && page === currentPage
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
      typeof page === 'string' && 'cursor-default'
    );

  const arrowButtonClassName = (disabled: boolean) =>
    classNames(
      'pagination-arrow',
      'min-w-[44px] h-[44px]',
      'flex items-center justify-center',
      'rounded-md',
      'text-sm font-medium',
      'transition-colors duration-150',
      'focus:outline-none focus:ring-2 focus:ring-blue-500',
      disabled
        ? 'text-gray-400 cursor-not-allowed'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    );

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number' && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav
      className={classNames('pagination-wrapper', 'flex items-center gap-2', className)}
      role="navigation"
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={arrowButtonClassName(currentPage === 1)}
        aria-label="Previous page"
      >
        ←
      </button>

      {pages.map((page, index) => (
        <button
          key={`page-${index}`}
          type="button"
          onClick={() => handlePageClick(page)}
          disabled={typeof page === 'string'}
          className={buttonClassName(page)}
          aria-label={typeof page === 'number' ? `Go to page ${page}` : undefined}
          aria-current={typeof page === 'number' && page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={arrowButtonClassName(currentPage === totalPages)}
        aria-label="Next page"
      >
        →
      </button>
    </nav>
  );
}
