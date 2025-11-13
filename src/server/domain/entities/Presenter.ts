// Presenter Entity
// Feature: 002-game-preparation
// Encapsulates presenter data with episode validation (exactly 3 episodes required)

import type { Episode } from "./Episode";
import { ValidationError } from "../errors/ValidationError";

export type PresenterProps = {
	id: string;
	gameId: string;
	nickname: string;
	episodes: Episode[];
	createdAt: Date;
};

/**
 * Presenter entity representing a game participant who submits episodes
 * Enforces business rules: exactly 3 episodes required (FR-004), exactly 1 lie
 */
export class Presenter {
	private readonly _id: string;
	private readonly _gameId: string;
	private readonly _nickname: string;
	private readonly _episodes: readonly Episode[];
	private readonly _createdAt: Date;

	private constructor(props: PresenterProps) {
		this._id = props.id;
		this._gameId = props.gameId;
		this._nickname = props.nickname;
		this._episodes = Object.freeze([...props.episodes]);
		this._createdAt = props.createdAt;
	}

	/**
	 * Creates a new Presenter with validation
	 * @param props Presenter properties
	 * @throws ValidationError if nickname is empty or episodes don't meet requirements
	 */
	static create(props: PresenterProps): Presenter {
		// Validate nickname
		if (props.nickname.trim().length === 0) {
			throw new ValidationError("Presenter nickname cannot be empty");
		}

		// Validate episode count (FR-004: exactly 3 episodes required)
		if (props.episodes.length !== 3) {
			throw new ValidationError(
				`Presenter must have exactly 3 episodes (has ${props.episodes.length})`,
			);
		}

		// Validate exactly one lie among episodes
		const lieCount = props.episodes.filter((ep) => ep.isLie).length;
		if (lieCount !== 1) {
			throw new ValidationError(
				`Presenter must have exactly 1 lie episode (has ${lieCount})`,
			);
		}

		return new Presenter(props);
	}

	/**
	 * Creates an incomplete Presenter without episode validation
	 * Used during the initial presenter creation phase before episodes are added
	 * @param props Presenter properties (episodes can be 0-2 initially)
	 * @throws ValidationError if nickname is empty
	 */
	static createIncomplete(props: PresenterProps): Presenter {
		// Validate nickname
		if (props.nickname.trim().length === 0) {
			throw new ValidationError("Presenter nickname cannot be empty");
		}

		// Allow any number of episodes (0-3) for incomplete presenters
		if (props.episodes.length > 3) {
			throw new ValidationError(
				`Presenter cannot have more than 3 episodes (has ${props.episodes.length})`,
			);
		}

		return new Presenter(props);
	}

	/**
	 * Gets the presenter ID
	 */
	get id(): string {
		return this._id;
	}

	/**
	 * Gets the game ID this presenter belongs to
	 */
	get gameId(): string {
		return this._gameId;
	}

	/**
	 * Gets the presenter's nickname from session
	 */
	get nickname(): string {
		return this._nickname;
	}

	/**
	 * Gets all episodes (read-only)
	 */
	get episodes(): readonly Episode[] {
		return this._episodes;
	}

	/**
	 * Gets the creation timestamp
	 */
	get createdAt(): Date {
		return this._createdAt;
	}

	/**
	 * Checks if presenter has completed all required episodes
	 * Required: exactly 3 episodes with exactly 1 lie
	 */
	hasCompleteEpisodes(): boolean {
		if (this._episodes.length !== 3) {
			return false;
		}

		const lieCount = this._episodes.filter((ep) => ep.isLie).length;
		return lieCount === 1;
	}

	/**
	 * Gets the lie episode (confidential - FR-006)
	 * @throws Error if presenter doesn't have complete episodes
	 */
	getLieEpisode(): Episode {
		if (!this.hasCompleteEpisodes()) {
			throw new Error("Presenter does not have complete episodes");
		}

		const lie = this._episodes.find((ep) => ep.isLie);
		if (!lie) {
			throw new Error("Lie episode not found");
		}

		return lie;
	}

	/**
	 * Gets the truth episodes
	 */
	getTruthEpisodes(): Episode[] {
		return this._episodes.filter((ep) => !ep.isLie);
	}

	/**
	 * Checks equality with another Presenter
	 * @param other The Presenter to compare with
	 */
	equals(other: Presenter): boolean {
		return this._id === other._id;
	}

	/**
	 * Converts presenter to plain object for persistence
	 */
	toObject(): PresenterProps {
		return {
			id: this._id,
			gameId: this._gameId,
			nickname: this._nickname,
			episodes: [...this._episodes],
			createdAt: this._createdAt,
		};
	}
}
