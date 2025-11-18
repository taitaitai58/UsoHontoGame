// Unit tests for TopPage component
// Updated for Feature: 005-top-active-games

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TopPage } from '@/components/pages/TopPage';
import type { ActiveGameListItem } from '@/types/game';

// Mock ActiveGamesList component
vi.mock('@/components/domain/game/ActiveGamesList', () => ({
  ActiveGamesList: ({ games }: { games: ActiveGameListItem[] }) => (
    <div data-testid="active-games-list">Game Count: {games.length}</div>
  ),
}));

// Mock EmptyState component
vi.mock('@/components/ui/EmptyState', () => ({
  EmptyState: ({ message, subMessage }: { message: string; subMessage?: string }) => (
    <div data-testid="empty-state">
      <p>{message}</p>
      {subMessage && <p>{subMessage}</p>}
    </div>
  ),
}));

describe('TopPage', () => {
  const mockGames: ActiveGameListItem[] = [
    {
      id: 'a1b2c3d4e5f6',
      title: 'テストゲーム1',
      createdAt: '2025-11-18T10:00:00Z',
      playerCount: 5,
      playerLimit: 10,
      formattedCreatedAt: '10分前',
    },
    {
      id: 'f6e5d4c3b2a1',
      title: 'テストゲーム2',
      createdAt: '2025-11-18T09:30:00Z',
      playerCount: 3,
      playerLimit: 8,
      formattedCreatedAt: '40分前',
    },
  ];

  it('should render without crashing', () => {
    render(<TopPage nickname="田中太郎" games={mockGames} />);
    expect(screen.getByText(/ようこそ/)).toBeInTheDocument();
  });

  it('should display welcome message with nickname', () => {
    render(<TopPage nickname="田中太郎" games={mockGames} />);
    expect(screen.getByText(/ようこそ、田中太郎さん!/)).toBeInTheDocument();
  });

  it('should pass games array to ActiveGamesList component', () => {
    render(<TopPage nickname="山田花子" games={mockGames} />);
    expect(screen.getByTestId('active-games-list')).toBeInTheDocument();
    expect(screen.getByText('Game Count: 2')).toBeInTheDocument();
  });

  it('should display "出題中のゲーム" heading', () => {
    render(<TopPage nickname="田中太郎" games={mockGames} />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('出題中のゲーム');
  });

  it('should apply correct layout classes', () => {
    const { container } = render(<TopPage nickname="田中" games={[]} />);
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass('min-h-screen', 'bg-gray-50', 'p-8');
  });

  it('should contain heading element', () => {
    render(<TopPage nickname="田中太郎" games={mockGames} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('text-3xl', 'font-bold', 'text-gray-900');
  });
});

// Feature: 005-top-active-games
// Tests for active games display with empty state
describe('TopPage - Active Games Display', () => {
  describe('empty state when no active games', () => {
    it('should display empty state component when no active games exist', () => {
      render(<TopPage nickname="田中太郎" games={[]} />);

      // Should show empty state instead of games list
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('現在、出題中のゲームはありません')).toBeInTheDocument();
      expect(screen.getByText('新しいゲームが開始されるまでお待ちください')).toBeInTheDocument();

      // Should NOT show games list when empty
      expect(screen.queryByTestId('active-games-list')).not.toBeInTheDocument();
    });

    it('should display games list when active games exist', () => {
      const games: ActiveGameListItem[] = [
        {
          id: 'game-test-1',
          title: 'アクティブゲーム',
          createdAt: '2025-11-18T10:00:00Z',
          playerCount: 2,
          playerLimit: 5,
          formattedCreatedAt: '5分前',
        },
      ];

      render(<TopPage nickname="田中太郎" games={games} />);

      // Should show games list
      expect(screen.getByTestId('active-games-list')).toBeInTheDocument();
      expect(screen.getByText('Game Count: 1')).toBeInTheDocument();

      // Should NOT show empty state when games exist
      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });
  });
});
