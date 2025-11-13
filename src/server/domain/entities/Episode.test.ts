import { describe, expect, it } from 'vitest';
import { Episode } from '@/server/domain/entities/Episode';
import { ValidationError } from '@/server/domain/errors/ValidationError';

describe('Episode', () => {
  describe('create', () => {
    it('should create Episode with valid properties', () => {
      const props = {
        id: 'ep-123',
        presenterId: 'presenter-456',
        text: 'I once climbed Mount Fuji.',
        isLie: false,
        createdAt: new Date(),
      };

      const episode = Episode.create(props);

      expect(episode.id).toBe(props.id);
      expect(episode.presenterId).toBe(props.presenterId);
      expect(episode.text).toBe(props.text);
      expect(episode.isLie).toBe(false);
      expect(episode.createdAt).toBe(props.createdAt);
    });

    it('should create Episode marked as lie', () => {
      const props = {
        id: 'ep-123',
        presenterId: 'presenter-456',
        text: 'I have never traveled abroad.',
        isLie: true,
        createdAt: new Date(),
      };

      const episode = Episode.create(props);

      expect(episode.isLie).toBe(true);
      expect(episode.isTruth()).toBe(false);
    });

    it('should create Episode with maximum length text (1000 characters)', () => {
      const longText = 'a'.repeat(1000);
      const props = {
        id: 'ep-123',
        presenterId: 'presenter-456',
        text: longText,
        isLie: false,
        createdAt: new Date(),
      };

      const episode = Episode.create(props);

      expect(episode.text).toBe(longText);
      expect(episode.text.length).toBe(1000);
    });

    it('should throw ValidationError for empty text', () => {
      const props = {
        id: 'ep-123',
        presenterId: 'presenter-456',
        text: '',
        isLie: false,
        createdAt: new Date(),
      };

      expect(() => Episode.create(props)).toThrow(ValidationError);
      expect(() => Episode.create(props)).toThrow('Episode text cannot be empty');
    });

    it('should throw ValidationError for whitespace-only text', () => {
      const props = {
        id: 'ep-123',
        presenterId: 'presenter-456',
        text: '   ',
        isLie: false,
        createdAt: new Date(),
      };

      expect(() => Episode.create(props)).toThrow(ValidationError);
      expect(() => Episode.create(props)).toThrow('Episode text cannot be empty');
    });

    it('should throw ValidationError for text exceeding 1000 characters', () => {
      const tooLongText = 'a'.repeat(1001);
      const props = {
        id: 'ep-123',
        presenterId: 'presenter-456',
        text: tooLongText,
        isLie: false,
        createdAt: new Date(),
      };

      expect(() => Episode.create(props)).toThrow(ValidationError);
      expect(() => Episode.create(props)).toThrow('Episode text cannot exceed 1000 characters');
    });

    it('should accept text with exactly 1 character', () => {
      const props = {
        id: 'ep-123',
        presenterId: 'presenter-456',
        text: 'a',
        isLie: false,
        createdAt: new Date(),
      };

      const episode = Episode.create(props);

      expect(episode.text).toBe('a');
    });
  });

  describe('isTruth', () => {
    it('should return true for truth episodes', () => {
      const props = {
        id: 'ep-123',
        presenterId: 'presenter-456',
        text: 'I have a pet dog.',
        isLie: false,
        createdAt: new Date(),
      };

      const episode = Episode.create(props);

      expect(episode.isTruth()).toBe(true);
    });

    it('should return false for lie episodes', () => {
      const props = {
        id: 'ep-123',
        presenterId: 'presenter-456',
        text: 'I have been to space.',
        isLie: true,
        createdAt: new Date(),
      };

      const episode = Episode.create(props);

      expect(episode.isTruth()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for episodes with same ID', () => {
      const props1 = {
        id: 'ep-123',
        presenterId: 'presenter-456',
        text: 'Story 1',
        isLie: false,
        createdAt: new Date(),
      };

      const props2 = {
        id: 'ep-123',
        presenterId: 'presenter-789',
        text: 'Story 2',
        isLie: true,
        createdAt: new Date(),
      };

      const episode1 = Episode.create(props1);
      const episode2 = Episode.create(props2);

      expect(episode1.equals(episode2)).toBe(true);
    });

    it('should return false for episodes with different IDs', () => {
      const props1 = {
        id: 'ep-123',
        presenterId: 'presenter-456',
        text: 'Story 1',
        isLie: false,
        createdAt: new Date(),
      };

      const props2 = {
        id: 'ep-456',
        presenterId: 'presenter-456',
        text: 'Story 1',
        isLie: false,
        createdAt: new Date(),
      };

      const episode1 = Episode.create(props1);
      const episode2 = Episode.create(props2);

      expect(episode1.equals(episode2)).toBe(false);
    });
  });

  describe('toObject', () => {
    it('should convert episode to plain object', () => {
      const props = {
        id: 'ep-123',
        presenterId: 'presenter-456',
        text: 'I speak three languages.',
        isLie: false,
        createdAt: new Date('2025-01-10T10:00:00Z'),
      };

      const episode = Episode.create(props);
      const obj = episode.toObject();

      expect(obj).toEqual(props);
    });

    it('should preserve all properties in converted object', () => {
      const props = {
        id: 'ep-789',
        presenterId: 'presenter-999',
        text: 'I have never broken a bone.',
        isLie: true,
        createdAt: new Date('2025-01-10T15:30:00Z'),
      };

      const episode = Episode.create(props);
      const obj = episode.toObject();

      expect(obj.id).toBe(props.id);
      expect(obj.presenterId).toBe(props.presenterId);
      expect(obj.text).toBe(props.text);
      expect(obj.isLie).toBe(props.isLie);
      expect(obj.createdAt).toBe(props.createdAt);
    });
  });

  describe('property getters', () => {
    it('should provide read-only access to all properties', () => {
      const props = {
        id: 'ep-123',
        presenterId: 'presenter-456',
        text: 'I have visited 10 countries.',
        isLie: false,
        createdAt: new Date(),
      };

      const episode = Episode.create(props);

      expect(episode.id).toBe(props.id);
      expect(episode.presenterId).toBe(props.presenterId);
      expect(episode.text).toBe(props.text);
      expect(episode.isLie).toBe(props.isLie);
      expect(episode.createdAt).toBe(props.createdAt);
    });
  });
});
