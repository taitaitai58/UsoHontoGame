// Unit Tests: GetPresentersByGameId Use Case
// Feature: 002-game-preparation
// Tests for retrieving all presenters for a game

import { nanoid } from 'nanoid';
import { beforeEach, describe, expect, it } from 'vitest';
import { GetPresentersByGameId } from '@/server/application/use-cases/games/GetPresentersByGameId';
import { Episode } from '@/server/domain/entities/Episode';
import { Presenter } from '@/server/domain/entities/Presenter';
import { InMemoryGameRepository } from '@/server/infrastructure/repositories/InMemoryGameRepository';

describe('GetPresentersByGameId Use Case', () => {
  let repository: InMemoryGameRepository;
  let useCase: GetPresentersByGameId;

  beforeEach(() => {
    repository = InMemoryGameRepository.getInstance();
    repository.clear(); // Clear repository before each test
    useCase = new GetPresentersByGameId(repository);
  });

  describe('Success Cases', () => {
    it('should return empty array when game has no presenters', async () => {
      // Given
      const gameId = 'game-123';
      const requesterId = 'session-456';

      // When
      const result = await useCase.execute({
        gameId,
        requesterId,
      });

      // Then
      expect(result.presenters).toEqual([]);
    });

    it('should return all presenters for a game without episodes', async () => {
      // Given
      const gameId = 'game-123';
      const requesterId = 'session-456';

      // Add 2 presenters to the game
      const presenter1 = Presenter.createIncomplete({
        id: nanoid(),
        gameId,
        nickname: 'Presenter1',
        episodes: [],
        createdAt: new Date(),
      });

      const presenter2 = Presenter.createIncomplete({
        id: nanoid(),
        gameId,
        nickname: 'Presenter2',
        episodes: [],
        createdAt: new Date(),
      });

      await repository.addPresenter(presenter1);
      await repository.addPresenter(presenter2);

      // When
      const result = await useCase.execute({
        gameId,
        requesterId,
      });

      // Then
      expect(result.presenters).toHaveLength(2);
      expect(result.presenters[0].gameId).toBe(gameId);
      expect(result.presenters[0].episodes).toHaveLength(0);
      expect(result.presenters[1].gameId).toBe(gameId);
      expect(result.presenters[1].episodes).toHaveLength(0);
    });

    it('should return presenters with their episodes', async () => {
      // Given
      const gameId = 'game-123';
      const requesterId = 'session-456';

      // Add presenter with episodes
      const presenterId = nanoid();
      const presenter = Presenter.createIncomplete({
        id: presenterId,
        gameId,
        nickname: 'PresenterWithEpisodes',
        episodes: [],
        createdAt: new Date(),
      });

      await repository.addPresenter(presenter);

      // Add 3 episodes to the presenter
      const episode1 = Episode.create({
        id: nanoid(),
        presenterId,
        text: 'Episode 1',
        isLie: false,
        createdAt: new Date(),
      });

      const episode2 = Episode.create({
        id: nanoid(),
        presenterId,
        text: 'Episode 2',
        isLie: false,
        createdAt: new Date(),
      });

      const episode3 = Episode.create({
        id: nanoid(),
        presenterId,
        text: 'Episode 3 (Lie)',
        isLie: true,
        createdAt: new Date(),
      });

      await repository.addEpisode(episode1);
      await repository.addEpisode(episode2);
      await repository.addEpisode(episode3);

      // When
      const result = await useCase.execute({
        gameId,
        requesterId,
      });

      // Then
      expect(result.presenters).toHaveLength(1);
      expect(result.presenters[0].nickname).toBe('PresenterWithEpisodes');
      expect(result.presenters[0].episodes).toHaveLength(3);
      expect(result.presenters[0].episodes[0].text).toBe('Episode 1');
      expect(result.presenters[0].episodes[0].isLie).toBe(false);
      expect(result.presenters[0].episodes[2].text).toBe('Episode 3 (Lie)');
      expect(result.presenters[0].episodes[2].isLie).toBe(true);
    });

    it('should only return presenters for the specified game', async () => {
      // Given
      const gameId1 = 'game-123';
      const gameId2 = 'game-456';
      const requesterId = 'session-789';

      // Add presenters to different games
      const presenter1 = Presenter.createIncomplete({
        id: nanoid(),
        gameId: gameId1,
        nickname: 'Game1Presenter',
        episodes: [],
        createdAt: new Date(),
      });

      const presenter2 = Presenter.createIncomplete({
        id: nanoid(),
        gameId: gameId2,
        nickname: 'Game2Presenter',
        episodes: [],
        createdAt: new Date(),
      });

      await repository.addPresenter(presenter1);
      await repository.addPresenter(presenter2);

      // When: Query for game1
      const result = await useCase.execute({
        gameId: gameId1,
        requesterId,
      });

      // Then: Only game1 presenter should be returned
      expect(result.presenters).toHaveLength(1);
      expect(result.presenters[0].nickname).toBe('Game1Presenter');
      expect(result.presenters[0].gameId).toBe(gameId1);
    });

    it('should handle multiple presenters with episodes', async () => {
      // Given
      const gameId = 'game-123';
      const requesterId = 'session-456';

      // Add 2 presenters with episodes
      const presenter1Id = nanoid();
      const presenter1 = Presenter.createIncomplete({
        id: presenter1Id,
        gameId,
        nickname: 'Presenter1',
        episodes: [],
        createdAt: new Date(),
      });

      const presenter2Id = nanoid();
      const presenter2 = Presenter.createIncomplete({
        id: presenter2Id,
        gameId,
        nickname: 'Presenter2',
        episodes: [],
        createdAt: new Date(),
      });

      await repository.addPresenter(presenter1);
      await repository.addPresenter(presenter2);

      // Add episodes to presenter1
      await repository.addEpisode(
        Episode.create({
          id: nanoid(),
          presenterId: presenter1Id,
          text: 'P1 Episode 1',
          isLie: false,
          createdAt: new Date(),
        })
      );

      await repository.addEpisode(
        Episode.create({
          id: nanoid(),
          presenterId: presenter1Id,
          text: 'P1 Episode 2',
          isLie: true,
          createdAt: new Date(),
        })
      );

      // Add episodes to presenter2
      await repository.addEpisode(
        Episode.create({
          id: nanoid(),
          presenterId: presenter2Id,
          text: 'P2 Episode 1',
          isLie: false,
          createdAt: new Date(),
        })
      );

      // When
      const result = await useCase.execute({
        gameId,
        requesterId,
      });

      // Then
      expect(result.presenters).toHaveLength(2);

      const p1 = result.presenters.find((p) => p.nickname === 'Presenter1');
      const p2 = result.presenters.find((p) => p.nickname === 'Presenter2');

      expect(p1).toBeDefined();
      expect(p1?.episodes).toHaveLength(2);
      expect(p2).toBeDefined();
      expect(p2?.episodes).toHaveLength(1);
    });
  });

  describe('Data Integrity', () => {
    it('should include all required episode fields', async () => {
      // Given
      const gameId = 'game-123';
      const requesterId = 'session-456';
      const presenterId = nanoid();

      const presenter = Presenter.createIncomplete({
        id: presenterId,
        gameId,
        nickname: 'TestPresenter',
        episodes: [],
        createdAt: new Date(),
      });

      await repository.addPresenter(presenter);

      const episodeId = nanoid();
      const createdAt = new Date();
      const episode = Episode.create({
        id: episodeId,
        presenterId,
        text: 'Test Episode',
        isLie: true,
        createdAt,
      });

      await repository.addEpisode(episode);

      // When
      const result = await useCase.execute({
        gameId,
        requesterId,
      });

      // Then
      const returnedEpisode = result.presenters[0].episodes[0];
      expect(returnedEpisode.id).toBe(episodeId);
      expect(returnedEpisode.presenterId).toBe(presenterId);
      expect(returnedEpisode.text).toBe('Test Episode');
      expect(returnedEpisode.isLie).toBe(true);
      expect(returnedEpisode.createdAt).toEqual(createdAt);
    });

    it('should handle multiple episodes per presenter', async () => {
      // Given
      const gameId = 'game-123';
      const requesterId = 'session-456';
      const presenterId = nanoid();

      const presenter = Presenter.createIncomplete({
        id: presenterId,
        gameId,
        nickname: 'TestPresenter',
        episodes: [],
        createdAt: new Date(),
      });

      await repository.addPresenter(presenter);

      // Add multiple episodes
      for (let i = 0; i < 3; i++) {
        await repository.addEpisode(
          Episode.create({
            id: nanoid(),
            presenterId,
            text: `Episode ${i}`,
            isLie: i === 2,
            createdAt: new Date(),
          })
        );
      }

      // When
      const result = await useCase.execute({
        gameId,
        requesterId,
      });

      // Then
      expect(result.presenters[0].episodes).toHaveLength(3);
      expect(result.presenters[0].episodes[0].text).toBe('Episode 0');
      expect(result.presenters[0].episodes[1].text).toBe('Episode 1');
      expect(result.presenters[0].episodes[2].text).toBe('Episode 2');
      expect(result.presenters[0].episodes[2].isLie).toBe(true);
    });
  });
});
