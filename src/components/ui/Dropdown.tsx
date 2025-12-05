/**
 * Dropdown Component
 * Feature: 009-apple-hig-ui-redesign - Phase 5: US3
 * Apple HIG-compliant dropdown with elevation
 */

'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { classNames } from '@/lib/design-system/classNames';
import { getElevationClassName } from '@/lib/design-system/elevation';

export interface DropdownItem {
  id: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface DropdownProps {
  /** Trigger element */
  trigger: ReactNode;
  /** Dropdown menu items */
  items: DropdownItem[];
  /** Alignment of dropdown */
  align?: 'left' | 'right';
  /** Custom className */
  className?: string;
}

/**
 * Dropdown Component
 *
 * Elevated dropdown menu with smooth animations.
 *
 * @example
 * ```tsx
 * <Dropdown
 *   trigger={<Button>Menu</Button>}
 *   items={[
 *     { id: '1', label: 'Edit', onClick: () => {} },
 *     { id: '2', label: 'Delete', onClick: () => {} }
 *   ]}
 * />
 * ```
 */
export function Dropdown({ trigger, items, align = 'left', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const alignmentStyles = {
    left: 'left-0',
    right: 'right-0',
  };

  const menuClassName = classNames(
    'dropdown-menu',
    'absolute top-full mt-2',
    'min-w-[200px]',
    'bg-white dark:bg-gray-800',
    'rounded-lg',
    'py-2',
    'border border-gray-200 dark:border-gray-700',
    getElevationClassName({ level: 'elevated', zIndex: 'dropdown' }),
    'transition-all duration-200',
    isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none',
    alignmentStyles[align]
  );

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={classNames('dropdown-wrapper', 'relative inline-block', className)}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
      </div>

      <div className={menuClassName} role="menu">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            className={classNames(
              'dropdown-item',
              'w-full',
              'flex items-center gap-3',
              'px-4 py-2',
              'text-left text-sm',
              'text-gray-700 dark:text-gray-300',
              !item.disabled && 'hover:bg-gray-100 dark:hover:bg-gray-700',
              item.disabled && 'opacity-50 cursor-not-allowed',
              'transition-colors duration-150'
            )}
            role="menuitem"
          >
            {item.icon && <span className="dropdown-item-icon">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
