/**
 * EpisodeSelector Component
 * Feature: 001-lie-detection-answers
 * Renders episodes as selectable buttons with visual selection feedback
 */

'use client';

import type { FC } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

export interface Episode {
  id: string;
  text: string;
}

export interface EpisodeSelectorProps {
  episodes: Episode[];
  selectedEpisodeId: string | null;
  onSelect: (episodeId: string) => void;
  disabled?: boolean;
}

export const EpisodeSelector: FC<EpisodeSelectorProps> = ({
  episodes,
  selectedEpisodeId,
  onSelect,
  disabled = false,
}) => {
  const { t } = useLanguage();

  if (episodes.length === 0) {
    return <div className="text-center py-4 text-gray-500">{t('episode.noEpisodes')}</div>;
  }

  return (
    <div className="space-y-2">
      {episodes.map((episode) => {
        const isSelected = episode.id === selectedEpisodeId;

        return (
          <button
            key={episode.id}
            type="button"
            onClick={() => !disabled && onSelect(episode.id)}
            disabled={disabled}
            data-selected={isSelected}
            aria-pressed={isSelected}
            className={`
							w-full text-left px-4 py-3 rounded-lg border-2 transition-all
							focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
							disabled:opacity-50 disabled:cursor-not-allowed
							${
                isSelected
                  ? 'bg-blue-100 border-blue-500 text-blue-900 font-medium'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
              }
						`}
          >
            {episode.text}
          </button>
        );
      })}
    </div>
  );
};
