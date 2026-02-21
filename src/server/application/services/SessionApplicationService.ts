// SessionApplicationService
// Server Actions リファクタリング - Phase 5
// セッション管理のApplication Service

import { t } from '@/lib/i18n/server';
import { SessionServiceContainer } from '@/server/infrastructure/di/SessionServiceContainer';
import { CreateSession } from '@/server/application/use-cases/session/CreateSession';
import { SetNickname } from '@/server/application/use-cases/session/SetNickname';
import { ValidateSession } from '@/server/application/use-cases/session/ValidateSession';
import { EmptyNicknameError, NicknameTooLongError } from '@/server/domain/value-objects/Nickname';
import type { ISessionRepository } from '@/server/domain/repositories/ISessionRepository';

/**
 * Result types for SessionApplicationService
 */
export type CreateSessionResult =
  | { success: true; sessionId: string }
  | { success: false; error: { code: string; message: string } };

export type SetNicknameResult =
  | { success: true; nickname: string }
  | { success: false; error: { code: string; message: string } };

export type ValidateSessionResult = {
  valid: boolean;
  sessionId: string | null;
  nickname: string | null;
  hasNickname: boolean;
};

/**
 * SessionApplicationService
 * セッション管理のビジネスロジックを調整
 * セッションリポジトリ注入、UseCase実行、エラー変換を担当
 */
export class SessionApplicationService {
  constructor(
    private readonly sessionRepository: ISessionRepository = SessionServiceContainer.getSessionRepository()
  ) {}

  /**
   * セッション作成
   * @returns セッションID
   */
  async createSession(): Promise<CreateSessionResult> {
    try {
      const useCase = new CreateSession(this.sessionRepository);
      const session = await useCase.execute();

      return {
        success: true,
        sessionId: session.sessionId,
      };
    } catch {
      return {
        success: false,
        error: {
          code: 'SESSION_CREATION_FAILED',
          message: 'Failed to create session',
        },
      };
    }
  }

  /**
   * ニックネーム設定
   * @param nickname ニックネーム（1-50文字）
   * @returns 設定結果
   */
  async setNickname(nickname: string): Promise<SetNicknameResult> {
    try {
      // セッション作成（既存セッションがあればそれを使用）
      const createSessionUseCase = new CreateSession(this.sessionRepository);
      const session = await createSessionUseCase.execute();

      // ニックネーム設定
      const useCase = new SetNickname(this.sessionRepository);
      const result = await useCase.execute(session.sessionId, nickname);

      if (!result) {
        return {
          success: false,
          error: {
            code: 'NICKNAME_UPDATE_FAILED',
            message: await t('errors.nicknameUpdateFailed'),
          },
        };
      }

      return {
        success: true,
        nickname: result.nickname ?? '',
      };
    } catch (error) {
      if (error instanceof EmptyNicknameError) {
        return {
          success: false,
          error: {
            code: 'EMPTY_NICKNAME',
            message: await t('validation.nickname.empty'),
          },
        };
      }

      if (error instanceof NicknameTooLongError) {
        return {
          success: false,
          error: {
            code: 'NICKNAME_TOO_LONG',
            message: await t('validation.nickname.tooLong'),
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'NICKNAME_UPDATE_FAILED',
          message: await t('errors.nicknameUpdateFailed'),
        },
      };
    }
  }

  /**
   * セッション検証
   * @returns セッション有効性とデータ
   */
  async validateSession(): Promise<ValidateSessionResult> {
    try {
      // セッションサービスからセッションID取得
      const sessionService = SessionServiceContainer.getSessionService();
      const sessionId = await sessionService.getCurrentSessionId();

      if (!sessionId) {
        return {
          valid: false,
          sessionId: null,
          nickname: null,
          hasNickname: false,
        };
      }

      // セッション検証
      const useCase = new ValidateSession(this.sessionRepository);
      const session = await useCase.execute(sessionId);

      if (!session) {
        return {
          valid: false,
          sessionId: null,
          nickname: null,
          hasNickname: false,
        };
      }

      return {
        valid: true,
        sessionId: session.sessionId,
        nickname: session.nickname,
        hasNickname: session.nickname !== null,
      };
    } catch {
      return {
        valid: false,
        sessionId: null,
        nickname: null,
        hasNickname: false,
      };
    }
  }
}
