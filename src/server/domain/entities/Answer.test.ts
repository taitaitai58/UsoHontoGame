// Domain Entity Tests: Answer
// Test-Driven Development: Write FAILING tests first

import { describe, expect, it } from 'vitest';
import { AnswerEntity } from './Answer';

describe('Answer Entity', () => {
	describe('create', () => {
		it('should create valid answer entity', () => {
			const answer = AnswerEntity.create({
				sessionId: 'session-123',
				gameId: 'game-456',
				nickname: 'TestUser',
				selections: { 'presenter-1': 'episode-1' },
			});

			expect(answer.id).toBeTruthy();
			expect(answer.id).toMatch(/^[a-zA-Z0-9_-]+$/); // nanoid format
			expect(answer.sessionId).toBe('session-123');
			expect(answer.gameId).toBe('game-456');
			expect(answer.nickname).toBe('TestUser');
			expect(answer.selections.size).toBe(1);
			expect(answer.selections.get('presenter-1')).toBe('episode-1');
			expect(answer.createdAt).toBeInstanceOf(Date);
			expect(answer.updatedAt).toBeInstanceOf(Date);
		});

		it('should create answer with multiple selections', () => {
			const answer = AnswerEntity.create({
				sessionId: 'session-123',
				gameId: 'game-456',
				nickname: 'TestUser',
				selections: {
					'presenter-1': 'episode-1',
					'presenter-2': 'episode-2',
					'presenter-3': 'episode-3',
				},
			});

			expect(answer.selections.size).toBe(3);
			expect(answer.selections.get('presenter-1')).toBe('episode-1');
			expect(answer.selections.get('presenter-2')).toBe('episode-2');
			expect(answer.selections.get('presenter-3')).toBe('episode-3');
		});
	});

	describe('validation', () => {
		it('should reject empty selections', () => {
			expect(() => {
				AnswerEntity.create({
					sessionId: 'session-123',
					gameId: 'game-456',
					nickname: 'TestUser',
					selections: {},
				});
			}).toThrow('Selections cannot be empty');
		});

		it('should reject empty nickname', () => {
			expect(() => {
				AnswerEntity.create({
					sessionId: 'session-123',
					gameId: 'game-456',
					nickname: '',
					selections: { 'presenter-1': 'episode-1' },
				});
			}).toThrow('Nickname must be between 1 and 20 characters');
		});

		it('should reject nickname longer than 20 characters', () => {
			expect(() => {
				AnswerEntity.create({
					sessionId: 'session-123',
					gameId: 'game-456',
					nickname: 'ThisNicknameIsWayTooLongAndExceedsTwentyCharacters',
					selections: { 'presenter-1': 'episode-1' },
				});
			}).toThrow('Nickname must be between 1 and 20 characters');
		});

		it('should accept nickname with exactly 20 characters', () => {
			const answer = AnswerEntity.create({
				sessionId: 'session-123',
				gameId: 'game-456',
				nickname: '12345678901234567890', // Exactly 20 chars
				selections: { 'presenter-1': 'episode-1' },
			});

			expect(answer.nickname).toBe('12345678901234567890');
		});

		it('should accept nickname with 1 character', () => {
			const answer = AnswerEntity.create({
				sessionId: 'session-123',
				gameId: 'game-456',
				nickname: 'A',
				selections: { 'presenter-1': 'episode-1' },
			});

			expect(answer.nickname).toBe('A');
		});

		it('should reject empty sessionId', () => {
			expect(() => {
				AnswerEntity.create({
					sessionId: '',
					gameId: 'game-456',
					nickname: 'TestUser',
					selections: { 'presenter-1': 'episode-1' },
				});
			}).toThrow('SessionId cannot be empty');
		});

		it('should reject empty gameId', () => {
			expect(() => {
				AnswerEntity.create({
					sessionId: 'session-123',
					gameId: '',
					nickname: 'TestUser',
					selections: { 'presenter-1': 'episode-1' },
				});
			}).toThrow('GameId cannot be empty');
		});
	});

	describe('toJSON', () => {
		it('should convert to JSON correctly', () => {
			const answer = AnswerEntity.create({
				sessionId: 'session-123',
				gameId: 'game-456',
				nickname: 'TestUser',
				selections: {
					'presenter-1': 'episode-1',
					'presenter-2': 'episode-2',
				},
			});

			const json = answer.toJSON();

			expect(json).toEqual({
				id: answer.id,
				sessionId: 'session-123',
				gameId: 'game-456',
				nickname: 'TestUser',
				selections: {
					'presenter-1': 'episode-1',
					'presenter-2': 'episode-2',
				},
				createdAt: answer.createdAt,
				updatedAt: answer.updatedAt,
			});
		});

		it('should convert selections Map to plain object', () => {
			const answer = AnswerEntity.create({
				sessionId: 'session-123',
				gameId: 'game-456',
				nickname: 'TestUser',
				selections: { 'presenter-1': 'episode-1' },
			});

			const json = answer.toJSON();

			expect(json.selections).toBeTypeOf('object');
			expect(json.selections).not.toBeInstanceOf(Map);
			expect(json.selections).toEqual({ 'presenter-1': 'episode-1' });
		});
	});

	describe('edge cases', () => {
		it('should handle Japanese characters in nickname', () => {
			const answer = AnswerEntity.create({
				sessionId: 'session-123',
				gameId: 'game-456',
				nickname: 'テストユーザー',
				selections: { 'presenter-1': 'episode-1' },
			});

			expect(answer.nickname).toBe('テストユーザー');
		});

		it('should handle special characters in IDs', () => {
			const answer = AnswerEntity.create({
				sessionId: 'session-abc-123-def',
				gameId: 'game-xyz-789',
				nickname: 'TestUser',
				selections: {
					'presenter-uuid-1': 'episode-uuid-a',
				},
			});

			expect(answer.sessionId).toBe('session-abc-123-def');
			expect(answer.gameId).toBe('game-xyz-789');
			expect(answer.selections.get('presenter-uuid-1')).toBe('episode-uuid-a');
		});

		it('should preserve timestamp precision', () => {
			const before = Date.now();
			const answer = AnswerEntity.create({
				sessionId: 'session-123',
				gameId: 'game-456',
				nickname: 'TestUser',
				selections: { 'presenter-1': 'episode-1' },
			});
			const after = Date.now();

			expect(answer.createdAt.getTime()).toBeGreaterThanOrEqual(before);
			expect(answer.createdAt.getTime()).toBeLessThanOrEqual(after);
			expect(answer.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
			expect(answer.updatedAt.getTime()).toBeLessThanOrEqual(after);
		});
	});
});
