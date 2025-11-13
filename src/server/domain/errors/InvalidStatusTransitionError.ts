// Invalid Status Transition Error
// Feature: 002-game-preparation
// Thrown when attempting invalid game status transitions (準備中 → 出題中 → 締切)

export class InvalidStatusTransitionError extends Error {
	constructor(
		public readonly currentStatus: string,
		public readonly targetStatus: string,
		message?: string,
	) {
		super(
			message ||
				`Cannot transition from ${currentStatus} to ${targetStatus}`,
		);
		this.name = "InvalidStatusTransitionError";
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, InvalidStatusTransitionError);
		}
	}
}
