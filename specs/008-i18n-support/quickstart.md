# Quickstart: Multi-Language Support (i18n)

**Feature**: 008-i18n-support
**Date**: 2025-11-27

## Overview

This guide shows how to use the i18n system after implementation.

## Basic Usage

### 1. Using Translations in Components

```tsx
'use client';

import { useLanguage } from '@/hooks/useLanguage';

export function MyComponent() {
  const { t, language } = useLanguage();

  return (
    <div>
      <h1>{t('game.title')}</h1>
      <button>{t('common.save')}</button>
      <p>Current language: {language}</p>
    </div>
  );
}
```

### 2. Switching Languages

```tsx
'use client';

import { useLanguage } from '@/hooks/useLanguage';

export function LanguageToggle() {
  const { language, toggleLanguage, setLanguage } = useLanguage();

  return (
    <div>
      {/* Toggle between ja/en */}
      <button onClick={toggleLanguage}>
        {language === 'ja' ? 'EN' : '日本語'}
      </button>

      {/* Or set specific language */}
      <button onClick={() => setLanguage('ja')}>日本語</button>
      <button onClick={() => setLanguage('en')}>English</button>
    </div>
  );
}
```

### 3. Formatting Dates and Numbers

```tsx
'use client';

import { useLanguage } from '@/hooks/useLanguage';

export function FormattedContent() {
  const { formatDate, formatNumber, language } = useLanguage();

  const date = new Date('2025-11-27');
  const count = 1234567;

  return (
    <div>
      {/* Date: 2025年11月27日 (ja) or November 27, 2025 (en) */}
      <p>{formatDate(date)}</p>

      {/* Number: 1,234,567 */}
      <p>{formatNumber(count)}</p>

      {/* Custom date format */}
      <p>{formatDate(date, { dateStyle: 'short' })}</p>
    </div>
  );
}
```

### 4. Using the LanguageSwitcher Component

```tsx
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export function Header() {
  return (
    <header>
      <nav>
        {/* ... navigation items ... */}
        <LanguageSwitcher />
      </nav>
    </header>
  );
}
```

## Adding New Translations

### Step 1: Add keys to type definition

Edit `src/lib/i18n/types.ts`:

```typescript
export interface MyNamespaceTranslations {
  newKey: string;
  anotherKey: string;
}
```

### Step 2: Add translations

Edit `src/lib/i18n/translations.ts`:

```typescript
export const translations = {
  ja: {
    // ...existing...
    myNamespace: {
      newKey: '新しいキー',
      anotherKey: 'もう一つのキー',
    },
  },
  en: {
    // ...existing...
    myNamespace: {
      newKey: 'New Key',
      anotherKey: 'Another Key',
    },
  },
} as const;
```

### Step 3: Use in component

```tsx
const { t } = useLanguage();
return <p>{t('myNamespace.newKey')}</p>;
```

## Translation Key Reference

| Namespace | Example Keys | Description |
|-----------|-------------|-------------|
| `common` | `save`, `cancel`, `delete` | General UI buttons |
| `navigation` | `home`, `games`, `settings` | Navigation links |
| `game` | `title`, `createGame`, `playerLimit` | Game-related text |
| `game.status` | `preparing`, `active`, `closed` | Game status labels |
| `session` | `nickname`, `join`, `leave` | Session/player text |
| `answer` | `submitAnswer`, `correct`, `incorrect` | Answer submission |
| `results` | `score`, `ranking`, `winner` | Results display |
| `errors` | `required`, `invalid`, `notFound` | Error messages |
| `messages` | `saved`, `created`, `deleted` | Success messages |
| `emptyState` | `noData`, `noGames` | Empty state text |

## Testing

### Unit Test Example

```typescript
import { renderHook, act } from '@testing-library/react';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageProvider } from '@/providers/LanguageProvider';

describe('useLanguage', () => {
  const wrapper = ({ children }) => (
    <LanguageProvider>{children}</LanguageProvider>
  );

  it('should return Japanese translation by default', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    expect(result.current.t('common.save')).toBe('保存');
  });

  it('should switch to English', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    act(() => {
      result.current.setLanguage('en');
    });

    expect(result.current.t('common.save')).toBe('Save');
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('language switching', async ({ page }) => {
  await page.goto('/');

  // Default is Japanese
  await expect(page.getByRole('button', { name: '保存' })).toBeVisible();

  // Switch to English
  await page.getByRole('button', { name: 'EN' }).click();

  // Verify English text
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();

  // Refresh and verify persistence
  await page.reload();
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
});
```

## Troubleshooting

### Translation not updating?

1. Ensure component is a Client Component (`'use client'`)
2. Verify key exists in both `ja` and `en` translations
3. Check browser console for missing key warnings (dev mode only)

### localStorage not persisting?

1. Check browser privacy settings
2. Verify not in incognito/private mode
3. Check localStorage is not full

### Type errors on translation keys?

1. Ensure key matches type definition exactly
2. Use IDE autocomplete to find correct key path
3. Run TypeScript compiler to catch typos
