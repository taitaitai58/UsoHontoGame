// Response Status Dashboard Page (Server Component)
// Feature: 006-results-dashboard, User Story 1
// Feature: 007-game-closure, User Story 3 (added closed game support)
// Displays real-time response submission status for active/closed games

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
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

  // Get cookies for SSR fetch
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  // Fetch initial data via API endpoint
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/games/${gameId}/dashboard`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
    },
    credentials: 'include',
    cache: 'no-store', // Ensure fresh data for SSR
  });

  // Handle non-OK responses
  if (!response.ok) {
    const error = await response.json();
    const errorMessage = error.details || error.error || 'Failed to load dashboard data';
    return <ResponseStatusPageError errorMessage={errorMessage} />;
  }

  // Parse successful response
  const data = await response.json();

  // Delegate to page component with initial data
  return <ResponseStatusPage gameId={gameId} initialData={data} />;
}
