/**
 * Design System Component Exports
 * Feature: 009-apple-hig-ui-redesign
 * Main entry point for all UI components
 */

// Core UI Components
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './Button';
export { Card, type CardProps } from './Card';
export { Badge, type BadgeProps, type BadgeVariant, type BadgeSize } from './Badge';
export { Typography, type TypographyProps, type TypographyVariant } from './Typography';

// Form Components
export { Input, type InputProps, type InputSize, type InputVariant, type InputType } from './Input';
export {
  Select,
  type SelectProps,
  type SelectOption,
  type SelectSize,
  type SelectVariant,
} from './Select';
export { Checkbox, type CheckboxProps, type CheckboxSize } from './Checkbox';
export {
  Radio,
  RadioGroup,
  type RadioProps,
  type RadioGroupProps,
  type RadioOption,
  type RadioSize,
} from './Radio';
export { Textarea, type TextareaProps, type TextareaSize, type TextareaVariant } from './Textarea';

// Feedback Components
export { Spinner, type SpinnerProps, type SpinnerSize, type SpinnerVariant } from './Spinner';
export { Modal, type ModalProps, type ModalSize } from './Modal';
export { Toast, type ToastProps, type ToastVariant } from './Toast';
export { Skeleton, type SkeletonProps, type SkeletonVariant } from './Skeleton';
export { EmptyState } from './EmptyState';

// Navigation Components
export { Dropdown, type DropdownProps, type DropdownItem } from './Dropdown';
export { Pagination, type PaginationProps } from './Pagination';

// Layout Components
export { Container, type ContainerProps, type ContainerSize } from './Container';
export { Stack } from './Stack';

// Accessibility Components
export { SkipLink, type SkipLinkProps } from './SkipLink';
export { VisuallyHidden, type VisuallyHiddenProps } from './VisuallyHidden';
export { AccessibilityProvider } from './AccessibilityProvider';

// Design System Utilities
export {
  getElevationClassName,
  getZIndex,
  type ElevationLevel,
  type ZIndexLevel,
  type ElevationOptions,
} from '@/lib/design-system/elevation';
export { classNames } from '@/lib/design-system/classNames';

// Animation Utilities
export { entrance, exit, hover, loading, durations, easings } from '@/lib/animations/transitions';

// Accessibility Utilities
export { createFocusTrap, getFocusableElements } from '@/lib/accessibility/focus-trap';
export { announce, cleanupAnnouncer } from '@/lib/accessibility/announcer';

// Responsive Utilities
export {
  breakpoints,
  getMediaQuery,
  matchesBreakpoint,
  getCurrentBreakpoint,
  type Breakpoint,
} from '@/lib/responsive/breakpoints';

// Hooks
export { useMediaQuery, useBreakpoint } from '@/hooks/useMediaQuery';
export {
  useAnimation,
  useScrollAnimation,
  useHoverAnimation,
  useFocusAnimation,
  useStaggerAnimation,
} from '@/hooks/useAnimation';
export { useLanguage } from '@/hooks/useLanguage';
