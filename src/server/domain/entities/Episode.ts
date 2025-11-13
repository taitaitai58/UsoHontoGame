// Episode Entity
// Feature: 002-game-preparation
// Encapsulates episode data with validation (1-1000 chars, isLie boolean)

import { ValidationError } from "../errors/ValidationError";

export type EpisodeProps = {
	id: string;
	presenterId: string;
	text: string;
	isLie: boolean;
	createdAt: Date;
};

/**
 * Episode entity representing a story/statement by a presenter
 * Enforces text length constraints and truth/lie marker
 */
export class Episode {
	private readonly _id: string;
	private readonly _presenterId: string;
	private readonly _text: string;
	private readonly _isLie: boolean;
	private readonly _createdAt: Date;

	private constructor(props: EpisodeProps) {
		this._id = props.id;
		this._presenterId = props.presenterId;
		this._text = props.text;
		this._isLie = props.isLie;
		this._createdAt = props.createdAt;
	}

	/**
	 * Creates a new Episode with validation
	 * @param props Episode properties
	 * @throws ValidationError if text length is invalid (must be 1-1000 characters)
	 */
	static create(props: EpisodeProps): Episode {
		// Validate text length (Assumption 3: 1-1000 characters)
		if (props.text.trim().length === 0) {
			throw new ValidationError("Episode text cannot be empty");
		}
		if (props.text.length > 1000) {
			throw new ValidationError(
				"Episode text cannot exceed 1000 characters",
			);
		}

		return new Episode(props);
	}

	/**
	 * Gets the episode ID
	 */
	get id(): string {
		return this._id;
	}

	/**
	 * Gets the presenter ID who created this episode
	 */
	get presenterId(): string {
		return this._presenterId;
	}

	/**
	 * Gets the episode text content
	 */
	get text(): string {
		return this._text;
	}

	/**
	 * Gets the truth/lie marker (FR-006 - confidential)
	 */
	get isLie(): boolean {
		return this._isLie;
	}

	/**
	 * Gets the creation timestamp
	 */
	get createdAt(): Date {
		return this._createdAt;
	}

	/**
	 * Checks if this episode is the truth
	 */
	isTruth(): boolean {
		return !this._isLie;
	}

	/**
	 * Checks equality with another Episode
	 * @param other The Episode to compare with
	 */
	equals(other: Episode): boolean {
		return this._id === other._id;
	}

	/**
	 * Converts episode to plain object for persistence
	 */
	toObject(): EpisodeProps {
		return {
			id: this._id,
			presenterId: this._presenterId,
			text: this._text,
			isLie: this._isLie,
			createdAt: this._createdAt,
		};
	}
}
