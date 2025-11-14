// Unit Tests: usePresenterWithEpisodesForm Hook
// Feature: 003-presenter-episode-inline

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePresenterWithEpisodesForm } from '@/hooks/usePresenterWithEpisodesForm';

// Mock the server action
vi.mock('@/app/actions/presenter', () => ({
  addPresenterWithEpisodesAction: vi.fn(),
}));

describe('usePresenterWithEpisodesForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with empty form state', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm('game-123'));

      expect(result.current.formState.gameId).toBe('game-123');
      expect(result.current.formState.nickname).toBe('');
      expect(result.current.formState.episodes.length).toBe(3);
      expect(result.current.formState.episodes[0].text).toBe('');
      expect(result.current.formState.episodes[0].isLie).toBe(false);
    });

    it('should initialize with loading/success flags as false', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm('game-123'));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.errors).toBeUndefined();
    });
  });

  describe('Nickname Updates', () => {
    it('should update nickname value', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm('game-123'));

      act(() => {
        result.current.updateNickname('テスト太郎');
      });

      expect(result.current.formState.nickname).toBe('テスト太郎');
    });

    it('should clear errors when updating nickname', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm('game-123'));

      // Simulate error state
      act(() => {
        result.current.updateNickname('');
      });

      // Now update nickname
      act(() => {
        result.current.updateNickname('テスト太郎');
      });

      expect(result.current.errors).toBeUndefined();
    });

    it('should calculate nickname character count', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm('game-123'));

      act(() => {
        result.current.updateNickname('テスト');
      });

      expect(result.current.getNicknameCharCount()).toBe(3);
    });
  });

  describe('Episode Updates', () => {
    it('should update episode text', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm('game-123'));

      act(() => {
        result.current.updateEpisodeText(0, 'エピソード1');
      });

      expect(result.current.formState.episodes[0].text).toBe('エピソード1');
    });

    it('should update episode isLie marker', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm('game-123'));

      act(() => {
        result.current.updateEpisodeIsLie(0, true);
      });

      expect(result.current.formState.episodes[0].isLie).toBe(true);
    });

    it('should update different episodes independently', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm('game-123'));

      act(() => {
        result.current.updateEpisodeText(0, 'エピソード1');
        result.current.updateEpisodeText(1, 'エピソード2');
        result.current.updateEpisodeText(2, 'エピソード3');
        result.current.updateEpisodeIsLie(2, true);
      });

      expect(result.current.formState.episodes[0].text).toBe('エピソード1');
      expect(result.current.formState.episodes[1].text).toBe('エピソード2');
      expect(result.current.formState.episodes[2].text).toBe('エピソード3');
      expect(result.current.formState.episodes[0].isLie).toBe(false);
      expect(result.current.formState.episodes[2].isLie).toBe(true);
    });

    it('should calculate episode character count', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm('game-123'));

      act(() => {
        result.current.updateEpisodeText(0, 'テスト');
      });

      expect(result.current.getEpisodeCharCount(0)).toBe(3);
    });

    it('should clear errors when updating episode text', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm('game-123'));

      act(() => {
        result.current.updateEpisodeText(0, 'テスト');
      });

      expect(result.current.errors).toBeUndefined();
    });

    it('should clear errors when updating lie marker', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm('game-123'));

      act(() => {
        result.current.updateEpisodeIsLie(0, true);
      });

      expect(result.current.errors).toBeUndefined();
    });
  });

  describe('Form Reset', () => {
    it('should reset all form fields to initial state', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm('game-123'));

      // Populate form
      act(() => {
        result.current.updateNickname('テスト太郎');
        result.current.updateEpisodeText(0, 'エピソード1');
        result.current.updateEpisodeIsLie(0, true);
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.formState.nickname).toBe('');
      expect(result.current.formState.episodes[0].text).toBe('');
      expect(result.current.formState.episodes[0].isLie).toBe(false);
    });

    it('should clear errors on reset', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm('game-123'));

      act(() => {
        result.current.reset();
      });

      expect(result.current.errors).toBeUndefined();
      expect(result.current.isSuccess).toBe(false);
    });
  });

  describe('Form State Preservation', () => {
    it('should preserve gameId across updates', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm('game-123'));

      act(() => {
        result.current.updateNickname('テスト太郎');
        result.current.updateEpisodeText(0, 'エピソード1');
      });

      expect(result.current.formState.gameId).toBe('game-123');
    });

    it('should maintain exactly 3 episodes', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm('game-123'));

      act(() => {
        result.current.updateEpisodeText(0, 'エピソード1');
        result.current.updateEpisodeText(1, 'エピソード2');
        result.current.updateEpisodeText(2, 'エピソード3');
      });

      expect(result.current.formState.episodes.length).toBe(3);
    });
  });

  describe('Multiple Hook Instances', () => {
    it('should maintain independent state for different game IDs', () => {
      const { result: result1 } = renderHook(() => usePresenterWithEpisodesForm('game-1'));
      const { result: result2 } = renderHook(() => usePresenterWithEpisodesForm('game-2'));

      act(() => {
        result1.current.updateNickname('プレゼンター1');
        result2.current.updateNickname('プレゼンター2');
      });

      expect(result1.current.formState.nickname).toBe('プレゼンター1');
      expect(result2.current.formState.nickname).toBe('プレゼンター2');
      expect(result1.current.formState.gameId).toBe('game-1');
      expect(result2.current.formState.gameId).toBe('game-2');
    });
  });

  describe('Character Count Utilities', () => {
    it('should return 0 for empty nickname', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm('game-123'));

      expect(result.current.getNicknameCharCount()).toBe(0);
    });

    it('should return 0 for empty episode text', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm('game-123'));

      expect(result.current.getEpisodeCharCount(0)).toBe(0);
    });

    it('should update character counts accurately', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm('game-123'));

      act(() => {
        result.current.updateNickname('あ'.repeat(25));
        result.current.updateEpisodeText(0, 'い'.repeat(100));
      });

      expect(result.current.getNicknameCharCount()).toBe(25);
      expect(result.current.getEpisodeCharCount(0)).toBe(100);
    });
  });
});
