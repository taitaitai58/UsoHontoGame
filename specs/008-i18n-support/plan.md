# Implementation Plan: Multi-Language Support (i18n)

**Branch**: `008-i18n-support` | **Date**: 2025-11-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-i18n-support/spec.md`

## Summary

Implement multi-language support (Japanese and English) across all application pages. The feature includes a language switcher component in the header, localStorage-based persistence, React Context for state management, and centralized translation management. All UI text will be extracted to translation files with Japanese as the default and fallback language.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)
**Primary Dependencies**: Next.js 16.0.1, React 19.2.0, Tailwind CSS v4
**Storage**: localStorage (client-side persistence for language preference)
**Testing**: Vitest 4.0.7, React Testing Library, Playwright
**Target Platform**: Web browser (modern browsers with localStorage support)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Language switching < 1 second (immediate visual feedback)
**Constraints**: No page refresh on language change, preserve component state
**Scale/Scope**: ~50+ translatable strings across all existing pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| 0. Git commit and Code Formatting | ✅ PASS | Will run Biome formatting before commits |
| I. Clean Architecture | ✅ PASS | i18n is a cross-cutting concern, implemented in lib/ with Provider in providers/ |
| II. Component Architecture | ✅ PASS | LanguageSwitcher is a UI component, translations are domain-agnostic |
| III. Custom Hooks Architecture | ✅ PASS | `useLanguage` hook will encapsulate all i18n logic |
| IV. Test-Driven Development | ✅ PASS | Tests for hook, provider, and component will be written first |
| V. Type Safety | ✅ PASS | Translation keys will be strongly typed |
| VI. Documentation Standards | ✅ PASS | Feature spec complete with user stories and acceptance criteria |
| VII. Server Components First | ✅ PARTIAL | Language switching requires client-side state; will use Context Provider |

**Gate Status**: PASS (Partial for VII is acceptable - i18n inherently requires client interaction)

## Project Structure

### Documentation (this feature)

```text
specs/008-i18n-support/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── i18n-api.ts      # Translation function types
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── lib/
│   └── i18n/
│       ├── index.ts           # Export barrel
│       ├── translations.ts    # Translation data (ja/en)
│       ├── types.ts           # TypeScript types for i18n
│       └── utils.ts           # Helper functions (formatDate, formatNumber)
├── hooks/
│   └── useLanguage.ts         # Language state hook
├── providers/
│   └── LanguageProvider.tsx   # React Context provider
├── components/
│   └── ui/
│       └── LanguageSwitcher.tsx  # Language toggle component
└── app/
    └── layout.tsx             # Add LanguageProvider wrapper

tests/
├── unit/
│   └── i18n/
│       ├── useLanguage.test.ts
│       └── translations.test.ts
└── e2e/
    └── i18n.spec.ts           # E2E language switching tests
```

**Structure Decision**: Single web application with i18n as a cross-cutting concern. Translation logic centralized in `src/lib/i18n/`, state management via React Context in `src/providers/`, and UI component in `src/components/ui/`.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
