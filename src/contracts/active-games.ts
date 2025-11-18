/**
 * Server Action Contracts for TOP Active Games Display
 * Feature: 005-top-active-games
 *
 * TypeScript interfaces for Next.js Server Actions
 */

import { z } from 'zod';

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * Schema for fetching active games
 */
export const getActiveGamesRequestSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
}).optional();

export type GetActiveGamesRequest = z.infer<typeof getActiveGamesRequestSchema>;

// ============================================================================
// Response Schemas
// ============================================================================

/**
 * Individual game item in the active games list
 */
export const activeGameListItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  createdAt: z.string().datetime(),
  playerCount: z.number().min(0),
  playerLimit: z.number().min(1).max(100).nullable(),
  formattedCreatedAt: z.string(),
});

export type ActiveGameListItem = z.infer<typeof activeGameListItemSchema>;

/**
 * Response for active games list
 */
export const activeGamesResponseSchema = z.object({
  success: z.literal(true),
  games: z.array(activeGameListItemSchema),
  hasMore: z.boolean(),
  nextCursor: z.string().nullable(),
  total: z.number().min(0),
});

export type ActiveGamesResponse = z.infer<typeof activeGamesResponseSchema>;

/**
 * Error response schema
 */
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// ============================================================================
// Server Action Response Type
// ============================================================================

export type GetActiveGamesActionResponse = ActiveGamesResponse | ErrorResponse;

// ============================================================================
// Type Guards
// ============================================================================

export function isActiveGamesResponse(
  response: GetActiveGamesActionResponse
): response is ActiveGamesResponse {
  return response.success === true;
}

export function isErrorResponse(
  response: GetActiveGamesActionResponse
): response is ErrorResponse {
  return response.success === false;
}

// ============================================================================
// Server Action Function Signature
// ============================================================================

/**
 * Server action to fetch active games
 * This is the expected signature for the implementation
 */
export type GetActiveGamesAction = (
  request?: GetActiveGamesRequest
) => Promise<GetActiveGamesActionResponse>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate request parameters
 */
export function validateGetActiveGamesRequest(
  data: unknown
): GetActiveGamesRequest | undefined {
  const result = getActiveGamesRequestSchema.safeParse(data);
  return result.success ? result.data : undefined;
}

/**
 * Validate response data
 */
export function validateActiveGamesResponse(
  data: unknown
): ActiveGamesResponse | null {
  const result = activeGamesResponseSchema.safeParse(data);
  return result.success ? result.data : null;
}
