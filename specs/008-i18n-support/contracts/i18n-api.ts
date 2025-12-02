/**
 * i18n API Contracts
 * Feature: 008-i18n-support
 *
 * This file defines the TypeScript interfaces and types for the i18n system.
 * These contracts are used by the implementation to ensure type safety.
 */

// =============================================================================
// Core Types
// =============================================================================

/**
 * Supported language codes
 */
export type Language = 'ja' | 'en';

/**
 * Default language when no preference is set
 */
export const DEFAULT_LANGUAGE: Language = 'ja';

/**
 * All supported languages
 */
export const SUPPORTED_LANGUAGES: readonly Language[] = ['ja', 'en'] as const;

/**
 * localStorage key for language preference
 */
export const LANGUAGE_STORAGE_KEY = 'uso-honto-language';

// =============================================================================
// Translation Namespace Types
// =============================================================================

/**
 * Common UI element translations
 */
export interface CommonTranslations {
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  create: string;
  back: string;
  next: string;
  loading: string;
  submit: string;
  close: string;
  confirm: string;
  yes: string;
  no: string;
}

/**
 * Navigation and header translations
 */
export interface NavigationTranslations {
  home: string;
  games: string;
  gameList: string;
  createGame: string;
  settings: string;
  language: string;
}

/**
 * Game status translations
 */
export interface GameStatusTranslations {
  preparing: string;
  active: string;
  closed: string;
}

/**
 * Game-related translations
 */
export interface GameTranslations {
  title: string;
  createGame: string;
  editGame: string;
  deleteGame: string;
  playerLimit: string;
  playerLimitDescription: string;
  status: GameStatusTranslations;
  presenter: string;
  presenters: string;
  episode: string;
  episodes: string;
  truth: string;
  lie: string;
  noGames: string;
  gameNotFound: string;
  startGame: string;
  endGame: string;
}

/**
 * Session and player translations
 */
export interface SessionTranslations {
  nickname: string;
  enterNickname: string;
  join: string;
  leave: string;
  participants: string;
  noParticipants: string;
}

/**
 * Answer submission translations
 */
export interface AnswerTranslations {
  submitAnswer: string;
  selectLie: string;
  yourAnswer: string;
  correct: string;
  incorrect: string;
  alreadySubmitted: string;
  answerSubmitted: string;
}

/**
 * Results and scoring translations
 */
export interface ResultsTranslations {
  results: string;
  score: string;
  ranking: string;
  winner: string;
  points: string;
  correctAnswers: string;
  totalQuestions: string;
}

/**
 * Error message translations
 */
export interface ErrorTranslations {
  required: string;
  invalid: string;
  notFound: string;
  serverError: string;
  networkError: string;
  unauthorized: string;
  forbidden: string;
  validationFailed: string;
  unexpectedError: string;
}

/**
 * Success/notification message translations
 */
export interface MessageTranslations {
  saved: string;
  deleted: string;
  created: string;
  updated: string;
  copied: string;
  success: string;
}

/**
 * Empty state translations
 */
export interface EmptyStateTranslations {
  noData: string;
  noResults: string;
  noGamesFound: string;
  noActiveGames: string;
}

// =============================================================================
// Complete Translation Structure
// =============================================================================

/**
 * Complete translation object structure for a single language
 */
export interface Translations {
  common: CommonTranslations;
  navigation: NavigationTranslations;
  game: GameTranslations;
  session: SessionTranslations;
  answer: AnswerTranslations;
  results: ResultsTranslations;
  errors: ErrorTranslations;
  messages: MessageTranslations;
  emptyState: EmptyStateTranslations;
}

/**
 * All translations indexed by language
 */
export type TranslationsByLanguage = {
  [K in Language]: Translations;
};

// =============================================================================
// Translation Key Types (for type-safe access)
// =============================================================================

/**
 * Dot-notation path to a translation value
 */
export type TranslationKey =
  | `common.${keyof CommonTranslations}`
  | `navigation.${keyof NavigationTranslations}`
  | `game.${keyof Omit<GameTranslations, 'status'>}`
  | `game.status.${keyof GameStatusTranslations}`
  | `session.${keyof SessionTranslations}`
  | `answer.${keyof AnswerTranslations}`
  | `results.${keyof ResultsTranslations}`
  | `errors.${keyof ErrorTranslations}`
  | `messages.${keyof MessageTranslations}`
  | `emptyState.${keyof EmptyStateTranslations}`;

// =============================================================================
// Context Types
// =============================================================================

/**
 * Language context value provided to consumers
 */
export interface LanguageContextValue {
  /** Current active language */
  language: Language;

  /** Update the active language (persists to localStorage) */
  setLanguage: (lang: Language) => void;

  /** Toggle between Japanese and English */
  toggleLanguage: () => void;

  /** Get translated text by key path */
  t: (key: TranslationKey) => string;

  /** Format a date according to current locale */
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;

  /** Format a number according to current locale */
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
}

// =============================================================================
// Hook Return Types
// =============================================================================

/**
 * Return type of useLanguage hook
 */
export type UseLanguageReturn = LanguageContextValue;

// =============================================================================
// Component Props
// =============================================================================

/**
 * Props for LanguageSwitcher component
 */
export interface LanguageSwitcherProps {
  /** Optional CSS class name */
  className?: string;

  /** Whether to show full language names instead of short codes */
  showFullNames?: boolean;
}

/**
 * Props for LanguageProvider component
 */
export interface LanguageProviderProps {
  /** Child components to wrap */
  children: React.ReactNode;

  /** Optional initial language (overrides localStorage) */
  initialLanguage?: Language;
}
