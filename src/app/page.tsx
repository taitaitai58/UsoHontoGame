// App Router Page: TOP/Home
// Feature: 001-session-top-page
// Server Component that handles session management and delegates to TopPage components

import { createSessionAction, validateSessionAction } from '@/app/actions/session';
import { TopPage, TopPageNicknameSetup } from '@/components/pages/TopPage';

/**
 * Next.js App Router page for /
 * Handles session validation, session creation, and state routing
 */
export default async function Page() {
  // 1. Validate existing session
  let session = await validateSessionAction();

  // 2. Create new session if none exists
  if (!session.valid) {
    const createResult = await createSessionAction();
    if (createResult.success) {
      session = await validateSessionAction();
    }
  }

  // 3. Show nickname setup if user doesn't have nickname
  if (!session.hasNickname) {
    return <TopPageNicknameSetup />;
  }

  // 4. Fetch active games (出題中 status only)
  // Feature: 005-top-active-games
  const { getActiveGamesAction } = await import('@/app/actions/game');
  const activeGamesResult = await getActiveGamesAction({ limit: 20 });

  // 5. Render page component with session and active games data
  const games = activeGamesResult.success ? activeGamesResult.games : [];

  return <TopPage nickname={session.nickname || ''} games={games} />;
}
