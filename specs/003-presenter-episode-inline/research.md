# Research: Inline Episode Registration for Presenters

## Phase 0 Research Findings

### 1. Form Architecture Pattern

**Decision**: Single controlled form with local state management
**Rationale**:
- React controlled components provide immediate validation feedback
- Local state allows for complex inter-field validation (exactly 1 lie marker)
- Easier to implement "all-or-nothing" atomic saves
**Alternatives considered**:
- Uncontrolled form with FormData: Rejected due to poor validation UX
- Multi-step wizard: Rejected as it defeats the purpose of single-screen registration
- Separate forms in tabs: Rejected due to complexity and poor mobile UX

### 2. Validation Strategy

**Decision**: Zod schema with custom refinements for cross-field validation
**Rationale**:
- Zod is already used in the codebase for other schemas
- Supports complex validation rules (array length, custom refinements)
- Type-safe with TypeScript inference
- Good error message support in Japanese
**Alternatives considered**:
- Manual validation: Rejected due to maintenance burden and lack of type safety
- Yup: Rejected as Zod is already established in the project
- React Hook Form with resolver: Considered but adds unnecessary dependency

### 3. Atomic Save Implementation

**Decision**: Single use case that creates presenter and episodes in one transaction
**Rationale**:
- InMemoryRepository allows for simple rollback on failure
- Ensures data consistency (no presenter without episodes)
- Simplifies error handling
**Alternatives considered**:
- Saga pattern: Over-engineered for in-memory storage
- Two-phase commit: Unnecessary complexity for MVP
- Sequential saves with cleanup: Error-prone and complex

### 4. UI Component Structure

**Decision**: Single form component with inline episode sections
**Rationale**:
- Better visual hierarchy and user understanding
- Reduces cognitive load (all related fields visible)
- Mobile-friendly vertical layout
**Alternatives considered**:
- Accordion/collapsible sections: Hides important information
- Modal for episodes: Creates unnecessary interaction steps
- Side-by-side layout: Poor mobile experience

### 5. State Management for Form

**Decision**: Custom hook (usePresenterWithEpisodesForm) with local React state
**Rationale**:
- Follows established pattern in codebase
- Encapsulates all form logic in testable unit
- No need for global state (form is self-contained)
**Alternatives considered**:
- Redux/Zustand: Overkill for local form state
- Context API: Unnecessary as no child components need the state
- Server state (React Query): Not applicable for form input state

### 6. Character Counter Implementation

**Decision**: Real-time counter with visual feedback (color change when near/over limit)
**Rationale**:
- Prevents user frustration from hitting limits unexpectedly
- Standard UX pattern users expect
- Low implementation complexity
**Alternatives considered**:
- Counter only on focus: Less helpful for users
- No counter (rely on validation): Poor UX
- Progressive textarea expansion: Doesn't communicate limits clearly

### 7. Error Display Strategy

**Decision**: Inline errors below fields + summary at form level
**Rationale**:
- Immediate spatial connection between error and field
- Form-level errors for cross-field validation issues
- Follows accessibility best practices
**Alternatives considered**:
- Toast notifications: Can be missed, poor for multiple errors
- Modal error dialog: Interrupts flow
- Errors only at top: Requires scrolling to see field context

### 8. Success Feedback

**Decision**: Success message with automatic form reset after 3 seconds
**Rationale**:
- Clear confirmation of successful save
- Auto-reset prepares for next presenter entry
- Time delay allows user to read confirmation
**Alternatives considered**:
- Redirect to list: Interrupts flow if adding multiple presenters
- No reset: Could lead to duplicate submissions
- Modal confirmation: Unnecessary interaction

## Technical Dependencies Confirmed

All required dependencies are already present in the project:
- Zod 3.x for validation schemas
- React 19 with hooks support
- Next.js Server Actions for form submission
- Tailwind CSS for styling
- nanoid for ID generation
- TypeScript 5 with strict mode

## Performance Considerations

- Form validation debounced to 50ms to prevent lag during typing
- Character counters use React.memo to prevent unnecessary re-renders
- Server action response cached with revalidatePath for instant UI updates
- Optimistic UI updates considered but deemed unnecessary for MVP (saves are fast enough)

## Accessibility Requirements

- All form fields have proper labels and ARIA attributes
- Error messages connected via aria-describedby
- Focus management after submission
- Keyboard navigation fully supported
- Screen reader announcements for validation state changes

## Migration Path from Current System

1. New form component can coexist with old flow initially
2. Feature flag or route-based activation
3. Data model remains unchanged (same Presenter/Episode entities)
4. Gradual deprecation of old EpisodeForm component
5. No data migration needed (same repository interface)