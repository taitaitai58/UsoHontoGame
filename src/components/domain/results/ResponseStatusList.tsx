// Domain Component: ResponseStatusList
// Feature: 006-results-dashboard, User Story 1
// Displays list of participants and their response submission status

'use client';

import { useLanguage } from '@/hooks/useLanguage';
import type { ResponseStatusListProps } from '@/components/pages/ResponseStatusPage/ResponseStatusPage.types';

export default function ResponseStatusList({
  participants,
  totalParticipants,
  submittedCount,
  allSubmitted,
}: ResponseStatusListProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      {/* Summary Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{t('results.responseStatus')}</h2>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              {submittedCount} / {totalParticipants}
            </p>
            <p className="text-sm text-gray-600">{t('results.submitted')}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${totalParticipants > 0 ? (submittedCount / totalParticipants) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* All Submitted Message */}
        {allSubmitted && (
          <div className="mt-4 rounded-md bg-green-50 p-3 text-center">
            <p className="font-semibold text-green-800">✓ {t('results.allSubmitted')}</p>
          </div>
        )}
      </div>

      {/* Participant List */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3">
          <h3 className="font-semibold text-gray-900">{t('game.participantList')}</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {participants.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500">{t('results.noAnswers')}</li>
          ) : (
            participants.map((participant) => (
              <li
                key={participant.nickname}
                className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {/* Status Icon */}
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      participant.hasSubmitted
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {participant.hasSubmitted ? '✓' : '○'}
                  </div>

                  {/* Nickname */}
                  <span className="font-medium text-gray-900">{participant.nickname}</span>
                </div>

                {/* Submission Time */}
                {participant.hasSubmitted && participant.submittedAt && (
                  <time className="text-sm text-gray-500">
                    {new Date(participant.submittedAt).toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                )}

                {/* Pending Status */}
                {!participant.hasSubmitted && <span className="text-sm text-gray-500">{t('results.pending')}</span>}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
