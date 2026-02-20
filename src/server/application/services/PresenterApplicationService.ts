// PresenterApplicationService
// Server Actions リファクタリング - Phase 3
// 出題者・エピソード管理のApplication Service

import { SessionServiceContainer } from '@/server/infrastructure/di/SessionServiceContainer';
import { createGameRepository } from '@/server/infrastructure/repositories';
import { AddPresenter } from '@/server/application/use-cases/games/AddPresenter';
import { AddPresenterWithEpisodes } from '@/server/application/use-cases/games/AddPresenterWithEpisodes';
import { RemovePresenter } from '@/server/application/use-cases/games/RemovePresenter';
import { AddEpisode } from '@/server/application/use-cases/games/AddEpisode';
import type { PresenterWithLieDto } from '@/server/application/dto/PresenterWithLieDto';
import type { EpisodeWithLieDto } from '@/server/application/dto/EpisodeWithLieDto';
import type { ServiceResponse, ServiceVoidResponse } from './types';
import { mapDomainErrorToServiceError } from './errorHandlers';

/**
 * PresenterApplicationService
 * 出題者・エピソード管理のビジネスロジックを調整
 * セッション取得、リポジトリ注入、UseCase実行、エラー変換を担当
 */
export class PresenterApplicationService {
  /**
   * 出題者追加
   * @param input 出題者追加パラメータ
   * @returns 追加された出題者情報
   */
  async addPresenter(input: {
    gameId: string;
    nickname: string;
  }): Promise<ServiceResponse<PresenterWithLieDto>> {
    try {
      // 1. セッション取得
      const sessionService = SessionServiceContainer.getSessionService();
      await sessionService.requireCurrentSession();

      // 2. リポジトリ・UseCase準備
      const repository = createGameRepository();
      const useCase = new AddPresenter(repository);

      // 3. UseCase実行
      const result = await useCase.execute({
        gameId: input.gameId,
        nickname: input.nickname,
      });

      return {
        success: true,
        data: result.presenter,
      };
    } catch (error) {
      return mapDomainErrorToServiceError(error, 'action.presenter.add.error');
    }
  }

  /**
   * 出題者＋エピソード一括追加
   * @param input 出題者＋エピソード追加パラメータ
   * @returns 追加された出題者情報（エピソード含む）
   */
  async addPresenterWithEpisodes(input: {
    gameId: string;
    nickname: string;
    episodes: Array<{ text: string; isLie: boolean }>;
  }): Promise<ServiceResponse<PresenterWithLieDto>> {
    try {
      // 1. セッション取得
      const sessionService = SessionServiceContainer.getSessionService();
      await sessionService.requireCurrentSession();

      // 2. リポジトリ・UseCase準備
      const repository = createGameRepository();
      const useCase = new AddPresenterWithEpisodes(repository);

      // 3. UseCase実行
      const result = await useCase.execute({
        gameId: input.gameId,
        nickname: input.nickname,
        episodes: input.episodes,
      });

      return {
        success: true,
        data: result.presenter,
      };
    } catch (error) {
      return mapDomainErrorToServiceError(error, 'action.presenter.add.error');
    }
  }

  /**
   * 出題者削除
   * @param input 削除パラメータ
   * @returns 削除成功/失敗
   */
  async removePresenter(input: {
    gameId: string;
    presenterId: string;
  }): Promise<ServiceVoidResponse> {
    try {
      // 1. セッション取得
      const sessionService = SessionServiceContainer.getSessionService();
      await sessionService.requireCurrentSession();

      // 2. リポジトリ・UseCase準備
      const repository = createGameRepository();
      const useCase = new RemovePresenter(repository);

      // 3. UseCase実行
      await useCase.execute({
        presenterId: input.presenterId,
      });

      return { success: true };
    } catch (error) {
      return mapDomainErrorToServiceError(error, 'action.presenter.delete.error');
    }
  }

  /**
   * エピソード追加
   * @param input エピソード追加パラメータ
   * @returns 追加されたエピソード情報
   * @deprecated Feature 003以降は addPresenterWithEpisodes を使用
   */
  async addEpisode(input: {
    presenterId: string;
    text: string;
    isLie: boolean;
  }): Promise<ServiceResponse<EpisodeWithLieDto>> {
    try {
      // 1. セッション取得
      const sessionService = SessionServiceContainer.getSessionService();
      await sessionService.requireCurrentSession();

      // 2. リポジトリ・UseCase準備
      const repository = createGameRepository();
      const useCase = new AddEpisode(repository);

      // 3. UseCase実行
      const result = await useCase.execute({
        presenterId: input.presenterId,
        text: input.text,
        isLie: input.isLie,
      });

      return {
        success: true,
        data: result.episode,
      };
    } catch (error) {
      return mapDomainErrorToServiceError(error, 'action.episode.add.error');
    }
  }
}
