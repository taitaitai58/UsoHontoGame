// GameStatus value object
// Encapsulates game status with type safety

export type GameStatusValue = '準備中' | '出題中' | '締切';

/**
 * Error thrown when GameStatus value is invalid
 */
export class InvalidGameStatusError extends Error {
  constructor(value: string) {
    super(`Invalid game status: ${value}`);
    this.name = 'InvalidGameStatusError';
  }
}

/**
 * GameStatus value object
 * Enforces valid game status values with type safety
 */
export class GameStatus {
  private readonly _value: GameStatusValue;

  /**
   * Creates a new GameStatus
   * @param value The status value
   * @throws InvalidGameStatusError if value is invalid
   */
  constructor(value: GameStatusValue) {
    if (!this.isValid(value)) {
      throw new InvalidGameStatusError(value);
    }
    this._value = value;
  }

  /**
   * Gets the status value
   */
  get value(): GameStatusValue {
    return this._value;
  }

  /**
   * Validates the status value
   * @param value The value to validate
   * @returns true if valid status
   */
  private isValid(value: string): value is GameStatusValue {
    return ['準備中', '出題中', '締切'].includes(value);
  }

  /**
   * Checks if game is accepting responses
   * @returns true if status is '出題中'
   */
  isAcceptingResponses(): boolean {
    return this._value === '出題中';
  }

  /**
   * Checks if game is in preparation
   * @returns true if status is '準備中'
   */
  isPreparation(): boolean {
    return this._value === '準備中';
  }

  /**
   * Checks if game is closed
   * @returns true if status is '締切'
   */
  isClosed(): boolean {
    return this._value === '締切';
  }

  /**
   * Checks if game can be edited (FR-014)
   * @returns true if status is '準備中'
   */
  canEdit(): boolean {
    return this._value === '準備中';
  }

  /**
   * Checks equality with another GameStatus
   * @param other The GameStatus to compare with
   * @returns true if values are equal
   */
  equals(other: GameStatus): boolean {
    return this._value === other._value;
  }

  /**
   * Static factory for preparation status
   */
  static preparation(): GameStatus {
    return new GameStatus('準備中');
  }

  /**
   * Static factory for accepting responses status
   */
  static acceptingResponses(): GameStatus {
    return new GameStatus('出題中');
  }

  /**
   * Static factory for closed status
   */
  static closed(): GameStatus {
    return new GameStatus('締切');
  }

  /**
   * Returns string representation
   */
  toString(): string {
    return this._value;
  }
}
