// Response Status Dashboard Page (Server Component)
// Feature: 006-results-dashboard, User Story 1
// Feature: 007-game-closure, User Story 3 (added closed game support)
// Displays real-time response submission status for active/closed games

import { redirect } from 'next/navigation';
import { getResponseStatusAction } from '@/app/actions/game';
import { ResponseStatusPage, ResponseStatusPageError } from '@/components/pages/ResponseStatusPage';
import { SessionServiceContainer } from '@/server/infrastructure/di/SessionServiceContainer';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  // Session verification
  const sessionService = SessionServiceContainer.getSessionService();
  const sessionId = await sessionService.getCurrentSessionId();

  if (!sessionId) {
    redirect('/');
  }

  // Extract gameId from params
  const { id: gameId } = await params;

  // Fetch initial data via server action
  const result = await getResponseStatusAction(gameId);

  // Handle errors with dedicated error component
  if (!result.success) {
    const errorMessage = result.errors._form?.[0] || 'Failed to load dashboard data';
    return <ResponseStatusPageError errorMessage={errorMessage} />;
  }

  // Delegate to page component with initial data
  return <ResponseStatusPage gameId={gameId} initialData={result.data} />;
}
