/**
 * Zod schemas for Server Action validation
 * These schemas are used for runtime validation in Next.js Server Actions
 */

import { z } from 'zod';

// ================== Request Schemas ==================

/**
 * Schema for starting a game (準備中 → 出題中)
 */
export const startGameRequestSchema = z.object({
  gameId: z.string().uuid('Invalid game ID format'),
  sessionId: z.string().min(1, 'Session ID is required'),
});

export type StartGameRequest = z.infer<typeof startGameRequestSchema>;

/**
 * Schema for closing a game (出題中 → 締切)
 */
export const closeGameRequestSchema = z.object({
  gameId: z.string().uuid('Invalid game ID format'),
  sessionId: z.string().min(1, 'Session ID is required'),
  confirmed: z.boolean().refine((val) => val === true, {
    message: 'Confirmation is required to close the game',
  }),
});

export type CloseGameRequest = z.infer<typeof closeGameRequestSchema>;

/**
 * Schema for validating a status transition
 */
export const validateTransitionRequestSchema = z.object({
  gameId: z.string().uuid('Invalid game ID format'),
  targetStatus: z.enum(['出題中', '締切'], {
    errorMap: () => ({ message: 'Invalid target status' }),
  }),
});

export type ValidateTransitionRequest = z.infer<typeof validateTransitionRequestSchema>;

// ================== Response Schemas ==================

/**
 * Game status enum
 */
export const gameStatusSchema = z.enum(['準備中', '出題中', '締切']);
export type GameStatus = z.infer<typeof gameStatusSchema>;

/**
 * Successful status transition response
 */
export const statusTransitionSuccessSchema = z.object({
  success: z.literal(true),
  game: z.object({
    id: z.string().uuid(),
    status: gameStatusSchema,
    updatedAt: z.string().datetime(),
  }),
});

export type StatusTransitionSuccess = z.infer<typeof statusTransitionSuccessSchema>;

/**
 * Validation result for status transition
 */
export const validationResultSchema = z.object({
  canTransition: z.boolean(),
  currentStatus: gameStatusSchema,
  targetStatus: gameStatusSchema,
  errors: z
    .array(
      z.object({
        code: z.enum([
          'NO_PRESENTERS',
          'INCOMPLETE_PRESENTER',
          'INVALID_LIE_COUNT',
          'GAME_ALREADY_CLOSED',
          'INVALID_STATUS_TRANSITION',
        ]),
        message: z.string(),
        details: z.record(z.unknown()).optional(),
      })
    )
    .optional(),
});

export type ValidationResult = z.infer<typeof validationResultSchema>;

// ================== Error Schemas ==================

/**
 * Validation error response
 */
export const validationErrorSchema = z.object({
  success: z.literal(false),
  errors: z.object({
    status: z.array(z.string()).optional(),
    presenters: z.array(z.string()).optional(),
    _form: z.array(z.string()).optional(),
  }),
});

export type ValidationError = z.infer<typeof validationErrorSchema>;

/**
 * Status transition error response
 */
export const statusTransitionErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.enum([
      'INVALID_STATUS_TRANSITION',
      'NO_PRESENTERS',
      'INCOMPLETE_PRESENTER',
      'INVALID_LIE_COUNT',
      'GAME_ALREADY_CLOSED',
    ]),
    message: z.string(),
    currentStatus: gameStatusSchema,
    details: z.record(z.unknown()).optional(),
  }),
});

export type StatusTransitionError = z.infer<typeof statusTransitionErrorSchema>;

/**
 * Unauthorized error response
 */
export const unauthorizedErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.literal('UNAUTHORIZED'),
    message: z.literal('このゲームを変更する権限がありません'),
  }),
});

export type UnauthorizedError = z.infer<typeof unauthorizedErrorSchema>;

/**
 * Not found error response
 */
export const notFoundErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.literal('NOT_FOUND'),
    message: z.literal('ゲームが見つかりません'),
  }),
});

export type NotFoundError = z.infer<typeof notFoundErrorSchema>;

// ================== Union Types ==================

/**
 * Combined response type for Server Actions
 */
export type StatusTransitionResponse =
  | StatusTransitionSuccess
  | ValidationError
  | StatusTransitionError
  | UnauthorizedError
  | NotFoundError;

/**
 * Type guard functions
 */
export const isSuccess = (
  response: StatusTransitionResponse
): response is StatusTransitionSuccess => {
  return response.success === true;
};

export const isValidationError = (
  response: StatusTransitionResponse
): response is ValidationError => {
  return response.success === false && 'errors' in response;
};

export const isStatusTransitionError = (
  response: StatusTransitionResponse
): response is StatusTransitionError => {
  return response.success === false && 'error' in response && 'currentStatus' in response.error;
};

export const isUnauthorizedError = (
  response: StatusTransitionResponse
): response is UnauthorizedError => {
  return (
    response.success === false && 'error' in response && response.error.code === 'UNAUTHORIZED'
  );
};

export const isNotFoundError = (response: StatusTransitionResponse): response is NotFoundError => {
  return response.success === false && 'error' in response && response.error.code === 'NOT_FOUND';
};
