// NotFoundError
// Feature: 002-game-preparation
// Error thrown when a resource is not found

/**
 * Error thrown when a requested resource cannot be found
 * Used for entities like Games, Presenters, Episodes, Sessions, etc.
 */
export class NotFoundError extends Error {
	/**
	 * Creates a new NotFoundError
	 * @param message Error message describing what was not found
	 */
	constructor(message: string) {
		super(message);
		this.name = "NotFoundError";
	}
}
