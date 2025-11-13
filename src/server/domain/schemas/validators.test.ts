// Unit Tests for Complex Validation Rules
// Feature: 002-game-preparation
// Tests "complete presenter" definition and readiness to accept responses

import { describe, expect, it } from "vitest";
import {
	CompletePresenterSchema,
	ReadyToAcceptSchema,
} from "@/server/domain/schemas/validators";

describe("CompletePresenterSchema - exactly 3 episodes AND exactly 1 lie", () => {
	it("should accept complete presenter (3 episodes, 1 lie)", () => {
		const data = {
			episodes: [{ isLie: false }, { isLie: true }, { isLie: false }],
		};
		expect(CompletePresenterSchema.parse(data)).toEqual(data);
	});

	it("should reject presenter with 0 episodes", () => {
		expect(() =>
			CompletePresenterSchema.parse({ episodes: [] }),
		).toThrow("エピソードは3つ登録する必要があります");
	});

	it("should reject presenter with 1 episode", () => {
		expect(() =>
			CompletePresenterSchema.parse({ episodes: [{ isLie: true }] }),
		).toThrow("エピソードは3つ登録する必要があります");
	});

	it("should reject presenter with 2 episodes", () => {
		expect(() =>
			CompletePresenterSchema.parse({
				episodes: [{ isLie: false }, { isLie: true }],
			}),
		).toThrow("エピソードは3つ登録する必要があります");
	});

	it("should reject presenter with 4 episodes", () => {
		expect(() =>
			CompletePresenterSchema.parse({
				episodes: [
					{ isLie: false },
					{ isLie: true },
					{ isLie: false },
					{ isLie: false },
				],
			}),
		).toThrow("エピソードは3つ登録する必要があります");
	});

	it("should reject 3 episodes with 0 lies (all false)", () => {
		expect(() =>
			CompletePresenterSchema.parse({
				episodes: [
					{ isLie: false },
					{ isLie: false },
					{ isLie: false },
				],
			}),
		).toThrow("ウソのエピソードを1つ選択してください");
	});

	it("should reject 3 episodes with 2 lies - CRITICAL edge case", () => {
		expect(() =>
			CompletePresenterSchema.parse({
				episodes: [{ isLie: true }, { isLie: true }, { isLie: false }],
			}),
		).toThrow("ウソのエピソードを1つ選択してください");
	});

	it("should reject 3 episodes with 3 lies (all true)", () => {
		expect(() =>
			CompletePresenterSchema.parse({
				episodes: [{ isLie: true }, { isLie: true }, { isLie: true }],
			}),
		).toThrow("ウソのエピソードを1つ選択してください");
	});

	it("should accept lie as first episode", () => {
		const data = {
			episodes: [{ isLie: true }, { isLie: false }, { isLie: false }],
		};
		expect(CompletePresenterSchema.parse(data)).toEqual(data);
	});

	it("should accept lie as middle episode", () => {
		const data = {
			episodes: [{ isLie: false }, { isLie: true }, { isLie: false }],
		};
		expect(CompletePresenterSchema.parse(data)).toEqual(data);
	});

	it("should accept lie as last episode", () => {
		const data = {
			episodes: [{ isLie: false }, { isLie: false }, { isLie: true }],
		};
		expect(CompletePresenterSchema.parse(data)).toEqual(data);
	});
});

describe("ReadyToAcceptSchema - at least 1 complete presenter", () => {
	const completePresenter = {
		episodes: [{ isLie: false }, { isLie: true }, { isLie: false }],
	};

	it("should accept game with 1 complete presenter", () => {
		const data = { presenters: [completePresenter] };
		expect(ReadyToAcceptSchema.parse(data)).toEqual(data);
	});

	it("should accept game with multiple complete presenters", () => {
		const data = {
			presenters: [completePresenter, completePresenter, completePresenter],
		};
		expect(ReadyToAcceptSchema.parse(data)).toEqual(data);
	});

	it("should reject game with 0 presenters", () => {
		expect(() => ReadyToAcceptSchema.parse({ presenters: [] })).toThrow(
			"出題者が1人以上必要です",
		);
	});

	it("should reject game with incomplete presenter (2 episodes)", () => {
		const incompletePresenter = {
			episodes: [{ isLie: false }, { isLie: true }],
		};
		expect(() =>
			ReadyToAcceptSchema.parse({ presenters: [incompletePresenter] }),
		).toThrow("エピソードは3つ登録する必要があります");
	});

	it("should reject game with incomplete presenter (0 lies)", () => {
		const presenterWithoutLie = {
			episodes: [
				{ isLie: false },
				{ isLie: false },
				{ isLie: false },
			],
		};
		expect(() =>
			ReadyToAcceptSchema.parse({ presenters: [presenterWithoutLie] }),
		).toThrow("ウソのエピソードを1つ選択してください");
	});

	it("should reject game with incomplete presenter (multiple lies)", () => {
		const presenterWithMultipleLies = {
			episodes: [{ isLie: true }, { isLie: true }, { isLie: false }],
		};
		expect(() =>
			ReadyToAcceptSchema.parse({
				presenters: [presenterWithMultipleLies],
			}),
		).toThrow("ウソのエピソードを1つ選択してください");
	});

	it("should reject game with mix of complete and incomplete presenters", () => {
		const incompletePresenter = {
			episodes: [{ isLie: false }, { isLie: true }],
		};
		expect(() =>
			ReadyToAcceptSchema.parse({
				presenters: [completePresenter, incompletePresenter],
			}),
		).toThrow("エピソードは3つ登録する必要があります");
	});
});
