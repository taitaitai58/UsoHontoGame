// Domain Component: Winner Celebration
// Feature: 006-results-dashboard, User Story 3
// Displays congratulations message and celebration animation for winners

'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { Confetti } from '@/components/ui/Confetti';

export interface WinnerCelebrationProps {
  winners: { nickname: string; score: number }[];
  isActive: boolean;
}

export default function WinnerCelebration({ winners, isActive }: WinnerCelebrationProps) {
  const { t } = useLanguage();

  if (!isActive || winners.length === 0) return null;

  const isTie = winners.length > 1;

  return (
    <div className="relative">
      {/* Confetti Animation */}
      <Confetti active={isActive} duration={3000} particleCount={100} />

      {/* Celebration Message */}
      <div className="rounded-lg border-4 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 p-8 shadow-xl">
        <div className="text-center">
          {/* Trophy Icon */}
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400 shadow-lg">
              <span className="text-5xl">🏆</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="mb-4 text-4xl font-bold text-yellow-900">
            {isTie ? t('results.tieWinner') : t('results.congratulations')}
          </h2>

          {/* Winner Names */}
          <div className="mb-4 space-y-2">
            {winners.map((winner, _index) => (
              <div key={winner.nickname} className="rounded-lg bg-white/80 px-6 py-3 shadow-md">
                <p className="text-2xl font-bold text-gray-900">{winner.nickname}</p>
                <p className="text-lg text-yellow-700">{winner.score} {t('results.points')}</p>
              </div>
            ))}
          </div>

          {/* Celebration Text */}
          <p className="text-lg text-gray-700">
            {isTie ? t('results.tieMessage').replace('{count}', String(winners.length)) : t('results.detectSuccess')}
          </p>
        </div>
      </div>
    </div>
  );
}
