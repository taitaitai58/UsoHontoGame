/**
 * GameCard Component Tests
 * Tests for the game card display component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/providers/LanguageProvider';
import type { GameDto, GameManagementDto } from '@/server/application/dto/GameDto';
import { GameCard } from './GameCard';

function renderWithLanguageProvider(ui: ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

// Mock Card and Badge components
vi.mock('@/components/ui/Card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/Badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

describe('GameCard', () => {
  const mockGameDto: GameDto = {
    id: 'game-1',
    name: 'Test Game',
    availableSlots: 5,
  };

  const mockManagementDto: GameManagementDto = {
    id: 'game-2',
    name: 'Management Game',
    availableSlots: 3,
    status: '出題中',
    currentPlayers: 7,
    maxPlayers: 10,
  };

  describe('Player View', () => {
    it('should render game name', () => {
      renderWithLanguageProvider(<GameCard game={mockGameDto} />);

      expect(screen.getByText('Test Game')).toBeInTheDocument();
    });

    it('should render available slots', () => {
      renderWithLanguageProvider(<GameCard game={mockGameDto} />);

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('空き枠:')).toBeInTheDocument();
    });

    it('should render join button', () => {
      renderWithLanguageProvider(<GameCard game={mockGameDto} />);

      expect(screen.getByRole('button', { name: '参加する' })).toBeInTheDocument();
    });

    it('should not show status badge in player view', () => {
      renderWithLanguageProvider(<GameCard game={mockGameDto} />);

      expect(screen.queryByTestId('badge')).not.toBeInTheDocument();
    });
  });

  describe('Management View', () => {
    it('should render game name and status badge', () => {
      renderWithLanguageProvider(<GameCard game={mockManagementDto} managementView />);

      expect(screen.getByText('Management Game')).toBeInTheDocument();
      expect(screen.getByTestId('badge')).toBeInTheDocument();
      expect(screen.getByText('出題中')).toBeInTheDocument();
    });

    it('should render current and max players', () => {
      renderWithLanguageProvider(<GameCard game={mockManagementDto} managementView />);

      expect(screen.getByText('参加者:')).toBeInTheDocument();
      expect(screen.getByText('7/10')).toBeInTheDocument();
    });

    it('should render remaining slots', () => {
      renderWithLanguageProvider(<GameCard game={mockManagementDto} managementView />);

      expect(screen.getByText('空き枠:')).toBeInTheDocument();
      expect(screen.getByText('3人')).toBeInTheDocument();
    });

    it('should not render join button in management view', () => {
      renderWithLanguageProvider(<GameCard game={mockManagementDto} managementView />);

      expect(screen.queryByRole('button', { name: '参加する' })).not.toBeInTheDocument();
    });

    it('should apply success variant for 出題中 status', () => {
      renderWithLanguageProvider(<GameCard game={mockManagementDto} managementView />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('data-variant', 'success');
    });

    it('should apply warning variant for 準備中 status', () => {
      const preparingGame: GameManagementDto = {
        ...mockManagementDto,
        status: '準備中',
      };
      renderWithLanguageProvider(<GameCard game={preparingGame} managementView />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('data-variant', 'warning');
    });

    it('should apply default variant for 締切 status', () => {
      const closedGame: GameManagementDto = {
        ...mockManagementDto,
        status: '締切',
      };
      renderWithLanguageProvider(<GameCard game={closedGame} managementView />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('data-variant', 'default');
    });
  });

  describe('Click Handler', () => {
    it('should call onClick when card is clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      renderWithLanguageProvider(<GameCard game={mockGameDto} onClick={onClick} />);

      const card = screen.getByRole('button', { name: /View details for Test Game/i });
      await user.click(card);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when Enter key is pressed', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      renderWithLanguageProvider(<GameCard game={mockGameDto} onClick={onClick} />);

      const card = screen.getByRole('button', { name: /View details for Test Game/i });
      card.focus();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick for other keys', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      renderWithLanguageProvider(<GameCard game={mockGameDto} onClick={onClick} />);

      const card = screen.getByRole('button', { name: /View details for Test Game/i });
      card.focus();
      await user.keyboard('{Space}');

      expect(onClick).not.toHaveBeenCalled();
    });

    it('should apply hover styles when onClick is provided', () => {
      const onClick = vi.fn();
      renderWithLanguageProvider(<GameCard game={mockGameDto} onClick={onClick} />);

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('cursor-pointer', 'hover:shadow-md', 'transition-shadow');
    });

    it('should not apply hover styles when onClick is not provided', () => {
      renderWithLanguageProvider(<GameCard game={mockGameDto} />);

      const card = screen.getByTestId('card');
      expect(card).not.toHaveClass('cursor-pointer');
    });

    it('should have role="button" when onClick is provided', () => {
      const onClick = vi.fn();
      renderWithLanguageProvider(<GameCard game={mockGameDto} onClick={onClick} />);

      expect(screen.getByRole('button', { name: /View details/i })).toBeInTheDocument();
    });

    it('should not have role="button" when onClick is not provided', () => {
      renderWithLanguageProvider(<GameCard game={mockGameDto} />);

      expect(screen.queryByRole('button', { name: /View details/i })).not.toBeInTheDocument();
    });
  });
});
