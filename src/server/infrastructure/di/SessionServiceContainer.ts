// Session Service Dependency Injection Container
// Provides session service instances with singleton pattern

import type { ISessionService } from '@/server/application/services/ISessionService';
import type { ISessionRepository } from '@/server/domain/repositories/ISessionRepository';
import { CookieSessionService } from '../services/CookieSessionService';
import { CookieSessionRepository } from '../repositories/CookieSessionRepository';

/**
 * Session Service Dependency Injection Container
 * Follows same pattern as Repository factory for consistency
 * Provides singleton instances of session services
 */
// biome-ignore lint/complexity/noStaticOnlyClass: This is a dependency injection container pattern
export class SessionServiceContainer {
  private static sessionService: ISessionService | null = null;
  private static sessionRepository: ISessionRepository | null = null;

  /**
   * Gets session service instance (singleton)
   * Currently only supports Cookie-based implementation
   * Can be extended for other session storage mechanisms (JWT, Redis, etc.)
   */
  static getSessionService(): ISessionService {
    if (!SessionServiceContainer.sessionService) {
      SessionServiceContainer.sessionService = new CookieSessionService();
    }
    return SessionServiceContainer.sessionService;
  }

  /**
   * Gets session repository instance (singleton)
   */
  static getSessionRepository(): ISessionRepository {
    if (!SessionServiceContainer.sessionRepository) {
      SessionServiceContainer.sessionRepository = new CookieSessionRepository();
    }
    return SessionServiceContainer.sessionRepository;
  }

  /**
   * Reset singleton instances (for testing)
   * @internal
   */
  static resetForTesting(): void {
    SessionServiceContainer.sessionService = null;
    SessionServiceContainer.sessionRepository = null;
  }

  /**
   * Set custom session service (for testing)
   * @internal
   */
  static setSessionService(service: ISessionService): void {
    SessionServiceContainer.sessionService = service;
  }

  /**
   * Set custom session repository (for testing)
   * @internal
   */
  static setSessionRepository(repo: ISessionRepository): void {
    SessionServiceContainer.sessionRepository = repo;
  }
}
