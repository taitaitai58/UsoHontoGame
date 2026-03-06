/**
 * CopyGameUrlButton Component
 * Copies game detail page URL to clipboard with visual feedback (button text + optional toast)
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

export interface CopyGameUrlButtonProps {
  /** Game ID to build the detail page URL */
  gameId: string;
  /** Called when copy succeeds; parent can show toast (e.g. showSuccess(message)) */
  onCopySuccess?: (message: string) => void;
  /** Optional class name for the button */
  className?: string;
  /** Optional variant: 'button' (default) or 'icon' for icon-only style */
  variant?: 'button' | 'icon';
}

const COPIED_RESET_MS = 2000;

/**
 * Builds the full URL for the game detail page (client-safe).
 */
function getGameDetailUrl(gameId: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/games/${gameId}`;
}

/**
 * CopyGameUrlButton - Copies game URL to clipboard and shows feedback
 */
export function CopyGameUrlButton({
  gameId,
  onCopySuccess,
  className = '',
  variant = 'button',
}: CopyGameUrlButtonProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleClick = useCallback(async () => {
    const url = getGameDetailUrl(gameId);
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      onCopySuccess?.(t('game.copyUrlSuccess'));
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = window.setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      onCopySuccess?.(t('errors.errorOccurred'));
    }
  }, [gameId, onCopySuccess, t]);

  const label = copied ? t('game.copyUrlSuccess') : t('game.copyUrl');
  const baseClass =
    'inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-70';

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={className || baseClass}
        title={label}
        aria-label={label}
      >
        {copied ? (
          <CheckIcon className="h-4 w-4 text-green-600" />
        ) : (
          <LinkIcon className="h-4 w-4 text-gray-600" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className || baseClass}
      aria-label={label}
    >
      {copied ? (
        <CheckIcon className="h-4 w-4 shrink-0 text-green-600" aria-hidden />
      ) : (
        <LinkIcon className="h-4 w-4 shrink-0 text-gray-600" aria-hidden />
      )}
      <span>{label}</span>
    </button>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 5.656 5.656l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a2.5 2.5 0 0 1-3.536-3.536l3-3Z" />
      <path d="M11.603 7.963a.75.75 0 0 0-1.061 1.06l1.224 1.224a2.5 2.5 0 0 1-3.536 3.536l-3-3a2.5 2.5 0 0 1 3.536-3.536l1.225 1.224a.75.75 0 0 0 1.06-1.06l-1.224-1.224a4 4 0 0 0-5.656 5.656l3 3a4 4 0 0 0 5.656-5.656l-1.224-1.224Z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
