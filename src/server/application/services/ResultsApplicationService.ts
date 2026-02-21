// ResultsApplicationService
// Feature: 006-results-dashboard
// 結果・ランキング取得の Application Service（読み取り系）

import { SessionServiceContainer } from '@/server/infrastructure/di/SessionServiceContainer';
import { createAnswerRepository, createGameRepository } from '@/server/infrastructure/repositories';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import type { IAnswerRepository } from '@/server/domain/repositories/IAnswerRepository';
import { GetResults } from '@/server/application/use-cases/results/GetResults';
import type { RankingDto } from '@/server/application/dto/RankingDto';
import type { ServiceResponse } from './types';
import { mapDomainErrorToServiceError } from './errorHandlers';

/**
 * ResultsApplicationService
 * 結果・ランキング取得のビジネスロジックを調整
 * セッション取得、リポジトリ注入、UseCase実行、エラー変換を担当
 */
export class ResultsApplicationService {
  constructor(
    private readonly gameRepository: IGameRepository = createGameRepository(),
    private readonly answerRepository: IAnswerRepository = createAnswerRepository()
  ) {}

  /**
   * ゲーム結果（ランキング）取得
   * @param gameId ゲームID
   * @returns ランキングデータ（締切ゲームのみ）
   */
  async getResults(gameId: string): Promise<ServiceResponse<RankingDto>> {
    try {
      const sessionService = SessionServiceContainer.getSessionService();
      await sessionService.requireCurrentSession();

      const useCase = new GetResults(this.gameRepository, this.answerRepository);
      const result = await useCase.execute(gameId);

      if (!result.success) {
        return {
          success: false,
          errors: result.errors,
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return mapDomainErrorToServiceError(error, 'action.results.get.error');
    }
  }
}
