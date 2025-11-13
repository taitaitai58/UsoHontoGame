// App Router Page: TOP/Home
// Feature: 001-session-top-page
// Server Component that handles session management and delegates to TopPage components

import {
	createSessionAction,
	validateSessionAction,
} from "@/app/actions/session";
import {
	TopPage,
	TopPageNicknameSetup,
} from "@/components/pages/TopPage";

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

	// 4. Fetch available games
	const { GetAvailableGames } = await import(
		"@/server/application/use-cases/games/GetAvailableGames"
	);
	const { InMemoryGameRepository } = await import(
		"@/server/infrastructure/repositories/InMemoryGameRepository"
	);

	const gameRepository = InMemoryGameRepository.getInstance();
	const getGamesUseCase = new GetAvailableGames(gameRepository);
	const games = await getGamesUseCase.execute();

	// 5. Render page component with session and games data
	return <TopPage nickname={session.nickname || ""} games={games} />;
}
