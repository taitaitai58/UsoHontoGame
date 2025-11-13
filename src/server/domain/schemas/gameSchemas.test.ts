// Unit Tests for Zod Validation Schemas
// Feature: 002-game-preparation
// Tests include edge cases: 0 chars, 1001 chars, invalid UUIDs, boundary values

import { describe, expect, it } from "vitest";
import {
	AddEpisodeSchema,
	AddPresenterSchema,
	CreateGameSchema,
	DeleteGameSchema,
	GameIdSchema,
	GameStatusSchema,
	RemovePresenterSchema,
	StartAcceptingSchema,
	UpdateEpisodeSchema,
	UpdateGameSchema,
} from "@/server/domain/schemas/gameSchemas";

describe("GameIdSchema", () => {
	it("should accept valid UUID v4", () => {
		const validUuid = "550e8400-e29b-41d4-a716-446655440000";
		expect(GameIdSchema.parse(validUuid)).toBe(validUuid);
	});

	it("should reject invalid UUID format", () => {
		expect(() => GameIdSchema.parse("not-a-uuid")).toThrow(
			"ゲームIDは有効なUUIDでなければなりません",
		);
	});

	it("should reject empty string", () => {
		expect(() => GameIdSchema.parse("")).toThrow();
	});
});

describe("GameStatusSchema", () => {
	it("should accept 準備中", () => {
		expect(GameStatusSchema.parse("準備中")).toBe("準備中");
	});

	it("should accept 出題中", () => {
		expect(GameStatusSchema.parse("出題中")).toBe("出題中");
	});

	it("should accept 締切", () => {
		expect(GameStatusSchema.parse("締切")).toBe("締切");
	});

	it("should reject invalid status", () => {
		expect(() => GameStatusSchema.parse("invalid")).toThrow();
	});
});

describe("CreateGameSchema", () => {
	it("should accept valid player limit (1-100)", () => {
		expect(CreateGameSchema.parse({ playerLimit: 50 })).toEqual({
			playerLimit: 50,
		});
	});

	it("should accept boundary value 1", () => {
		expect(CreateGameSchema.parse({ playerLimit: 1 })).toEqual({
			playerLimit: 1,
		});
	});

	it("should accept boundary value 100", () => {
		expect(CreateGameSchema.parse({ playerLimit: 100 })).toEqual({
			playerLimit: 100,
		});
	});

	it("should reject player limit 0", () => {
		expect(() => CreateGameSchema.parse({ playerLimit: 0 })).toThrow(
			"プレイヤー数は1以上でなければなりません",
		);
	});

	it("should reject player limit 101", () => {
		expect(() => CreateGameSchema.parse({ playerLimit: 101 })).toThrow(
			"プレイヤー数は100以下でなければなりません",
		);
	});

	it("should reject negative player limit", () => {
		expect(() => CreateGameSchema.parse({ playerLimit: -1 })).toThrow(
			"プレイヤー数は1以上でなければなりません",
		);
	});

	it("should reject non-integer player limit", () => {
		expect(() => CreateGameSchema.parse({ playerLimit: 10.5 })).toThrow(
			"プレイヤー数は整数でなければなりません",
		);
	});

	it("should reject missing player limit", () => {
		expect(() => CreateGameSchema.parse({})).toThrow();
	});
});

describe("AddPresenterSchema", () => {
	const validGameId = "550e8400-e29b-41d4-a716-446655440000";

	it("should accept valid presenter data", () => {
		const data = { gameId: validGameId, nickname: "TestUser" };
		expect(AddPresenterSchema.parse(data)).toEqual(data);
	});

	it("should reject empty nickname", () => {
		expect(() =>
			AddPresenterSchema.parse({ gameId: validGameId, nickname: "" }),
		).toThrow("ニックネームを入力してください");
	});

	it("should reject nickname longer than 50 chars", () => {
		const longNickname = "a".repeat(51);
		expect(() =>
			AddPresenterSchema.parse({
				gameId: validGameId,
				nickname: longNickname,
			}),
		).toThrow("ニックネームは50文字以下でなければなりません");
	});

	it("should accept nickname exactly 50 chars", () => {
		const nickname = "a".repeat(50);
		const data = { gameId: validGameId, nickname };
		expect(AddPresenterSchema.parse(data)).toEqual(data);
	});
});

describe("AddEpisodeSchema - CRITICAL text validation (1-1000 chars)", () => {
	const validPresenterId = "550e8400-e29b-41d4-a716-446655440000";

	it("should accept valid episode data", () => {
		const data = {
			presenterId: validPresenterId,
			text: "Valid episode text",
			isLie: false,
		};
		expect(AddEpisodeSchema.parse(data)).toEqual(data);
	});

	it("should accept text with exactly 1 character", () => {
		const data = {
			presenterId: validPresenterId,
			text: "a",
			isLie: true,
		};
		expect(AddEpisodeSchema.parse(data)).toEqual(data);
	});

	it("should accept text with exactly 1000 characters", () => {
		const text = "a".repeat(1000);
		const data = {
			presenterId: validPresenterId,
			text,
			isLie: false,
		};
		expect(AddEpisodeSchema.parse(data)).toEqual(data);
	});

	it("should reject empty text (0 chars) - CRITICAL edge case", () => {
		expect(() =>
			AddEpisodeSchema.parse({
				presenterId: validPresenterId,
				text: "",
				isLie: false,
			}),
		).toThrow("エピソードは1文字以上でなければなりません");
	});

	it("should reject text with 1001 characters - CRITICAL edge case", () => {
		const text = "a".repeat(1001);
		expect(() =>
			AddEpisodeSchema.parse({
				presenterId: validPresenterId,
				text,
				isLie: false,
			}),
		).toThrow("エピソードは1000文字以下でなければなりません");
	});

	it("should reject missing text field", () => {
		expect(() =>
			AddEpisodeSchema.parse({
				presenterId: validPresenterId,
				isLie: false,
			}),
		).toThrow();
	});

	it("should reject missing isLie field", () => {
		expect(() =>
			AddEpisodeSchema.parse({
				presenterId: validPresenterId,
				text: "Valid text",
			}),
		).toThrow();
	});
});

describe("UpdateEpisodeSchema", () => {
	const validEpisodeId = "550e8400-e29b-41d4-a716-446655440000";

	it("should accept text update only", () => {
		const data = { episodeId: validEpisodeId, text: "Updated text" };
		expect(UpdateEpisodeSchema.parse(data)).toEqual(data);
	});

	it("should accept isLie update only", () => {
		const data = { episodeId: validEpisodeId, isLie: true };
		expect(UpdateEpisodeSchema.parse(data)).toEqual(data);
	});

	it("should accept both text and isLie update", () => {
		const data = {
			episodeId: validEpisodeId,
			text: "Updated text",
			isLie: true,
		};
		expect(UpdateEpisodeSchema.parse(data)).toEqual(data);
	});

	it("should reject when neither text nor isLie is provided", () => {
		expect(() =>
			UpdateEpisodeSchema.parse({ episodeId: validEpisodeId }),
		).toThrow(
			"テキストまたはウソマーカーのいずれかを更新する必要があります",
		);
	});

	it("should reject text longer than 1000 chars", () => {
		const text = "a".repeat(1001);
		expect(() =>
			UpdateEpisodeSchema.parse({ episodeId: validEpisodeId, text }),
		).toThrow();
	});
});

describe("UpdateGameSchema", () => {
	const validGameId = "550e8400-e29b-41d4-a716-446655440000";

	it("should accept game ID only (no updates)", () => {
		const data = { gameId: validGameId };
		expect(UpdateGameSchema.parse(data)).toEqual(data);
	});

	it("should accept game ID with player limit update", () => {
		const data = { gameId: validGameId, playerLimit: 50 };
		expect(UpdateGameSchema.parse(data)).toEqual(data);
	});

	it("should reject invalid player limit", () => {
		expect(() =>
			UpdateGameSchema.parse({ gameId: validGameId, playerLimit: 0 }),
		).toThrow();
	});
});

describe("StartAcceptingSchema", () => {
	it("should accept valid game ID", () => {
		const validGameId = "550e8400-e29b-41d4-a716-446655440000";
		expect(StartAcceptingSchema.parse({ gameId: validGameId })).toEqual({
			gameId: validGameId,
		});
	});

	it("should reject invalid game ID", () => {
		expect(() =>
			StartAcceptingSchema.parse({ gameId: "invalid" }),
		).toThrow();
	});
});

describe("DeleteGameSchema", () => {
	const validGameId = "550e8400-e29b-41d4-a716-446655440000";

	it("should accept game ID without confirmation", () => {
		const data = { gameId: validGameId };
		expect(DeleteGameSchema.parse(data)).toEqual(data);
	});

	it("should accept game ID with confirmation", () => {
		const data = { gameId: validGameId, confirmed: true };
		expect(DeleteGameSchema.parse(data)).toEqual(data);
	});

	it("should accept game ID with confirmed=false", () => {
		const data = { gameId: validGameId, confirmed: false };
		expect(DeleteGameSchema.parse(data)).toEqual(data);
	});
});

describe("RemovePresenterSchema", () => {
	const validGameId = "550e8400-e29b-41d4-a716-446655440000";
	const validPresenterId = "660e8400-e29b-41d4-a716-446655440001";

	it("should accept valid game and presenter IDs", () => {
		const data = { gameId: validGameId, presenterId: validPresenterId };
		expect(RemovePresenterSchema.parse(data)).toEqual(data);
	});

	it("should reject invalid presenter ID", () => {
		expect(() =>
			RemovePresenterSchema.parse({
				gameId: validGameId,
				presenterId: "invalid",
			}),
		).toThrow();
	});
});
