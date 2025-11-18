/**
 * Date Utility Functions
 * Feature: 005-top-active-games
 *
 * Provides date formatting utilities for the application
 */

/**
 * Formats a date as relative time in Japanese
 * Examples: "たった今", "5分前", "2時間前", "3日前"
 *
 * @param date - The date to format (Date object or ISO string)
 * @returns Formatted relative time string in Japanese
 */
export function formatRelativeTime(date: Date | string): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - targetDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'たった今';
  if (diffMins < 60) return `${diffMins}分前`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}時間前`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}日前`;
}

/**
 * Formats a date as a full Japanese date string
 * Example: "2025年11月18日 10:30"
 *
 * @param date - The date to format (Date object or ISO string)
 * @returns Formatted date string in Japanese
 */
export function formatFullDate(date: Date | string): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;

  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();
  const hours = String(targetDate.getHours()).padStart(2, '0');
  const minutes = String(targetDate.getMinutes()).padStart(2, '0');

  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}
