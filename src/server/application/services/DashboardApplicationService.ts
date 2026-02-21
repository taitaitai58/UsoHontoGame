// DashboardApplicationService
// Feature: 006-results-dashboard
// 回答状況ダッシュボード取得の Application Service（読み取り系）

import { SessionServiceContainer } from '@/server/infrastructure/di/SessionServiceContainer';
import { createAnswerRepository, createGameRepository } from '@/server/infrastructure/repositories';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import type { IAnswerRepository } from '@/server/domain/repositories/IAnswerRepository';
import { GetResponseStatus } from '@/server/application/use-cases/results/GetResponseStatus';
import type { ResponseStatusDto } from '@/server/application/dto/ResponseStatusDto';
import type { ServiceResponse } from './types';
import { mapDomainErrorToServiceError } from './errorHandlers';

/**
 * DashboardApplicationService
 * 回答状況ダッシュボードのビジネスロジックを調整
 * セッション取得、リポジトリ注入、UseCase実行、エラー変換を担当
 */
export class DashboardApplicationService {
  constructor(
    private readonly gameRepository: IGameRepository = createGameRepository(),
    private readonly answerRepository: IAnswerRepository = createAnswerRepository()
  ) {}

  /**
   * ゲームの回答状況取得（出題中・締切のみ）
   * @param gameId ゲームID
   * @returns 回答状況データ
   */
  async getResponseStatus(gameId: string): Promise<ServiceResponse<ResponseStatusDto>> {
    try {
      const sessionService = SessionServiceContainer.getSessionService();
      await sessionService.requireCurrentSession();

      const useCase = new GetResponseStatus(this.gameRepository, this.answerRepository);
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
      return mapDomainErrorToServiceError(error, 'action.dashboard.get.error');
    }
  }
}
