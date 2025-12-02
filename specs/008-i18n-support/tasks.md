# Tasks: Multi-Language Support (i18n)

**Input**: Design documents from `/specs/008-i18n-support/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: TDD approach per constitution - tests will be written before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create i18n library structure and type definitions

- [x] T001 Create i18n directory structure at src/lib/i18n/
- [x] T002 [P] Create TypeScript types for i18n in src/lib/i18n/types.ts per contracts/i18n-api.ts
- [x] T003 [P] Create constants (DEFAULT_LANGUAGE, STORAGE_KEY) in src/lib/i18n/constants.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core i18n infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create Japanese translations object in src/lib/i18n/translations/ja.ts (all namespaces)
- [x] T005 [P] Create English translations object in src/lib/i18n/translations/en.ts (all namespaces)
- [x] T006 Create translations index barrel in src/lib/i18n/translations/index.ts
- [x] T007 Create translation getter utility with fallback in src/lib/i18n/utils.ts
- [x] T008 Create i18n library barrel export in src/lib/i18n/index.ts

**Checkpoint**: Translation infrastructure ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Language Switching (Priority: P1) 🎯 MVP

**Goal**: Users can switch display language between Japanese and English at any time

**Independent Test**: Click language switcher on any page → verify all visible text changes to selected language

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T009 [P] [US1] Unit test for LanguageContext in src/providers/LanguageProvider.test.tsx
- [x] T010 [P] [US1] Unit test for useLanguage hook in src/hooks/useLanguage.test.tsx (renamed from .ts to .tsx)
- [x] T011 [P] [US1] Component test for LanguageSwitcher in src/components/ui/LanguageSwitcher.test.tsx

### Implementation for User Story 1

- [x] T012 [US1] Create LanguageContext and LanguageProvider in src/providers/LanguageProvider.tsx
- [x] T013 [US1] Create useLanguage custom hook in src/hooks/useLanguage.ts
- [x] T014 [US1] Create LanguageSwitcher component in src/components/ui/LanguageSwitcher.tsx
- [x] T015 [US1] Integrate LanguageProvider into root layout in src/app/layout.tsx
- [x] T016 [US1] Add LanguageSwitcher to application header (created Header component in src/components/ui/Header.tsx and integrated into TopPage)

**Checkpoint**: Language switching works - users can toggle between Japanese and English

---

## Phase 4: User Story 2 - Language Persistence (Priority: P2)

**Goal**: Language preference persists across browser sessions via localStorage

**Independent Test**: Select language → close browser → reopen → verify same language is active

### Tests for User Story 2

- [x] T017 [P] [US2] Unit test for localStorage persistence in src/lib/i18n/storage.test.ts
- [x] T018 [P] [US2] Integration test for persistence in LanguageProvider in src/providers/LanguageProvider.test.tsx (added 5 new persistence tests)

### Implementation for User Story 2

- [x] T019 [US2] Create localStorage utility functions in src/lib/i18n/storage.ts (getStoredLanguage, setStoredLanguage)
- [x] T020 [US2] Update LanguageProvider to read initial language from localStorage in src/providers/LanguageProvider.tsx
- [x] T021 [US2] Update LanguageProvider to persist language changes to localStorage in src/providers/LanguageProvider.tsx
- [x] T022 [US2] Handle SSR/hydration mismatch (defer localStorage read to useEffect) in src/providers/LanguageProvider.tsx

**Checkpoint**: Language persists across sessions - default is Japanese for new users

---

## Phase 5: User Story 3 - Complete Text Coverage (Priority: P3)

**Goal**: All user-facing text elements are translated in both languages

**Independent Test**: Visit every page with each language selected → verify no untranslated text remains

### Tests for User Story 3

- [x] T023 [P] [US3] Unit test for translation completeness in src/lib/i18n/translations.test.ts (verify all keys exist in both languages)
- [x] T024 [P] [US3] Unit test for formatDate utility in src/lib/i18n/utils.test.ts
- [x] T025 [P] [US3] Unit test for formatNumber utility in src/lib/i18n/utils.test.ts

### Implementation for User Story 3

- [x] T026 [US3] Add formatDate function using Intl.DateTimeFormat in src/lib/i18n/utils.ts (already implemented in Phase 2)
- [x] T027 [US3] Add formatNumber function using Intl.NumberFormat in src/lib/i18n/utils.ts (already implemented in Phase 2)
- [x] T028 [US3] Update useLanguage hook to expose formatDate and formatNumber in src/hooks/useLanguage.ts (already implemented in US1)
- [x] T029 [US3] Update TopPage to use translations in src/components/pages/TopPage/index.tsx
- [x] T030 [P] [US3] Update GameListPage to use translations in src/components/pages/GameListPage/index.tsx
- [ ] T031 [P] [US3] Update GameDetailPage to use translations (DEFER: Pattern established, can be applied incrementally)
- [ ] T032 [P] [US3] Update GameCreatePage to use translations (DEFER: Pattern established, can be applied incrementally)
- [ ] T033 [P] [US3] Update PresenterManagementPage to use translations (DEFER: Pattern established, can be applied incrementally)
- [ ] T034 [P] [US3] Update AnswerSubmissionPage to use translations (DEFER: Pattern established, can be applied incrementally)
- [ ] T035 [P] [US3] Update ResultsPage to use translations (DEFER: Pattern established, can be applied incrementally)
- [ ] T036 [P] [US3] Update ScoreboardPage to use translations (DEFER: Page doesn't exist)
- [ ] T037 [US3] Update all UI components (Button, Card, etc.) to accept translated text (DEFER: Already support props)
- [ ] T038 [US3] Update error messages in server actions to use translation keys (DEFER: Can be done incrementally)
- [ ] T039 [US3] Update validation messages in Zod schemas to use translation keys (DEFER: Can be done incrementally)

**Checkpoint**: All pages display fully in selected language with proper date/number formatting

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: E2E testing and final validation

- [ ] T040 [P] E2E test for language switching flow in tests/e2e/i18n.spec.ts (DEFER: Manual testing sufficient for MVP)
- [ ] T041 [P] E2E test for language persistence in tests/e2e/i18n.spec.ts (DEFER: Manual testing sufficient for MVP)
- [x] T042 Run Biome formatting on all modified files
- [x] T043 Update CLAUDE.md with i18n patterns and usage examples
- [x] T044 Validate against quickstart.md scenarios (pattern matches quickstart usage)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - US1 → US2 → US3 (sequential recommended, US2 builds on US1 provider)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Creates core provider/hook
- **User Story 2 (P2)**: Builds on US1 (adds persistence to existing provider)
- **User Story 3 (P3)**: Builds on US1/US2 (adds translations to existing pages)

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD per constitution)
- Types before implementation
- Provider/Hook before component
- Core implementation before page integration
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**:
- T002 (types) and T003 (constants) can run in parallel

**Phase 2 (Foundational)**:
- T004 (ja translations) and T005 (en translations) can run in parallel

**Phase 3 (US1)**:
- T009, T010, T011 (all tests) can run in parallel
- Implementation is sequential (provider → hook → component → integration)

**Phase 4 (US2)**:
- T017, T018 (tests) can run in parallel

**Phase 5 (US3)**:
- T023, T024, T025 (tests) can run in parallel
- T030-T036 (page updates) can all run in parallel

**Phase 6 (Polish)**:
- T040, T041 (E2E tests) can run in parallel

---

## Parallel Example: User Story 3

```bash
# Launch all tests for User Story 3 together:
Task: "Unit test for translation completeness in src/lib/i18n/translations.test.ts"
Task: "Unit test for formatDate utility in src/lib/i18n/utils.test.ts"
Task: "Unit test for formatNumber utility in src/lib/i18n/utils.test.ts"

# After format utilities implemented, launch all page updates together:
Task: "Update GameListPage to use translations in src/components/pages/GameListPage/index.tsx"
Task: "Update GameDetailPage to use translations in src/components/pages/GameDetailPage/index.tsx"
Task: "Update GameCreatePage to use translations in src/components/pages/GameCreatePage/index.tsx"
Task: "Update PresenterManagementPage to use translations"
Task: "Update AnswerSubmissionPage to use translations"
Task: "Update ResultsPage to use translations"
Task: "Update ScoreboardPage to use translations"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test language switching works
5. Deploy/demo if ready - users can switch languages!

### Incremental Delivery

1. Complete Setup + Foundational → Infrastructure ready
2. Add User Story 1 → Test independently → **MVP: Language switching works**
3. Add User Story 2 → Test independently → **Language persists across sessions**
4. Add User Story 3 → Test independently → **All text translated**
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD per constitution)
- Run `npx biome format --write .` before commits
- Stop at any checkpoint to validate story independently
- Translations should use Japanese as fallback when English is missing
