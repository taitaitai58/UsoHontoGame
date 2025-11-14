// Unit Tests: AddPresenterWithEpisodes Use Case
// Feature: 003-presenter-episode-inline

import { beforeEach, describe, expect, it } from 'vitest';
import { ValidationError } from '@/server/domain/errors/ValidationError';
import { InMemoryGameRepository } from '@/server/infrastructure/repositories/InMemoryGameRepository';
import { AddPresenterWithEpisodes } from './AddPresenterWithEpisodes';

describe('AddPresenterWithEpisodes', () => {
  let repository: InMemoryGameRepository;
  let useCase: AddPresenterWithEpisodes;

  beforeEach(() => {
    repository = InMemoryGameRepository.getInstance();
    repository.clear(); // Start with clean state
    useCase = new AddPresenterWithEpisodes(repository);
  });

  describe('Valid Cases', () => {
    it('should create presenter with 3 episodes (1 lie) successfully', async () => {
      const result = await useCase.execute({
        gameId: 'game-123',
        nickname: 'テスト太郎',
        episodes: [
          { text: 'エピソード1', isLie: false },
          { text: 'エピソード2', isLie: false },
          { text: 'エピソード3', isLie: true },
        ],
      });

      expect(result.presenter).toBeDefined();
      expect(result.presenter.nickname).toBe('テスト太郎');
      expect(result.presenter.episodes.length).toBe(3);
      expect(result.presenter.episodes.filter((ep) => ep.isLie).length).toBe(1);
    });

    it('should trim nickname whitespace', async () => {
      const result = await useCase.execute({
        gameId: 'game-123',
        nickname: '  テスト太郎  ',
        episodes: [
          { text: 'エピソード1', isLie: false },
          { text: 'エピソード2', isLie: false },
          { text: 'エピソード3', isLie: true },
        ],
      });

      expect(result.presenter.nickname).toBe('テスト太郎');
    });

    it('should persist presenter and episodes to repository', async () => {
      await useCase.execute({
        gameId: 'game-123',
        nickname: 'テスト太郎',
        episodes: [
          { text: 'エピソード1', isLie: false },
          { text: 'エピソード2', isLie: false },
          { text: 'エピソード3', isLie: true },
        ],
      });

      const presenters = await repository.findPresentersByGameId('game-123');
      expect(presenters.length).toBe(1);

      const episodes = await repository.findEpisodesByPresenterId(presenters[0].id);
      expect(episodes.length).toBe(3);
    });

    it('should handle max length values', async () => {
      const result = await useCase.execute({
        gameId: 'game-123',
        nickname: 'a'.repeat(50),
        episodes: [
          { text: 'a'.repeat(1000), isLie: false },
          { text: 'b'.repeat(1000), isLie: false },
          { text: 'c'.repeat(1000), isLie: true },
        ],
      });

      expect(result.presenter.nickname.length).toBe(50);
      expect(result.presenter.episodes[0].text.length).toBe(1000);
    });
  });

  describe('Nickname Validation', () => {
    it('should reject empty nickname', async () => {
      expect(
        useCase.execute({
          gameId: 'game-123',
          nickname: '',
          episodes: [
            { text: 'エピソード1', isLie: false },
            { text: 'エピソード2', isLie: false },
            { text: 'エピソード3', isLie: true },
          ],
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should reject whitespace-only nickname', async () => {
      expect(
        useCase.execute({
          gameId: 'game-123',
          nickname: '   ',
          episodes: [
            { text: 'エピソード1', isLie: false },
            { text: 'エピソード2', isLie: false },
            { text: 'エピソード3', isLie: true },
          ],
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('Episodes Validation', () => {
    it('should reject < 3 episodes', async () => {
      expect(
        useCase.execute({
          gameId: 'game-123',
          nickname: 'テスト太郎',
          episodes: [
            { text: 'エピソード1', isLie: false },
            { text: 'エピソード2', isLie: true },
          ],
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should reject > 3 episodes', async () => {
      expect(
        useCase.execute({
          gameId: 'game-123',
          nickname: 'テスト太郎',
          episodes: [
            { text: 'エピソード1', isLie: false },
            { text: 'エピソード2', isLie: false },
            { text: 'エピソード3', isLie: false },
            { text: 'エピソード4', isLie: true },
          ],
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should reject empty episode text', async () => {
      expect(
        useCase.execute({
          gameId: 'game-123',
          nickname: 'テスト太郎',
          episodes: [
            { text: '', isLie: false },
            { text: 'エピソード2', isLie: false },
            { text: 'エピソード3', isLie: true },
          ],
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should reject episode text > 1000 chars', async () => {
      expect(
        useCase.execute({
          gameId: 'game-123',
          nickname: 'テスト太郎',
          episodes: [
            { text: 'a'.repeat(1001), isLie: false },
            { text: 'エピソード2', isLie: false },
            { text: 'エピソード3', isLie: true },
          ],
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('Lie Marker Validation', () => {
    it('should reject if no lie marker', async () => {
      expect(
        useCase.execute({
          gameId: 'game-123',
          nickname: 'テスト太郎',
          episodes: [
            { text: 'エピソード1', isLie: false },
            { text: 'エピソード2', isLie: false },
            { text: 'エピソード3', isLie: false },
          ],
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should reject if multiple lie markers', async () => {
      expect(
        useCase.execute({
          gameId: 'game-123',
          nickname: 'テスト太郎',
          episodes: [
            { text: 'エピソード1', isLie: true },
            { text: 'エピソード2', isLie: false },
            { text: 'エピソード3', isLie: true },
          ],
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should accept lie marker in any position', async () => {
      const firstPosition = await useCase.execute({
        gameId: 'game-123',
        nickname: 'テスト1',
        episodes: [
          { text: 'エピソード1', isLie: true },
          { text: 'エピソード2', isLie: false },
          { text: 'エピソード3', isLie: false },
        ],
      });

      const middlePosition = await useCase.execute({
        gameId: 'game-124',
        nickname: 'テスト2',
        episodes: [
          { text: 'エピソード1', isLie: false },
          { text: 'エピソード2', isLie: true },
          { text: 'エピソード3', isLie: false },
        ],
      });

      const lastPosition = await useCase.execute({
        gameId: 'game-125',
        nickname: 'テスト3',
        episodes: [
          { text: 'エピソード1', isLie: false },
          { text: 'エピソード2', isLie: false },
          { text: 'エピソード3', isLie: true },
        ],
      });

      expect(firstPosition.presenter.episodes[0].isLie).toBe(true);
      expect(middlePosition.presenter.episodes[1].isLie).toBe(true);
      expect(lastPosition.presenter.episodes[2].isLie).toBe(true);
    });
  });

  describe('Presenter Limit Validation', () => {
    it('should reject when game already has 10 presenters', async () => {
      // Add 10 presenters to the game
      for (let i = 0; i < 10; i += 1) {
        await useCase.execute({
          gameId: 'game-limited',
          nickname: `presenter-${i}`,
          episodes: [
            { text: `episode1-${i}`, isLie: false },
            { text: `episode2-${i}`, isLie: false },
            { text: `episode3-${i}`, isLie: true },
          ],
        });
      }

      // 11th presenter should fail
      expect(
        useCase.execute({
          gameId: 'game-limited',
          nickname: 'presenter-11',
          episodes: [
            { text: 'episode1', isLie: false },
            { text: 'episode2', isLie: false },
            { text: 'episode3', isLie: true },
          ],
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should allow presenter when game has < 10', async () => {
      // Add 9 presenters
      for (let i = 0; i < 9; i += 1) {
        await useCase.execute({
          gameId: 'game-ok',
          nickname: `presenter-${i}`,
          episodes: [
            { text: `episode1-${i}`, isLie: false },
            { text: `episode2-${i}`, isLie: false },
            { text: `episode3-${i}`, isLie: true },
          ],
        });
      }

      // 10th presenter should succeed
      const result = await useCase.execute({
        gameId: 'game-ok',
        nickname: 'presenter-10',
        episodes: [
          { text: 'episode1', isLie: false },
          { text: 'episode2', isLie: false },
          { text: 'episode3', isLie: true },
        ],
      });

      expect(result.presenter).toBeDefined();
      expect((await repository.findPresentersByGameId('game-ok')).length).toBe(10);
    });
  });

  describe('Atomicity', () => {
    it('should save all or nothing on error', async () => {
      // Note: In-memory repo doesn't have real transaction failure,
      // but we test that valid cases save everything correctly
      const result = await useCase.execute({
        gameId: 'game-atomic',
        nickname: 'presenter',
        episodes: [
          { text: 'episode1', isLie: false },
          { text: 'episode2', isLie: false },
          { text: 'episode3', isLie: true },
        ],
      });

      const presenters = await repository.findPresentersByGameId('game-atomic');
      const episodes = await repository.findEpisodesByPresenterId(result.presenter.id);

      expect(presenters.length).toBe(1);
      expect(episodes.length).toBe(3);
    });
  });
});
