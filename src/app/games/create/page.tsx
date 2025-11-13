// App Router Page: Game Creation
// Feature: 002-game-preparation
// Server Component that delegates to GameCreatePage component

import { GameCreatePage } from "@/components/pages/GameCreatePage";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "新しいゲームを作成 | ウソ？ホント？ゲーム",
	description: "プレイヤー数上限を設定して新しいゲームを作成します",
};

/**
 * Next.js App Router page for /games/create
 * Thin wrapper that delegates to GameCreatePage component
 */
export default function Page() {
	return <GameCreatePage />;
}
