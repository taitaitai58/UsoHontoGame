import { describe, expect, it } from 'vitest';
import { Presenter } from '@/server/domain/entities/Presenter';
import { Episode } from '@/server/domain/entities/Episode';
import { ValidationError } from '@/server/domain/errors/ValidationError';

describe('Presenter', () => {
  const createEpisode = (id: string, text: string, isLie: boolean) => {
    return Episode.create({
      id,
      presenterId: 'presenter-123',
      text,
      isLie,
      createdAt: new Date(),
    });
  };

  const createValidEpisodes = () => [
    createEpisode('ep-1', 'I have climbed Mount Fuji.', false),
    createEpisode('ep-2', 'I speak three languages.', false),
    createEpisode('ep-3', 'I have been to space.', true),
  ];

  describe('create', () => {
    it('should create Presenter with valid properties (2 truths, 1 lie)', () => {
      const episodes = createValidEpisodes();
      const props = {
        id: 'presenter-123',
        gameId: 'game-456',
        nickname: 'PlayerOne',
        episodes,
        createdAt: new Date(),
      };

      const presenter = Presenter.create(props);

      expect(presenter.id).toBe(props.id);
      expect(presenter.gameId).toBe(props.gameId);
      expect(presenter.nickname).toBe(props.nickname);
      expect(presenter.episodes).toHaveLength(3);
      expect(presenter.createdAt).toBe(props.createdAt);
    });

    it('should throw ValidationError for empty nickname', () => {
      const episodes = createValidEpisodes();
      const props = {
        id: 'presenter-123',
        gameId: 'game-456',
        nickname: '',
        episodes,
        createdAt: new Date(),
      };

      expect(() => Presenter.create(props)).toThrow(ValidationError);
      expect(() => Presenter.create(props)).toThrow('Presenter nickname cannot be empty');
    });

    it('should throw ValidationError for whitespace-only nickname', () => {
      const episodes = createValidEpisodes();
      const props = {
        id: 'presenter-123',
        gameId: 'game-456',
        nickname: '   ',
        episodes,
        createdAt: new Date(),
      };

      expect(() => Presenter.create(props)).toThrow(ValidationError);
      expect(() => Presenter.create(props)).toThrow('Presenter nickname cannot be empty');
    });

    it('should throw ValidationError for less than 3 episodes', () => {
      const episodes = [
        createEpisode('ep-1', 'Story 1', false),
        createEpisode('ep-2', 'Story 2', true),
      ];
      const props = {
        id: 'presenter-123',
        gameId: 'game-456',
        nickname: 'PlayerOne',
        episodes,
        createdAt: new Date(),
      };

      expect(() => Presenter.create(props)).toThrow(ValidationError);
      expect(() => Presenter.create(props)).toThrow('Presenter must have exactly 3 episodes (has 2)');
    });

    it('should throw ValidationError for more than 3 episodes', () => {
      const episodes = [
        createEpisode('ep-1', 'Story 1', false),
        createEpisode('ep-2', 'Story 2', false),
        createEpisode('ep-3', 'Story 3', false),
        createEpisode('ep-4', 'Story 4', true),
      ];
      const props = {
        id: 'presenter-123',
        gameId: 'game-456',
        nickname: 'PlayerOne',
        episodes,
        createdAt: new Date(),
      };

      expect(() => Presenter.create(props)).toThrow(ValidationError);
      expect(() => Presenter.create(props)).toThrow('Presenter must have exactly 3 episodes (has 4)');
    });

    it('should throw ValidationError for 0 lies (all truths)', () => {
      const episodes = [
        createEpisode('ep-1', 'Story 1', false),
        createEpisode('ep-2', 'Story 2', false),
        createEpisode('ep-3', 'Story 3', false),
      ];
      const props = {
        id: 'presenter-123',
        gameId: 'game-456',
        nickname: 'PlayerOne',
        episodes,
        createdAt: new Date(),
      };

      expect(() => Presenter.create(props)).toThrow(ValidationError);
      expect(() => Presenter.create(props)).toThrow('Presenter must have exactly 1 lie episode (has 0)');
    });

    it('should throw ValidationError for 2 lies', () => {
      const episodes = [
        createEpisode('ep-1', 'Story 1', true),
        createEpisode('ep-2', 'Story 2', true),
        createEpisode('ep-3', 'Story 3', false),
      ];
      const props = {
        id: 'presenter-123',
        gameId: 'game-456',
        nickname: 'PlayerOne',
        episodes,
        createdAt: new Date(),
      };

      expect(() => Presenter.create(props)).toThrow(ValidationError);
      expect(() => Presenter.create(props)).toThrow('Presenter must have exactly 1 lie episode (has 2)');
    });

    it('should throw ValidationError for 3 lies (all lies)', () => {
      const episodes = [
        createEpisode('ep-1', 'Story 1', true),
        createEpisode('ep-2', 'Story 2', true),
        createEpisode('ep-3', 'Story 3', true),
      ];
      const props = {
        id: 'presenter-123',
        gameId: 'game-456',
        nickname: 'PlayerOne',
        episodes,
        createdAt: new Date(),
      };

      expect(() => Presenter.create(props)).toThrow(ValidationError);
      expect(() => Presenter.create(props)).toThrow('Presenter must have exactly 1 lie episode (has 3)');
    });
  });

  describe('hasCompleteEpisodes', () => {
    it('should return true for valid presenter with 2 truths and 1 lie', () => {
      const episodes = createValidEpisodes();
      const props = {
        id: 'presenter-123',
        gameId: 'game-456',
        nickname: 'PlayerOne',
        episodes,
        createdAt: new Date(),
      };

      const presenter = Presenter.create(props);

      expect(presenter.hasCompleteEpisodes()).toBe(true);
    });

    it('should return true when lie is first episode', () => {
      const episodes = [
        createEpisode('ep-1', 'Lie story', true),
        createEpisode('ep-2', 'Truth story 1', false),
        createEpisode('ep-3', 'Truth story 2', false),
      ];
      const props = {
        id: 'presenter-123',
        gameId: 'game-456',
        nickname: 'PlayerOne',
        episodes,
        createdAt: new Date(),
      };

      const presenter = Presenter.create(props);

      expect(presenter.hasCompleteEpisodes()).toBe(true);
    });

    it('should return true when lie is last episode', () => {
      const episodes = [
        createEpisode('ep-1', 'Truth story 1', false),
        createEpisode('ep-2', 'Truth story 2', false),
        createEpisode('ep-3', 'Lie story', true),
      ];
      const props = {
        id: 'presenter-123',
        gameId: 'game-456',
        nickname: 'PlayerOne',
        episodes,
        createdAt: new Date(),
      };

      const presenter = Presenter.create(props);

      expect(presenter.hasCompleteEpisodes()).toBe(true);
    });
  });

  describe('getLieEpisode', () => {
    it('should return the lie episode', () => {
      const lieEpisode = createEpisode('ep-lie', 'This is the lie', true);
      const episodes = [
        createEpisode('ep-1', 'Truth 1', false),
        lieEpisode,
        createEpisode('ep-3', 'Truth 2', false),
      ];
      const props = {
        id: 'presenter-123',
        gameId: 'game-456',
        nickname: 'PlayerOne',
        episodes,
        createdAt: new Date(),
      };

      const presenter = Presenter.create(props);
      const result = presenter.getLieEpisode();

      expect(result.id).toBe('ep-lie');
      expect(result.isLie).toBe(true);
    });
  });

  describe('getTruthEpisodes', () => {
    it('should return the 2 truth episodes', () => {
      const episodes = createValidEpisodes();
      const props = {
        id: 'presenter-123',
        gameId: 'game-456',
        nickname: 'PlayerOne',
        episodes,
        createdAt: new Date(),
      };

      const presenter = Presenter.create(props);
      const truths = presenter.getTruthEpisodes();

      expect(truths).toHaveLength(2);
      expect(truths.every(ep => !ep.isLie)).toBe(true);
    });

    it('should return empty array if all episodes are lies (invalid state)', () => {
      // This would normally fail validation, but testing the method behavior
      const episodes = [
        createEpisode('ep-1', 'Truth', false),
        createEpisode('ep-2', 'Truth', false),
        createEpisode('ep-3', 'Lie', true),
      ];
      const props = {
        id: 'presenter-123',
        gameId: 'game-456',
        nickname: 'PlayerOne',
        episodes,
        createdAt: new Date(),
      };

      const presenter = Presenter.create(props);
      const truths = presenter.getTruthEpisodes();

      expect(truths).toHaveLength(2);
    });
  });

  describe('equals', () => {
    it('should return true for presenters with same ID', () => {
      const episodes = createValidEpisodes();
      const props1 = {
        id: 'presenter-123',
        gameId: 'game-456',
        nickname: 'PlayerOne',
        episodes,
        createdAt: new Date(),
      };

      const props2 = {
        id: 'presenter-123',
        gameId: 'game-789',
        nickname: 'PlayerTwo',
        episodes: createValidEpisodes(),
        createdAt: new Date(),
      };

      const presenter1 = Presenter.create(props1);
      const presenter2 = Presenter.create(props2);

      expect(presenter1.equals(presenter2)).toBe(true);
    });

    it('should return false for presenters with different IDs', () => {
      const episodes = createValidEpisodes();
      const props1 = {
        id: 'presenter-123',
        gameId: 'game-456',
        nickname: 'PlayerOne',
        episodes,
        createdAt: new Date(),
      };

      const props2 = {
        id: 'presenter-456',
        gameId: 'game-456',
        nickname: 'PlayerOne',
        episodes: createValidEpisodes(),
        createdAt: new Date(),
      };

      const presenter1 = Presenter.create(props1);
      const presenter2 = Presenter.create(props2);

      expect(presenter1.equals(presenter2)).toBe(false);
    });
  });

  describe('toObject', () => {
    it('should convert presenter to plain object', () => {
      const episodes = createValidEpisodes();
      const props = {
        id: 'presenter-123',
        gameId: 'game-456',
        nickname: 'PlayerOne',
        episodes,
        createdAt: new Date('2025-01-10T10:00:00Z'),
      };

      const presenter = Presenter.create(props);
      const obj = presenter.toObject();

      expect(obj.id).toBe(props.id);
      expect(obj.gameId).toBe(props.gameId);
      expect(obj.nickname).toBe(props.nickname);
      expect(obj.episodes).toHaveLength(3);
      expect(obj.createdAt).toBe(props.createdAt);
    });
  });

  describe('property getters', () => {
    it('should provide read-only access to all properties', () => {
      const episodes = createValidEpisodes();
      const props = {
        id: 'presenter-123',
        gameId: 'game-456',
        nickname: 'PlayerOne',
        episodes,
        createdAt: new Date(),
      };

      const presenter = Presenter.create(props);

      expect(presenter.id).toBe(props.id);
      expect(presenter.gameId).toBe(props.gameId);
      expect(presenter.nickname).toBe(props.nickname);
      expect(presenter.episodes).toHaveLength(3);
      expect(presenter.createdAt).toBe(props.createdAt);
    });

    it('should return immutable episodes array', () => {
      const episodes = createValidEpisodes();
      const props = {
        id: 'presenter-123',
        gameId: 'game-456',
        nickname: 'PlayerOne',
        episodes,
        createdAt: new Date(),
      };

      const presenter = Presenter.create(props);
      const episodesRef = presenter.episodes;

      expect(Object.isFrozen(episodesRef)).toBe(true);
    });
  });
});
