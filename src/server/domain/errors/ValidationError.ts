// Domain Validation Error
// Feature: 002-game-preparation
// Thrown when domain validation rules are violated

export class ValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ValidationError";
		// Maintains proper stack trace for where error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ValidationError);
		}
	}
}
