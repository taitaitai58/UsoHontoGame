// Game entity
// Feature: 002-game-preparation
// Represents a game instance with status transitions and presenter management

import type { GameId } from '../value-objects/GameId';
import { GameStatus } from '../value-objects/GameStatus';
import { InvalidStatusTransitionError } from '../errors/InvalidStatusTransitionError';

/**
 * Error thrown when game name is invalid
 */
export class EmptyGameNameError extends Error {
  constructor() {
    super('Game name cannot be empty');
    this.name = 'EmptyGameNameError';
  }
}

/**
 * Error thrown when player count is invalid
 */
export class InvalidPlayerCountError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPlayerCountError';
  }
}

/**
 * Game entity
 * Represents a game with status, player limits, and metadata
 */
export class Game {
  private _id: GameId;
  private _name: string;
  private _status: GameStatus;
  private _maxPlayers: number;
  private _currentPlayers: number;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _creatorId: string;

  /**
   * Creates a new Game
   * @param id Unique game identifier
   * @param name Game display name
   * @param status Current game status
   * @param maxPlayers Maximum number of players
   * @param currentPlayers Current number of registered players
   * @param createdAt When the game was created
   * @param updatedAt When the game was last updated
   * @param creatorId Session ID of the moderator who created the game
   */
  constructor(
    id: GameId,
    name: string,
    status: GameStatus,
    maxPlayers: number,
    currentPlayers: number,
    createdAt: Date,
    updatedAt: Date,
    creatorId: string = ""
  ) {
    this._id = id;
    this._name = name;
    this._status = status;
    this._maxPlayers = maxPlayers;
    this._currentPlayers = currentPlayers;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._creatorId = creatorId;
    this.validate();
  }

  /**
   * Gets the game ID
   */
  get id(): GameId {
    return this._id;
  }

  /**
   * Gets the game name
   */
  get name(): string {
    return this._name;
  }

  /**
   * Gets the game status
   */
  get status(): GameStatus {
    return this._status;
  }

  /**
   * Gets the maximum number of players
   */
  get maxPlayers(): number {
    return this._maxPlayers;
  }

  /**
   * Gets the current number of players
   */
  get currentPlayers(): number {
    return this._currentPlayers;
  }

  /**
   * Gets the creation timestamp
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Gets the last update timestamp
   */
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Gets the creator/moderator session ID
   */
  get creatorId(): string {
    return this._creatorId;
  }

  /**
   * Gets the number of available slots (derived property)
   */
  get availableSlots(): number {
    return this._maxPlayers - this._currentPlayers;
  }

  /**
   * Checks if game is accepting responses (derived property)
   */
  get isAcceptingResponses(): boolean {
    return this._status.isAcceptingResponses();
  }

  /**
   * Validates game invariants
   * @throws EmptyGameNameError if name is empty
   * @throws InvalidPlayerCountError if player counts are invalid
   */
  validate(): void {
    if (this._name.trim() === '') {
      throw new EmptyGameNameError();
    }

    if (this._maxPlayers <= 0) {
      throw new InvalidPlayerCountError('Max players must be positive');
    }

    if (this._currentPlayers < 0) {
      throw new InvalidPlayerCountError('Current players cannot be negative');
    }

    if (this._currentPlayers > this._maxPlayers) {
      throw new InvalidPlayerCountError('Current players cannot exceed max players');
    }
  }

  /**
   * Updates the game status
   * @param status New status
   */
  setStatus(status: GameStatus): void {
    this._status = status;
    this._updatedAt = new Date();
  }

  /**
   * Increments the current player count
   */
  addPlayer(): void {
    if (this._currentPlayers >= this._maxPlayers) {
      throw new InvalidPlayerCountError('Game is full');
    }
    this._currentPlayers++;
    this._updatedAt = new Date();
  }

  /**
   * Decrements the current player count
   */
  removePlayer(): void {
    if (this._currentPlayers <= 0) {
      throw new InvalidPlayerCountError('No players to remove');
    }
    this._currentPlayers--;
    this._updatedAt = new Date();
  }

  /**
   * Transitions game from 準備中 to 出題中 (FR-001)
   * @throws InvalidStatusTransitionError if not in 準備中 status
   */
  startAccepting(): void {
    if (!this._status.isPreparation()) {
      throw new InvalidStatusTransitionError(
        this._status.toString(),
        '出題中',
        'Can only start accepting from 準備中 status'
      );
    }
    this._status = GameStatus.acceptingResponses();
    this._updatedAt = new Date();
  }

  /**
   * Transitions game from 出題中 to 締切 (FR-001)
   * @throws InvalidStatusTransitionError if not in 出題中 status
   */
  close(): void {
    if (!this._status.isAcceptingResponses()) {
      throw new InvalidStatusTransitionError(
        this._status.toString(),
        '締切',
        'Can only close from 出題中 status'
      );
    }
    this._status = GameStatus.closed();
    this._updatedAt = new Date();
  }

  /**
   * Checks if game can be edited (FR-014)
   * Only games in 準備中 status can be edited
   */
  canEdit(): boolean {
    return this._status.canEdit();
  }
}
