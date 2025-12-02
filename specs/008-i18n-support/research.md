# Research: Multi-Language Support (i18n)

**Feature**: 008-i18n-support
**Date**: 2025-11-27

## Research Tasks

### 1. i18n Implementation Approach for Next.js 16 + React 19

**Decision**: Custom lightweight i18n solution using React Context

**Rationale**:
- No external library dependency (simpler, smaller bundle)
- Full control over translation structure and type safety
- Matches project's existing patterns (QueryProvider, custom hooks)
- Avoids complexity of next-intl or i18next for a 2-language app
- No server-side rendering requirements (SSR not needed for language preference)

**Alternatives considered**:
- **next-intl**: Too heavy for 2 languages, adds routing complexity
- **react-i18next**: Overkill for simple use case, adds bundle size
- **next/intl (built-in)**: Requires URL-based language routing, not needed

### 2. Translation Key Type Safety

**Decision**: Use TypeScript const assertion with nested object structure

**Rationale**:
- Compile-time checking of translation keys
- IDE autocomplete support for translation keys
- No runtime overhead
- Works with existing TypeScript strict mode

**Implementation pattern**:
```typescript
const translations = {
  ja: {
    common: {
      save: '保存',
      cancel: 'キャンセル',
    },
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
    },
  },
} as const;

type TranslationKey = keyof typeof translations.ja.common;
```

**Alternatives considered**:
- JSON files: Less type-safe, requires additional tooling
- i18n libraries with typed keys: Adds unnecessary complexity

### 3. localStorage Persistence Pattern

**Decision**: Direct localStorage access with React state sync

**Rationale**:
- Simple, standard browser API
- No additional dependencies
- Matches clarification decision (localStorage for persistence)
- Immediate availability on client hydration

**Implementation pattern**:
```typescript
const LANGUAGE_KEY = 'uso-honto-language';

function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'ja';
  return (localStorage.getItem(LANGUAGE_KEY) as Language) || 'ja';
}

function setStoredLanguage(lang: Language): void {
  localStorage.setItem(LANGUAGE_KEY, lang);
}
```

**Alternatives considered**:
- Cookies: Unnecessary complexity, no server-side benefit needed
- IndexedDB: Overkill for single string value

### 4. React Context Pattern for Language State

**Decision**: Single LanguageContext with Provider at app root

**Rationale**:
- Standard React pattern for cross-cutting state
- Matches existing QueryProvider pattern
- Minimal re-renders with proper memoization
- Clean separation of concerns

**Provider structure**:
```typescript
interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}
```

**Alternatives considered**:
- Zustand/Jotai: Additional dependency not justified for single boolean state
- Redux: Not used in project, overkill

### 5. Date and Number Formatting

**Decision**: Use Intl API with locale mapping

**Rationale**:
- Built into modern browsers
- No additional dependencies
- Proper locale support for Japanese and English
- Handles edge cases correctly

**Implementation pattern**:
```typescript
const localeMap: Record<Language, string> = {
  ja: 'ja-JP',
  en: 'en-US',
};

function formatDate(date: Date, language: Language): string {
  return new Intl.DateTimeFormat(localeMap[language], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
```

**Alternatives considered**:
- date-fns with locale: Adds bundle size, Intl sufficient
- Manual formatting: Error-prone, Intl handles edge cases

### 6. Language Switcher Component Design

**Decision**: Simple toggle button in header showing current language

**Rationale**:
- Minimalist UI for 2-language app
- Clear visual feedback
- Accessible with keyboard navigation
- Matches clarification (header placement)

**Component pattern**:
```typescript
// Toggle between 日本語 and English
<button onClick={toggleLanguage}>
  {language === 'ja' ? 'EN' : '日本語'}
</button>
```

**Alternatives considered**:
- Dropdown: Overkill for 2 languages
- Flag icons: Can be ambiguous (flags represent countries, not languages)
- Full language names: Takes more space, toggle is cleaner

### 7. Handling Missing Translations

**Decision**: Fallback to Japanese text with dev-mode console warning

**Rationale**:
- Prevents broken UI in production
- Alerts developers to missing translations during development
- Matches spec requirement (FR-007: Japanese fallback)

**Implementation pattern**:
```typescript
function t(key: TranslationKey): string {
  const text = translations[language][key] ?? translations.ja[key];
  if (process.env.NODE_ENV === 'development' && !translations[language][key]) {
    console.warn(`Missing translation: ${language}.${key}`);
  }
  return text;
}
```

### 8. Testing Strategy

**Decision**: Unit tests for hook/translations + E2E for full flow

**Rationale**:
- Unit tests verify translation completeness and hook behavior
- E2E tests verify user-facing functionality
- Matches project TDD approach

**Test categories**:
1. **Unit**: `useLanguage` hook behavior (state, persistence)
2. **Unit**: Translation completeness (all keys in both languages)
3. **Component**: LanguageSwitcher renders and toggles
4. **E2E**: Full language switching flow across pages

## Summary

All research complete. No external libraries required. Implementation uses:
- React Context for state management
- localStorage for persistence
- TypeScript const assertion for type-safe translations
- Intl API for date/number formatting
- Simple toggle component for UI
