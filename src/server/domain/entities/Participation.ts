// Domain Entity: Participation
// Represents a participant's registration in a game

import { nanoid } from 'nanoid';

export interface ParticipationProps {
	id: string;
	sessionId: string;
	gameId: string;
	nickname: string;
	joinedAt: Date;
}

export interface CreateParticipationProps {
	sessionId: string;
	gameId: string;
	nickname: string;
}

export class ParticipationEntity {
	private constructor(private readonly props: ParticipationProps) {}

	static create(input: CreateParticipationProps): ParticipationEntity {
		// Validate nickname length (1-20 characters)
		if (input.nickname.length < 1 || input.nickname.length > 20) {
			throw new Error('Nickname must be between 1 and 20 characters');
		}

		// Validate sessionId is not empty
		if (!input.sessionId || input.sessionId.trim() === '') {
			throw new Error('SessionId cannot be empty');
		}

		// Validate gameId is not empty
		if (!input.gameId || input.gameId.trim() === '') {
			throw new Error('GameId cannot be empty');
		}

		return new ParticipationEntity({
			id: nanoid(),
			sessionId: input.sessionId,
			gameId: input.gameId,
			nickname: input.nickname,
			joinedAt: new Date(),
		});
	}

	get id(): string {
		return this.props.id;
	}

	get sessionId(): string {
		return this.props.sessionId;
	}

	get gameId(): string {
		return this.props.gameId;
	}

	get nickname(): string {
		return this.props.nickname;
	}

	get joinedAt(): Date {
		return this.props.joinedAt;
	}

	toJSON(): {
		id: string;
		sessionId: string;
		gameId: string;
		nickname: string;
		joinedAt: Date;
	} {
		return {
			id: this.props.id,
			sessionId: this.props.sessionId,
			gameId: this.props.gameId,
			nickname: this.props.nickname,
			joinedAt: this.props.joinedAt,
		};
	}
}
