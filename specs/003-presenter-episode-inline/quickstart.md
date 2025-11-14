# Quickstart: Inline Episode Registration for Presenters

## Overview
This feature transforms the presenter registration process from a multi-step workflow to a single-form submission where presenters are created with their 3 episodes (2 truths, 1 lie) in one atomic operation.

## Quick Implementation Steps

### 1. Backend Setup (30 minutes)

#### Create Zod Schema
```typescript
// src/server/domain/schemas/gameSchemas.ts
export const AddPresenterWithEpisodesSchema = z.object({
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

#### Create Use Case
```typescript
// src/server/application/use-cases/games/AddPresenterWithEpisodes.ts
export class AddPresenterWithEpisodes {
  constructor(private gameRepository: IGameRepository) {}

  async execute(input: AddPresenterWithEpisodesInput): Promise<AddPresenterWithEpisodesOutput> {
    // 1. Generate IDs
    const presenterId = nanoid();
    const episodeIds = [nanoid(), nanoid(), nanoid()];

    // 2. Create entities
    const presenter = Presenter.create({
      id: presenterId,
      gameId: input.gameId,
      nickname: input.nickname,
      createdAt: new Date()
    });

    const episodes = input.episodes.map((ep, index) =>
      Episode.create({
        id: episodeIds[index],
        presenterId,
        text: ep.text,
        isLie: ep.isLie,
        createdAt: new Date()
      })
    );

    // 3. Save atomically
    await this.gameRepository.createPresenterWithEpisodes(presenter, episodes);

    // 4. Return with episodes
    return {
      presenter: {
        ...presenter,
        episodes
      }
    };
  }
}
```

#### Create Server Action
```typescript
// src/app/actions/presenter.ts
export async function addPresenterWithEpisodesAction(
  formData: FormData
): Promise<
  | { success: true; presenter: PresenterWithLieDto }
  | { success: false; errors: Record<string, string[]> }
> {
  // 1. Parse form data
  const rawData = {
    gameId: formData.get('gameId'),
    nickname: formData.get('nickname'),
    episodes: [
      {
        text: formData.get('episode1_text'),
        isLie: formData.get('episode1_isLie') === 'true'
      },
      {
        text: formData.get('episode2_text'),
        isLie: formData.get('episode2_isLie') === 'true'
      },
      {
        text: formData.get('episode3_text'),
        isLie: formData.get('episode3_isLie') === 'true'
      }
    ]
  };

  // 2. Validate
  const validationResult = AddPresenterWithEpisodesSchema.safeParse(rawData);
  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors
    };
  }

  // 3. Check session
  const sessionId = await getCookie(COOKIE_NAMES.SESSION_ID);
  if (!sessionId) {
    return {
      success: false,
      errors: {
        _form: ['セッションが見つかりません。ログインし直してください。']
      }
    };
  }

  // 4. Execute use case
  const repository = InMemoryGameRepository.getInstance();
  const useCase = new AddPresenterWithEpisodes(repository);
  const result = await useCase.execute(validationResult.data);

  // 5. Revalidate cache
  revalidatePath(`/game/${validationResult.data.gameId}/presenters`);

  return {
    success: true,
    presenter: result.presenter
  };
}
```

### 2. Frontend Setup (45 minutes)

#### Create Custom Hook
```typescript
// src/hooks/usePresenterWithEpisodesForm.ts
export function usePresenterWithEpisodesForm({
  gameId,
  onSuccess
}: UsePresenterWithEpisodesFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    formData.append('gameId', gameId);

    try {
      const result = await addPresenterWithEpisodesAction(formData);

      if (result.success) {
        setIsSuccess(true);
        onSuccess?.(result.presenter);

        // Reset form after 3 seconds
        setTimeout(() => {
          e.currentTarget.reset();
          setIsSuccess(false);
        }, 3000);
      } else {
        setErrors(result.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
    errors,
    isSuccess
  };
}
```

#### Create Form Component
```typescript
// src/components/domain/game/PresenterWithEpisodesForm.tsx
export function PresenterWithEpisodesForm({ gameId, onPresenterAdded }: Props) {
  const { handleSubmit, isSubmitting, errors, isSuccess } =
    usePresenterWithEpisodesForm({ gameId, onSuccess: onPresenterAdded });

  const [episodes, setEpisodes] = useState([
    { text: '', isLie: false },
    { text: '', isLie: false },
    { text: '', isLie: false }
  ]);

  const handleEpisodeChange = (index: number, field: 'text' | 'isLie', value: any) => {
    const newEpisodes = [...episodes];
    newEpisodes[index] = { ...newEpisodes[index], [field]: value };
    setEpisodes(newEpisodes);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nickname Field */}
      <div>
        <label htmlFor="nickname">ニックネーム</label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          maxLength={50}
          required
          disabled={isSubmitting || isSuccess}
        />
        {errors.nickname && <p className="error">{errors.nickname[0]}</p>}
      </div>

      {/* Episode Fields */}
      {episodes.map((episode, index) => (
        <div key={index} className="border p-4 rounded">
          <h3>エピソード {index + 1}</h3>

          <textarea
            name={`episode${index + 1}_text`}
            value={episode.text}
            onChange={(e) => handleEpisodeChange(index, 'text', e.target.value)}
            maxLength={1000}
            required
            disabled={isSubmitting || isSuccess}
          />
          <div>{episode.text.length}/1000文字</div>

          <label>
            <input
              type="checkbox"
              name={`episode${index + 1}_isLie`}
              value="true"
              checked={episode.isLie}
              onChange={(e) => handleEpisodeChange(index, 'isLie', e.target.checked)}
              disabled={isSubmitting || isSuccess}
            />
            これはウソのエピソードです
          </label>
        </div>
      ))}

      {/* Form-level errors */}
      {errors.episodes && (
        <div className="error">{errors.episodes[0]}</div>
      )}

      {/* Success message */}
      {isSuccess && (
        <div className="success">
          プレゼンターと3つのエピソードを登録しました！
        </div>
      )}

      {/* Submit button */}
      <button type="submit" disabled={isSubmitting || isSuccess}>
        {isSubmitting ? '登録中...' : 'プレゼンターを登録'}
      </button>
    </form>
  );
}
```

### 3. Testing (30 minutes)

#### Unit Test for Use Case
```typescript
// tests/unit/use-cases/AddPresenterWithEpisodes.test.ts
describe('AddPresenterWithEpisodes', () => {
  it('should create presenter with 3 episodes atomically', async () => {
    const repository = new InMemoryGameRepository();
    const useCase = new AddPresenterWithEpisodes(repository);

    const result = await useCase.execute({
      gameId: 'game-123',
      nickname: 'テスト太郎',
      episodes: [
        { text: 'エピソード1', isLie: false },
        { text: 'エピソード2', isLie: false },
        { text: 'エピソード3', isLie: true }
      ]
    });

    expect(result.presenter.nickname).toBe('テスト太郎');
    expect(result.presenter.episodes).toHaveLength(3);
    expect(result.presenter.episodes.filter(e => e.isLie)).toHaveLength(1);
  });

  it('should fail if not exactly 1 lie', async () => {
    // Test validation...
  });
});
```

#### Component Test
```typescript
// tests/component/PresenterWithEpisodesForm.test.tsx
describe('PresenterWithEpisodesForm', () => {
  it('should submit form with all fields', async () => {
    render(<PresenterWithEpisodesForm gameId="game-123" />);

    // Fill form
    await userEvent.type(screen.getByLabelText('ニックネーム'), 'テスト太郎');
    await userEvent.type(screen.getByLabelText('エピソード 1'), 'エピソード1の内容');
    // ... fill other fields

    // Submit
    await userEvent.click(screen.getByRole('button', { name: 'プレゼンターを登録' }));

    // Verify success
    await waitFor(() => {
      expect(screen.getByText('プレゼンターと3つのエピソードを登録しました！')).toBeInTheDocument();
    });
  });
});
```

## Integration Checklist

- [ ] Add `AddPresenterWithEpisodesSchema` to `gameSchemas.ts`
- [ ] Create `AddPresenterWithEpisodes` use case
- [ ] Add `createPresenterWithEpisodes` method to repository
- [ ] Create `addPresenterWithEpisodesAction` server action
- [ ] Build `usePresenterWithEpisodesForm` custom hook
- [ ] Create `PresenterWithEpisodesForm` component
- [ ] Replace old `PresenterForm` in `PresenterManagementPage`
- [ ] Write unit tests for use case
- [ ] Write component tests for form
- [ ] Run Biome formatting on all new files
- [ ] Update documentation

## Common Issues & Solutions

### Issue: Form doesn't validate lie count
**Solution**: Ensure the Zod schema refinement is properly checking the array filter

### Issue: Episodes not saving atomically
**Solution**: Implement transaction-like behavior in repository method

### Issue: Character counter not updating
**Solution**: Use controlled components with state for real-time updates

### Issue: Success message not showing
**Solution**: Check that revalidatePath is called after successful save

## Performance Tips

1. **Debounce validation**: Add 50ms debounce to character counters
2. **Memoize episode components**: Use React.memo for episode input sections
3. **Lazy load form**: Only load form component when adding presenter
4. **Optimize re-renders**: Use useCallback for event handlers

## Migration from Old Flow

1. **Phase 1**: Deploy new form alongside old one
2. **Phase 2**: Switch default to new form, keep old as fallback
3. **Phase 3**: Remove old form components after verification
4. **Phase 4**: Clean up deprecated server actions and use cases