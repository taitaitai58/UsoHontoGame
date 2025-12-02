# Data Model: Multi-Language Support (i18n)

**Feature**: 008-i18n-support
**Date**: 2025-11-27

## Entities

### Language

Represents supported language options.

```typescript
type Language = 'ja' | 'en';

const DEFAULT_LANGUAGE: Language = 'ja';
const SUPPORTED_LANGUAGES: readonly Language[] = ['ja', 'en'] as const;
```

**Validation rules**:
- Must be one of: 'ja', 'en'
- Default: 'ja'

### LanguagePreference

Represents persisted user language setting.

```typescript
interface LanguagePreference {
  /** The selected language code */
  language: Language;
  /** Timestamp when preference was last updated */
  updatedAt: number;
}
```

**Storage**:
- Key: `uso-honto-language`
- Location: localStorage
- Format: Plain string ('ja' | 'en')

**Lifecycle**:
- Created: First language switch or explicit selection
- Updated: Each language change
- Deleted: Never (persists indefinitely)

### TranslationNamespace

Organizes translations by functional area.

```typescript
interface TranslationNamespace {
  /** Common UI elements (buttons, labels) */
  common: CommonTranslations;
  /** Navigation and header text */
  navigation: NavigationTranslations;
  /** Game-related text */
  game: GameTranslations;
  /** Session and player text */
  session: SessionTranslations;
  /** Error and validation messages */
  errors: ErrorTranslations;
  /** Success and notification messages */
  messages: MessageTranslations;
}
```

### Translation Key Structure

Nested object with type-safe keys.

```typescript
// Example structure (not exhaustive)
interface CommonTranslations {
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  create: string;
  back: string;
  next: string;
  loading: string;
  submit: string;
}

interface NavigationTranslations {
  home: string;
  games: string;
  settings: string;
  language: string;
}

interface GameTranslations {
  title: string;
  createGame: string;
  playerLimit: string;
  status: {
    preparing: string;
    active: string;
    closed: string;
  };
  presenter: string;
  episode: string;
  truth: string;
  lie: string;
}

interface SessionTranslations {
  nickname: string;
  enterNickname: string;
  join: string;
  leave: string;
}

interface ErrorTranslations {
  required: string;
  invalid: string;
  notFound: string;
  serverError: string;
  networkError: string;
}

interface MessageTranslations {
  saved: string;
  deleted: string;
  created: string;
  updated: string;
}
```

## Type Definitions

### LanguageContextValue

Context value exposed by LanguageProvider.

```typescript
interface LanguageContextValue {
  /** Current active language */
  language: Language;
  /** Update the active language (also persists to localStorage) */
  setLanguage: (lang: Language) => void;
  /** Toggle between ja and en */
  toggleLanguage: () => void;
  /** Get translated text by key path */
  t: TranslationFunction;
  /** Format a date according to current locale */
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  /** Format a number according to current locale */
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
}
```

### TranslationFunction

Type-safe translation accessor.

```typescript
type TranslationFunction = {
  (key: `common.${keyof CommonTranslations}`): string;
  (key: `navigation.${keyof NavigationTranslations}`): string;
  (key: `game.${keyof GameTranslations}`): string;
  (key: `game.status.${keyof GameTranslations['status']}`): string;
  (key: `session.${keyof SessionTranslations}`): string;
  (key: `errors.${keyof ErrorTranslations}`): string;
  (key: `messages.${keyof MessageTranslations}`): string;
};
```

## Relationships

```
┌─────────────────┐         ┌──────────────────────┐
│  localStorage   │◄────────│  LanguagePreference  │
│  (Browser)      │  stores │  (language: 'ja'|'en')│
└─────────────────┘         └──────────────────────┘
                                      │
                                      │ initializes
                                      ▼
┌─────────────────┐         ┌──────────────────────┐
│ LanguageContext │◄────────│  LanguageProvider    │
│ (React Context) │ provides│  (Client Component)  │
└─────────────────┘         └──────────────────────┘
         │
         │ consumed by
         ▼
┌─────────────────┐         ┌──────────────────────┐
│  useLanguage    │─────────│  Components          │
│  (Custom Hook)  │ used by │  (UI throughout app) │
└─────────────────┘         └──────────────────────┘
         │
         │ accesses
         ▼
┌─────────────────────────────────────────────────┐
│              Translations Object                │
│  { ja: { common: {...}, ... },                 │
│    en: { common: {...}, ... } }                │
└─────────────────────────────────────────────────┘
```

## State Transitions

### Language Selection Flow

```
[Initial Load]
     │
     ▼
┌─────────────────────┐
│ Check localStorage  │
│ for saved language  │
└─────────────────────┘
     │
     ├── Found ────────► Use saved language
     │
     └── Not found ────► Use default ('ja')

[User Changes Language]
     │
     ▼
┌─────────────────────┐
│ setLanguage(lang)   │
│ called              │
└─────────────────────┘
     │
     ▼
┌─────────────────────┐
│ Update React state  │
│ (triggers re-render)│
└─────────────────────┘
     │
     ▼
┌─────────────────────┐
│ Persist to          │
│ localStorage        │
└─────────────────────┘
     │
     ▼
┌─────────────────────┐
│ All components      │
│ re-render with new  │
│ language            │
└─────────────────────┘
```

## Validation Rules

| Field | Rule | Error Key |
|-------|------|-----------|
| Language | Must be 'ja' or 'en' | errors.invalid |
| Translation Key | Must exist in translations object | (dev warning only) |

## Data Volume Assumptions

- **Languages**: 2 (Japanese, English)
- **Translation keys**: ~50-100 strings initially
- **localStorage usage**: < 1KB
- **Memory footprint**: < 10KB for all translations
