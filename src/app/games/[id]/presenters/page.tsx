// App Router Page: Presenter Management
// Feature: 002-game-preparation
// Thin wrapper that delegates to PresenterManagementPage component

import { PresenterManagementPage } from '@/components/pages/PresenterManagementPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Next.js App Router page for /games/[id]/presenters
 * This is a thin wrapper that extracts params and passes them to the page component
 */
export default async function Page({ params }: PageProps) {
  const { id: gameId } = await params;

  return <PresenterManagementPage gameId={gameId} />;
}
