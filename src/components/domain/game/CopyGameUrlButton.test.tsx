/**
 * CopyGameUrlButton Component Tests
 * Tests clipboard copy and visual feedback (button text, optional toast callback)
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import { LanguageProvider } from '@/providers/LanguageProvider';
import { CopyGameUrlButton } from './CopyGameUrlButton';

function renderWithLanguageProvider(ui: ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

const mockLocation = { origin: 'https://example.com', pathname: '/', href: 'https://example.com/' };

describe('CopyGameUrlButton', () => {
  const writeText = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText },
    });
    vi.stubGlobal('location', mockLocation as Location);
  });

  it('should render "URLをコピー" button by default', () => {
    renderWithLanguageProvider(<CopyGameUrlButton gameId="game-1" />);

    expect(screen.getByRole('button', { name: /URLをコピー/i })).toBeInTheDocument();
  });

  it('should copy game detail URL and call onCopySuccess when copy succeeds', async () => {
    writeText.mockResolvedValue(undefined);
    const onCopySuccess = vi.fn();

    renderWithLanguageProvider(
      <CopyGameUrlButton gameId="game-abc" onCopySuccess={onCopySuccess} />
    );

    fireEvent.click(screen.getByRole('button', { name: /URLをコピー/i }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(`${mockLocation.origin}/games/game-abc`);
      expect(onCopySuccess).toHaveBeenCalledWith('URLをコピーしました');
    });
  });

  it('should show success state (check icon and text) after copy', async () => {
    const user = userEvent.setup();
    writeText.mockResolvedValue(undefined);

    renderWithLanguageProvider(<CopyGameUrlButton gameId="game-1" />);

    await user.click(screen.getByRole('button', { name: /URLをコピー/i }));

    expect(screen.getByRole('button', { name: /URLをコピーしました/i })).toBeInTheDocument();
  });

  it('should accept custom className', () => {
    renderWithLanguageProvider(
      <CopyGameUrlButton gameId="game-1" className="custom-class" />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should render icon variant with aria-label', () => {
    renderWithLanguageProvider(
      <CopyGameUrlButton gameId="game-1" variant="icon" />
    );

    const button = screen.getByRole('button', { name: /URLをコピー/i });
    expect(button).toHaveAttribute('aria-label');
  });
});
