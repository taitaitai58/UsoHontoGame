'use server';

// Answer Submission Server Actions
// Feature: 001-lie-detection-answers, Server Actions リファクタリング - Phase 4
// Server Actions with Zod validation for answer submission
// Refactored to use AnswerApplicationService

import { t } from '@/lib/i18n/server';
import type { GetGameForAnswersResponse } from '@/server/application/use-cases/answers/GetGameForAnswers';
import { ServiceContainer } from '@/server/infrastructure/di/ServiceContainer';

/**
 * Server Action: Get game data for answer submission page
 * @param gameId Game ID to retrieve
 * @returns Game data or error response
 */
export async function getGameForAnswersAction(gameId: string): Promise<GetGameForAnswersResponse> {
  // Application Service呼び出し
  return await ServiceContainer.getAnswerService().getGameForAnswers(gameId);
}

/**
 * Server Action: Submit answer
 * Parses FormData and delegates to AnswerApplicationService (validation included)
 * @param formData Form data containing gameId and selections
 * @returns Success response with answerId or validation errors
 */
export async function submitAnswerAction(
  formData: FormData
): Promise<
  | { success: true; data: { answerId: string; message: string } }
  | { success: false; errors: Record<string, string[]> }
> {
  // 1. FormDataパース（型変換のみ）
  const gameId = formData.get('gameId') as string;
  const selectionsRaw = formData.get('selections') as string;

  let selections: Record<string, string>;
  try {
    selections = JSON.parse(selectionsRaw);
  } catch {
    return {
      success: false,
      errors: {
        selections: [await t('errors.invalid')],
      },
    };
  }

  // 2. Application Service呼び出し（バリデーション含む）
  const result = await ServiceContainer.getAnswerService().submitAnswer({
    gameId,
    selections,
  });

  return result;
}
