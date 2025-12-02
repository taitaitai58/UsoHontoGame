/**
 * AccessibilityProvider Component
 * Feature: 004-status-transition - Enhanced feedback
 * Provides accessibility context and screen reader announcements
 */

'use client';

import { createContext, useCallback, useContext, useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

interface AccessibilityContextValue {
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  announceStatusChange: (oldStatus: string, newStatus: string) => void;
  announceError: (error: string) => void;
  announceSuccess: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

/**
 * Accessibility Provider component
 * Manages screen reader announcements and accessibility features
 */
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const politeAnnouncerRef = useRef<HTMLOutputElement>(null);
  const assertiveAnnouncerRef = useRef<HTMLDivElement>(null);

  const announceToScreenReader = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      const announcer =
        priority === 'assertive' ? assertiveAnnouncerRef.current : politeAnnouncerRef.current;
      if (announcer) {
        // Clear first, then set message to ensure screen readers announce it
        announcer.textContent = '';
        setTimeout(() => {
          if (announcer) {
            announcer.textContent = message;
          }
        }, 100);
      }
    },
    []
  );

  const announceStatusChange = useCallback(
    (oldStatus: string, newStatus: string) => {
      const message = t('accessibility.statusChanged')
        .replace('{oldStatus}', oldStatus)
        .replace('{newStatus}', newStatus);
      announceToScreenReader(message, 'polite');
    },
    [announceToScreenReader, t]
  );

  const announceError = useCallback(
    (error: string) => {
      const message = t('accessibility.errorOccurred').replace('{error}', error);
      announceToScreenReader(message, 'assertive');
    },
    [announceToScreenReader, t]
  );

  const announceSuccess = useCallback(
    (message: string) => {
      const successMessage = t('accessibility.operationSucceeded').replace('{message}', message);
      announceToScreenReader(successMessage, 'polite');
    },
    [announceToScreenReader, t]
  );

  const value: AccessibilityContextValue = {
    announceToScreenReader,
    announceStatusChange,
    announceError,
    announceSuccess,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}

      {/* Screen reader announcements */}
      <div className="sr-only">
        <output ref={politeAnnouncerRef} aria-live="polite" aria-atomic="true" />
        <div ref={assertiveAnnouncerRef} aria-live="assertive" aria-atomic="true" role="alert" />
      </div>
    </AccessibilityContext.Provider>
  );
}

/**
 * Hook to access accessibility features
 */
export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

/**
 * Hook for conditional announcements based on user preferences
 */
export function useConditionalAnnouncement() {
  const { t } = useLanguage();
  const { announceToScreenReader } = useAccessibility();

  const announceIfEnabled = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      // Check if user prefers reduced motion (often correlates with accessibility needs)
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Always announce for screen reader users, but be more verbose if reduced motion is preferred
      if (prefersReducedMotion) {
        announceToScreenReader(t('accessibility.detailedUpdate').replace('{message}', message), priority);
      } else {
        announceToScreenReader(message, priority);
      }
    },
    [announceToScreenReader, t]
  );

  return { announceIfEnabled };
}
