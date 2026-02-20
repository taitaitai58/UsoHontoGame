// AnswerApplicationService
// Server Actions リファクタリング - Phase 4
// 回答送信のApplication Service

import { translateZodError } from '@/lib/i18n/translateZodError';
import { SessionServiceContainer } from '@/server/infrastructure/di/SessionServiceContainer';
import {
  createAnswerRepository,
  createGameRepository,
  createParticipationRepository,
} from '@/server/infrastructure/repositories';
import { CookieSessionRepository } from '@/server/infrastructure/repositories/CookieSessionRepository';
import { GetGameForAnswers } from '@/server/application/use-cases/answers/GetGameForAnswers';
import { SubmitAnswer } from '@/server/application/use-cases/answers/SubmitAnswer';
import { ValidateSession } from '@/server/application/use-cases/session/ValidateSession';
import type { GetGameForAnswersResponse } from '@/server/application/use-cases/answers/GetGameForAnswers';
import { SubmitAnswerSchema } from '@/server/domain/schemas/answerSchemas';
import type { ServiceResponse } from './types';
import { mapDomainErrorToServiceError } from './errorHandlers';

// Session repository instance for session validation
const sessionRepository = new CookieSessionRepository();

/**
 * AnswerApplicationService
 * 回答送信のビジネスロジックを調整
 * セッション取得、リポジトリ注入、UseCase実行、エラー変換を担当
 */
export class AnswerApplicationService {
  /**
   * ゲーム情報取得（回答用）
   * @param gameId ゲームID
   * @returns ゲーム情報（出題者・エピソード含む）
   */
  async getGameForAnswers(gameId: string): Promise<GetGameForAnswersResponse> {
    try {
      // リポジトリ・UseCase準備
      const gameRepository = createGameRepository();
      const useCase = new GetGameForAnswers(gameRepository);

      // UseCase実行
      return await useCase.execute(gameId);
    } catch (error) {
      // GetGameForAnswersResponseはエラーも含む型なので、そのまま返す
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get game for answers',
        },
      };
    }
  }

  /**
   * 回答送信（バリデーション含む）
   * @param input 未検証の回答送信パラメータ
   * @returns 送信結果（answerIdとメッセージ）
   */
  async submitAnswer(input: unknown): Promise<ServiceResponse<{ answerId: string; message: string }>> {
    // 1. Zodバリデーション
    const validationResult = SubmitAnswerSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        errors: await translateZodError(validationResult.error),
      };
    }

    try {
      // 2. セッション取得
      const sessionService = SessionServiceContainer.getSessionService();
      const sessionId = await sessionService.requireCurrentSession();

      // 3. ValidateSessionでニックネームも取得
      const validateUseCase = new ValidateSession(sessionRepository);
      const session = await validateUseCase.execute(sessionId);

      // Use nickname if available, otherwise use default name based on sessionId
      const nickname = session?.nickname ?? `参加者_${sessionId.slice(0, 8)}`;

      // 4. リポジトリ・UseCase準備
      const gameRepository = createGameRepository();
      const answerRepository = createAnswerRepository();
      const participationRepository = createParticipationRepository();

      const useCase = new SubmitAnswer(answerRepository, participationRepository, gameRepository);

      // 5. UseCase実行
      const result = await useCase.execute({
        gameId: validationResult.data.gameId,
        sessionId,
        nickname,
        selections: validationResult.data.selections,
      });

      // 6. UseCase結果をServiceResponse形式に変換
      if (result.success) {
        return {
          success: true,
          data: result.data,
        };
      } else {
        return {
          success: false,
          errors: { _form: [result.error.message] },
        };
      }
    } catch (error) {
      return mapDomainErrorToServiceError(error, 'action.answer.submit.error');
    }
  }
}
