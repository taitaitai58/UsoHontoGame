# Data Model: Inline Episode Registration for Presenters

## Core Entities (No Changes)

### Presenter
Existing entity remains unchanged:
```typescript
interface Presenter {
  id: string;           // nanoid generated
  gameId: string;       // Reference to parent game
  nickname: string;     // 1-50 characters
  episodes: Episode[];  // Always exactly 3 episodes after creation
  createdAt: Date;
}
```

### Episode
Existing entity remains unchanged:
```typescript
interface Episode {
  id: string;           // nanoid generated
  presenterId: string;  // Reference to parent presenter
  text: string;         // 1-1000 characters
  isLie: boolean;       // Exactly one must be true per presenter
  createdAt: Date;
}
```

## New Data Transfer Objects (DTOs)

### AddPresenterWithEpisodesInput
Input DTO for the new unified registration:
```typescript
interface AddPresenterWithEpisodesInput {
  gameId: string;
  nickname: string;
  episodes: Array<{
    text: string;
    isLie: boolean;
  }>; // Must be exactly 3 items
}
```

### AddPresenterWithEpisodesOutput
Output DTO after successful registration:
```typescript
interface AddPresenterWithEpisodesOutput {
  presenter: PresenterWithLieDto; // Existing DTO with episodes included
}
```

## Validation Schemas

### AddPresenterWithEpisodesSchema
Zod schema for comprehensive validation:
```typescript
const AddPresenterWithEpisodesSchema = z.object({
  gameId: z.string().min(1, "ゲームIDは必須です"),
  nickname: z.string()
    .min(1, "ニックネームを入力してください")
    .max(50, "ニックネームは50文字以下でなければなりません"),
  episodes: z.array(
    z.object({
      text: z.string()
        .min(1, "エピソードを入力してください")
        .max(1000, "エピソードは1000文字以下でなければなりません"),
      isLie: z.boolean()
    })
  )
  .length(3, "3つのエピソードが必要です")
  .refine(
    (episodes) => episodes.filter(e => e.isLie).length === 1,
    { message: "ウソのエピソードは1つだけ選択してください" }
  )
});
```

## State Transitions

### Presenter Lifecycle
```
[Non-existent]
    ↓ (createWithEpisodes - new flow)
[Created with 3 episodes]
    ↓ (no modifications allowed in this feature)
[Deleted] (cascade deletes episodes)
```

### Form State Machine
```
[Empty Form]
    ↓ (user input)
[Partially Filled]
    ↓ (validation)
[Valid/Invalid]
    ↓ (submit if valid)
[Submitting]
    ↓ (server response)
[Success] → [Reset to Empty]
[Error] → [Partially Filled with errors]
```

## Business Rules (Enforced by Domain Layer)

1. **Episode Count**: A presenter MUST have exactly 3 episodes
2. **Lie Distribution**: Exactly 1 episode must be marked as a lie
3. **Text Constraints**:
   - Nickname: 1-50 characters
   - Episode text: 1-1000 characters
4. **Atomicity**: Presenter and all 3 episodes must be created together or not at all
5. **Uniqueness**: Episode IDs must be globally unique (nanoid handles this)
6. **Immutability**: Once created, episodes cannot be modified (out of scope)

## Repository Interface Extension

### New Method for IGameRepository
```typescript
interface IGameRepository {
  // Existing methods...

  // New atomic creation method
  createPresenterWithEpisodes(
    presenter: Presenter,
    episodes: Episode[]
  ): Promise<void>;
  // Must ensure all-or-nothing save
  // Must validate business rules before persisting
}
```

## Error Handling

### Validation Errors
- Field-level: Mapped to specific form fields
- Cross-field: Displayed at form level
- Format: Japanese error messages as defined in schemas

### System Errors
```typescript
class PresenterCreationError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'PresenterCreationError';
  }
}
```

## Migration Impact

### Backward Compatibility
- Existing presenters with episodes remain unchanged
- Old creation flow can coexist during transition
- No data migration required

### Deprecation Path
1. Mark old `AddPresenter` + `AddEpisode` use cases as deprecated
2. Update UI to use new unified form
3. Remove old components after verification period
4. Clean up deprecated server actions

## Performance Considerations

### Optimizations
- Single round-trip to server (vs 4 in old flow)
- Batch ID generation for all entities
- Single revalidation trigger for cache

### Constraints
- Form payload larger (~3KB vs 500B)
- More complex validation on server
- Acceptable tradeoff for better UX