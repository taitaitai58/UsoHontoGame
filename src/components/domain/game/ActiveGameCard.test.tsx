/**
 * ActiveGameCard Component Tests
 * Feature: 005-top-active-games (User Story 2)
 * Tests for displaying game information (title, player count, time)
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ActiveGameCard } from './ActiveGameCard';
import type { ActiveGameListItem } from '@/types/game';

describe('ActiveGameCard', () => {
  // T018: Test for displaying title
  describe('title display', () => {
    it('should display game title', () => {
      const game: ActiveGameListItem = {
        id: 'game-001',
        title: 'テストゲーム',
        createdAt: '2025-11-18T10:00:00Z',
        playerCount: 5,
        playerLimit: 10,
        formattedCreatedAt: '10分前',
      };

      render(<ActiveGameCard game={game} />);

      expect(screen.getByText('テストゲーム')).toBeInTheDocument();
    });

    it('should display long titles correctly', () => {
      const game: ActiveGameListItem = {
        id: 'game-002',
        title: 'とても長いタイトルのゲームでテキストの折り返しを確認する',
        createdAt: '2025-11-18T10:00:00Z',
        playerCount: 3,
        playerLimit: 8,
        formattedCreatedAt: '5分前',
      };

      render(<ActiveGameCard game={game} />);

      expect(
        screen.getByText('とても長いタイトルのゲームでテキストの折り返しを確認する')
      ).toBeInTheDocument();
    });
  });

  // T019: Test for displaying player count
  describe('player count display', () => {
    it('should display player count when playerLimit exists', () => {
      const game: ActiveGameListItem = {
        id: 'game-003',
        title: 'プレイヤー制限ありゲーム',
        createdAt: '2025-11-18T10:00:00Z',
        playerCount: 5,
        playerLimit: 10,
        formattedCreatedAt: '15分前',
      };

      render(<ActiveGameCard game={game} />);

      expect(screen.getByText('5 / 10人')).toBeInTheDocument();
    });

    it('should display player count when playerLimit is null', () => {
      const game: ActiveGameListItem = {
        id: 'game-004',
        title: '無制限ゲーム',
        createdAt: '2025-11-18T10:00:00Z',
        playerCount: 7,
        playerLimit: null,
        formattedCreatedAt: '20分前',
      };

      render(<ActiveGameCard game={game} />);

      expect(screen.getByText('7人')).toBeInTheDocument();
    });

    it('should display zero players correctly', () => {
      const game: ActiveGameListItem = {
        id: 'game-005',
        title: 'プレイヤーなしゲーム',
        createdAt: '2025-11-18T10:00:00Z',
        playerCount: 0,
        playerLimit: 5,
        formattedCreatedAt: 'たった今',
      };

      render(<ActiveGameCard game={game} />);

      expect(screen.getByText('0 / 5人')).toBeInTheDocument();
    });
  });

  // T020: Test for displaying formatted time
  describe('formatted time display', () => {
    it('should display formatted relative time', () => {
      const game: ActiveGameListItem = {
        id: 'game-006',
        title: '時間表示テスト',
        createdAt: '2025-11-18T10:00:00Z',
        playerCount: 3,
        playerLimit: 10,
        formattedCreatedAt: '30分前',
      };

      render(<ActiveGameCard game={game} />);

      expect(screen.getByText('30分前')).toBeInTheDocument();
    });

    it('should display various time formats correctly', () => {
      const timeFormats = [
        { formatted: 'たった今', testId: 'game-007' },
        { formatted: '1分前', testId: 'game-008' },
        { formatted: '2時間前', testId: 'game-009' },
        { formatted: '3日前', testId: 'game-010' },
      ];

      timeFormats.forEach(({ formatted, testId }) => {
        const game: ActiveGameListItem = {
          id: testId,
          title: `${formatted}のゲーム`,
          createdAt: '2025-11-18T10:00:00Z',
          playerCount: 1,
          playerLimit: 5,
          formattedCreatedAt: formatted,
        };

        const { unmount } = render(<ActiveGameCard game={game} />);
        expect(screen.getByText(formatted)).toBeInTheDocument();
        unmount();
      });
    });
  });

  // Additional test: Complete component rendering
  describe('complete component', () => {
    it('should render all information together', () => {
      const game: ActiveGameListItem = {
        id: 'game-011',
        title: '完全なゲーム情報',
        createdAt: '2025-11-18T09:30:00Z',
        playerCount: 8,
        playerLimit: 12,
        formattedCreatedAt: '30分前',
      };

      render(<ActiveGameCard game={game} />);

      expect(screen.getByText('完全なゲーム情報')).toBeInTheDocument();
      expect(screen.getByText('8 / 12人')).toBeInTheDocument();
      expect(screen.getByText('30分前')).toBeInTheDocument();
    });

    it('should have proper semantic structure', () => {
      const game: ActiveGameListItem = {
        id: 'game-012',
        title: 'セマンティックテスト',
        createdAt: '2025-11-18T10:00:00Z',
        playerCount: 4,
        playerLimit: 6,
        formattedCreatedAt: '10分前',
      };

      const { container } = render(<ActiveGameCard game={game} />);

      // Should render as an article or section
      const article = container.querySelector('article') || container.querySelector('div');
      expect(article).toBeInTheDocument();
    });
  });

  // Phase 5: User Story 3 - Navigation Tests
  // T028: Test for navigation on click
  describe('navigation functionality', () => {
    it('should render as a clickable link to game detail page', () => {
      const game: ActiveGameListItem = {
        id: 'game-nav-001',
        title: 'ナビゲーションテスト',
        createdAt: '2025-11-18T10:00:00Z',
        playerCount: 5,
        playerLimit: 10,
        formattedCreatedAt: '10分前',
      };

      render(<ActiveGameCard game={game} />);

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/games/game-nav-001');
    });

    it('should navigate to correct game detail page for different IDs', () => {
      const testCases = [
        { id: 'abc123def456', expectedHref: '/games/abc123def456' },
        { id: 'xyz789ghi012', expectedHref: '/games/xyz789ghi012' },
      ];

      testCases.forEach(({ id, expectedHref }) => {
        const game: ActiveGameListItem = {
          id,
          title: 'テストゲーム',
          createdAt: '2025-11-18T10:00:00Z',
          playerCount: 3,
          playerLimit: 8,
          formattedCreatedAt: '5分前',
        };

        const { unmount } = render(<ActiveGameCard game={game} />);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', expectedHref);
        unmount();
      });
    });
  });

  // T029: Test for hover state visual feedback
  describe('hover and focus states', () => {
    it('should have hover state classes', () => {
      const game: ActiveGameListItem = {
        id: 'game-hover-001',
        title: 'ホバーテスト',
        createdAt: '2025-11-18T10:00:00Z',
        playerCount: 2,
        playerLimit: 5,
        formattedCreatedAt: '15分前',
      };

      render(<ActiveGameCard game={game} />);

      const link = screen.getByRole('link');
      // Should have transition and hover classes
      expect(link.className).toMatch(/transition/);
    });

    it('should have proper accessibility attributes', () => {
      const game: ActiveGameListItem = {
        id: 'game-a11y-001',
        title: 'アクセシビリティテスト',
        createdAt: '2025-11-18T10:00:00Z',
        playerCount: 7,
        playerLimit: 10,
        formattedCreatedAt: '20分前',
      };

      render(<ActiveGameCard game={game} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAccessibleName('アクセシビリティテスト のゲーム詳細を見る');
    });

    it('should have focus-visible styling for keyboard navigation', () => {
      const game: ActiveGameListItem = {
        id: 'game-focus-001',
        title: 'フォーカステスト',
        createdAt: '2025-11-18T10:00:00Z',
        playerCount: 4,
        playerLimit: 8,
        formattedCreatedAt: '10分前',
      };

      render(<ActiveGameCard game={game} />);

      const link = screen.getByRole('link');
      // Should have focus-visible classes for keyboard navigation
      expect(link.className).toMatch(/focus/);
    });
  });
});
