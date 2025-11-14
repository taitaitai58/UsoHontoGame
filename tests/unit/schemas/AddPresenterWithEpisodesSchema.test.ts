// Unit Tests: AddPresenterWithEpisodesSchema
// Feature: 003-presenter-episode-inline

import { describe, expect, it } from 'vitest';
import { AddPresenterWithEpisodesSchema } from '@/server/domain/schemas/gameSchemas';

describe('AddPresenterWithEpisodesSchema', () => {
  const validData = {
    gameId: 'game-123',
    nickname: 'テスト太郎',
    episodes: [
      { text: 'エピソード1', isLie: false },
      { text: 'エピソード2', isLie: false },
      { text: 'エピソード3', isLie: true },
    ],
  };

  describe('Valid Cases', () => {
    it('should accept valid input with exactly 1 lie', () => {
      const result = AddPresenterWithEpisodesSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept max length values', () => {
      const data = {
        gameId: 'game-123',
        nickname: 'a'.repeat(50),
        episodes: [
          { text: 'a'.repeat(1000), isLie: false },
          { text: 'b'.repeat(1000), isLie: false },
          { text: 'c'.repeat(1000), isLie: true },
        ],
      };
      const result = AddPresenterWithEpisodesSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('Nickname Validation', () => {
    it('should reject empty nickname', () => {
      const data = { ...validData, nickname: '' };
      const result = AddPresenterWithEpisodesSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.nickname?.[0]).toContain(
          'ニックネームを入力してください'
        );
      }
    });

    it('should reject nickname > 50 chars', () => {
      const data = { ...validData, nickname: 'a'.repeat(51) };
      const result = AddPresenterWithEpisodesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('Episodes Validation', () => {
    it('should reject if episodes count < 3', () => {
      const data = {
        ...validData,
        episodes: [
          { text: 'エピソード1', isLie: false },
          { text: 'エピソード2', isLie: true },
        ],
      };
      const result = AddPresenterWithEpisodesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject if episodes count > 3', () => {
      const data = {
        ...validData,
        episodes: [
          { text: 'エピソード1', isLie: false },
          { text: 'エピソード2', isLie: false },
          { text: 'エピソード3', isLie: false },
          { text: 'エピソード4', isLie: true },
        ],
      };
      const result = AddPresenterWithEpisodesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject empty episode text', () => {
      const data = {
        ...validData,
        episodes: [
          { text: '', isLie: false },
          { text: 'エピソード2', isLie: false },
          { text: 'エピソード3', isLie: true },
        ],
      };
      const result = AddPresenterWithEpisodesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject episode text > 1000 chars', () => {
      const data = {
        ...validData,
        episodes: [
          { text: 'a'.repeat(1001), isLie: false },
          { text: 'エピソード2', isLie: false },
          { text: 'エピソード3', isLie: true },
        ],
      };
      const result = AddPresenterWithEpisodesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('Lie Marker Validation', () => {
    it('should reject if no lie marker', () => {
      const data = {
        ...validData,
        episodes: [
          { text: 'エピソード1', isLie: false },
          { text: 'エピソード2', isLie: false },
          { text: 'エピソード3', isLie: false },
        ],
      };
      const result = AddPresenterWithEpisodesSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.episodes?.[0]).toContain(
          'ウソのエピソードは1つだけ選択してください'
        );
      }
    });

    it('should reject if multiple lie markers', () => {
      const data = {
        ...validData,
        episodes: [
          { text: 'エピソード1', isLie: true },
          { text: 'エピソード2', isLie: false },
          { text: 'エピソード3', isLie: true },
        ],
      };
      const result = AddPresenterWithEpisodesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('GameId Validation', () => {
    it('should reject empty gameId', () => {
      const data = { ...validData, gameId: '' };
      const result = AddPresenterWithEpisodesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
