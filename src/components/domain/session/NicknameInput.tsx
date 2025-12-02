'use client';

// NicknameInput component
// Pure presentational component for nickname input form

import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNicknameForm } from './hooks/useNicknameForm';

/**
 * NicknameInput component
 * Client Component that handles user interaction for setting nickname
 * Logic is delegated to useNicknameForm hook (constitution Principle III)
 */
export function NicknameInput() {
  const { t } = useLanguage();
  const { nickname, error, isSubmitting, handleChange, handleSubmit } = useNicknameForm();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">{t('session.enterNickname')}</h2>

      <p className="mb-6 text-sm text-gray-600">{t('session.enterNickname')}</p>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <Input
          type="text"
          label={t('form.presenter.nickname.label')}
          placeholder={t('form.presenter.nickname.example')}
          value={nickname}
          onChange={(e) => handleChange(e.target.value)}
          error={error ?? undefined}
          disabled={isSubmitting}
          maxLength={50}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('status.labels.loading') : t('common.submit')}
        </Button>
      </form>
    </div>
  );
}
