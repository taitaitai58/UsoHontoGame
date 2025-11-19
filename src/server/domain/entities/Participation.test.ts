// Domain Entity Tests: Participation
// Test-Driven Development: Write FAILING tests first

import { describe, expect, it } from 'vitest';
import { ParticipationEntity } from './Participation';

describe('Participation Entity', () => {
	describe('create', () => {
		it('should create valid participation entity', () => {
			const participation = ParticipationEntity.create({
				sessionId: 'session-123',
				gameId: 'game-456',
				nickname: 'TestUser',
			});

			expect(participation.id).toBeTruthy();
			expect(participation.id).toMatch(/^[a-zA-Z0-9_-]+$/); // nanoid format
			expect(participation.sessionId).toBe('session-123');
			expect(participation.gameId).toBe('game-456');
			expect(participation.nickname).toBe('TestUser');
			expect(participation.joinedAt).toBeInstanceOf(Date);
		});

		it('should generate unique IDs for different participations', () => {
			const participation1 = ParticipationEntity.create({
				sessionId: 'session-123',
				gameId: 'game-456',
				nickname: 'User1',
			});

			const participation2 = ParticipationEntity.create({
				sessionId: 'session-789',
				gameId: 'game-456',
				nickname: 'User2',
			});

			expect(participation1.id).not.toBe(participation2.id);
		});
	});

	describe('validation', () => {
		it('should reject empty nickname', () => {
			expect(() => {
				ParticipationEntity.create({
					sessionId: 'session-123',
					gameId: 'game-456',
					nickname: '',
				});
			}).toThrow('Nickname must be between 1 and 20 characters');
		});

		it('should reject nickname longer than 20 characters', () => {
			expect(() => {
				ParticipationEntity.create({
					sessionId: 'session-123',
					gameId: 'game-456',
					nickname: 'ThisNicknameIsWayTooLongAndExceedsTwentyCharacters',
				});
			}).toThrow('Nickname must be between 1 and 20 characters');
		});

		it('should accept nickname with exactly 20 characters', () => {
			const participation = ParticipationEntity.create({
				sessionId: 'session-123',
				gameId: 'game-456',
				nickname: '12345678901234567890', // Exactly 20 chars
			});

			expect(participation.nickname).toBe('12345678901234567890');
		});

		it('should accept nickname with 1 character', () => {
			const participation = ParticipationEntity.create({
				sessionId: 'session-123',
				gameId: 'game-456',
				nickname: 'A',
			});

			expect(participation.nickname).toBe('A');
		});

		it('should reject empty sessionId', () => {
			expect(() => {
				ParticipationEntity.create({
					sessionId: '',
					gameId: 'game-456',
					nickname: 'TestUser',
				});
			}).toThrow('SessionId cannot be empty');
		});

		it('should reject empty gameId', () => {
			expect(() => {
				ParticipationEntity.create({
					sessionId: 'session-123',
					gameId: '',
					nickname: 'TestUser',
				});
			}).toThrow('GameId cannot be empty');
		});
	});

	describe('toJSON', () => {
		it('should convert to JSON correctly', () => {
			const participation = ParticipationEntity.create({
				sessionId: 'session-123',
				gameId: 'game-456',
				nickname: 'TestUser',
			});

			const json = participation.toJSON();

			expect(json).toEqual({
				id: participation.id,
				sessionId: 'session-123',
				gameId: 'game-456',
				nickname: 'TestUser',
				joinedAt: participation.joinedAt,
			});
		});

		it('should return plain object (not class instance)', () => {
			const participation = ParticipationEntity.create({
				sessionId: 'session-123',
				gameId: 'game-456',
				nickname: 'TestUser',
			});

			const json = participation.toJSON();

			expect(json).toBeTypeOf('object');
			expect(json).not.toBeInstanceOf(ParticipationEntity);
		});
	});

	describe('edge cases', () => {
		it('should handle Japanese characters in nickname', () => {
			const participation = ParticipationEntity.create({
				sessionId: 'session-123',
				gameId: 'game-456',
				nickname: 'テストユーザー',
			});

			expect(participation.nickname).toBe('テストユーザー');
		});

		it('should handle special characters in IDs', () => {
			const participation = ParticipationEntity.create({
				sessionId: 'session-abc-123-def',
				gameId: 'game-xyz-789',
				nickname: 'TestUser',
			});

			expect(participation.sessionId).toBe('session-abc-123-def');
			expect(participation.gameId).toBe('game-xyz-789');
		});

		it('should preserve timestamp precision', () => {
			const before = Date.now();
			const participation = ParticipationEntity.create({
				sessionId: 'session-123',
				gameId: 'game-456',
				nickname: 'TestUser',
			});
			const after = Date.now();

			expect(participation.joinedAt.getTime()).toBeGreaterThanOrEqual(before);
			expect(participation.joinedAt.getTime()).toBeLessThanOrEqual(after);
		});

		it('should handle emojis in nickname within length limit', () => {
			const participation = ParticipationEntity.create({
				sessionId: 'session-123',
				gameId: 'game-456',
				nickname: 'User🎮', // 5 characters (emoji counts as 1)
			});

			expect(participation.nickname).toBe('User🎮');
		});
	});

	describe('business rules', () => {
		it('should allow same session to participate in different games', () => {
			const participation1 = ParticipationEntity.create({
				sessionId: 'session-123',
				gameId: 'game-1',
				nickname: 'TestUser',
			});

			const participation2 = ParticipationEntity.create({
				sessionId: 'session-123',
				gameId: 'game-2',
				nickname: 'TestUser',
			});

			expect(participation1.sessionId).toBe(participation2.sessionId);
			expect(participation1.gameId).not.toBe(participation2.gameId);
			expect(participation1.id).not.toBe(participation2.id);
		});

		it('should allow different sessions to participate in same game', () => {
			const participation1 = ParticipationEntity.create({
				sessionId: 'session-1',
				gameId: 'game-456',
				nickname: 'User1',
			});

			const participation2 = ParticipationEntity.create({
				sessionId: 'session-2',
				gameId: 'game-456',
				nickname: 'User2',
			});

			expect(participation1.gameId).toBe(participation2.gameId);
			expect(participation1.sessionId).not.toBe(participation2.sessionId);
			expect(participation1.id).not.toBe(participation2.id);
		});
	});
});
