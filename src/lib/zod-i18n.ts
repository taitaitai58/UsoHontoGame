/**
 * Zod Validation Error Translation
 * Feature: 008-i18n-support
 *
 * Maps Zod validation error codes to i18n translation keys
 * Supports server-side translation of validation errors
 */

'use server';

import { t } from './i18n/server';
import type { TranslationKey } from './i18n/types';

/**
 * Mapping of Zod error codes to translation keys
 */
const zodErrorMap: Record<string, TranslationKey> = {
  // Generic validation errors
  REQUIRED: 'validation.required',
  INVALID: 'validation.invalid',
  TOO_LONG: 'validation.tooLong',
  TOO_SHORT: 'validation.tooShort',
  OUT_OF_RANGE: 'validation.outOfRange',
  NOT_INTEGER: 'validation.notInteger',

  // Game validation errors
  GAME_NAME_TOO_LONG: 'validation.game.name.tooLong',
  GAME_PLAYER_LIMIT_RANGE: 'validation.game.playerLimit.range',
  GAME_PLAYER_LIMIT_BELOW_CURRENT: 'validation.game.playerLimit.belowCurrent',
  GAME_PLAYER_LIMIT_NOT_INTEGER: 'validation.game.playerLimit.notInteger',
  GAME_PLAYER_LIMIT_TOO_LOW: 'validation.game.playerLimit.tooLow',
  GAME_PLAYER_LIMIT_TOO_HIGH: 'validation.game.playerLimit.tooHigh',

  // Nickname validation errors
  NICKNAME_EMPTY: 'validation.nickname.empty',
  NICKNAME_TOO_LONG: 'validation.nickname.tooLong',

  // Episode validation errors
  EPISODE_EMPTY: 'validation.episode.empty',
  EPISODE_TOO_LONG: 'validation.episode.tooLong',
  EPISODE_COUNT: 'validation.episode.count',
  EPISODE_LIE_COUNT: 'validation.episode.lieCount',

  // Presenter validation errors
  PRESENTER_ALREADY_COMPLETE: 'validation.presenter.alreadyComplete',
  PRESENTER_NOT_FOUND: 'validation.presenter.notFound',

  // Answer validation errors
  ANSWER_NO_SELECTIONS: 'validation.answer.noSelections',
  ANSWER_INCOMPLETE: 'validation.answer.incomplete',
};

/**
 * Replace template parameters in translated strings
 *
 * @param text - Text with {param} placeholders
 * @param params - Object with parameter values
 * @returns Text with placeholders replaced
 *
 * @example
 * ```typescript
 * replaceParams('Must be between {min} and {max}', { min: 1, max: 100 })
 * // Returns: 'Must be between 1 and 100'
 * ```
 */
export function replaceParams(text: string, params: Record<string, string | number>): string {
  let result = text;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return result;
}

/**
 * Translate a Zod validation error code
 *
 * @param code - Error code (e.g., 'GAME_NAME_TOO_LONG')
 * @param params - Optional parameters for template replacement (e.g., {min: 1, max: 100})
 * @returns Translated error message
 *
 * @example
 * ```typescript
 * // In a Zod schema
 * const gameSchema = z.object({
 *   name: z.string().max(100).refine((val) => val.length <= 100, {
 *     message: 'GAME_NAME_TOO_LONG', // Will be translated via translateZodError
 *   }),
 * });
 *
 * // In a Server Action
 * const result = gameSchema.safeParse(data);
 * if (!result.success) {
 *   const errors = await Promise.all(
 *     result.error.errors.map(async (err) => ({
 *       path: err.path,
 *       message: await translateZodError(err.message),
 *     }))
 *   );
 * }
 * ```
 */
export async function translateZodError(
  code: string,
  params?: Record<string, string | number>
): Promise<string> {
  const key = zodErrorMap[code];

  if (!key) {
    // If no mapping exists, return the code itself (fallback)
    return code;
  }

  const translated = await t(key);

  // Replace template parameters if provided
  if (params) {
    return replaceParams(translated, params);
  }

  return translated;
}

/**
 * Translate multiple Zod errors
 *
 * @param codes - Array of error codes
 * @returns Array of translated error messages
 */
export async function translateZodErrors(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map((code) => translateZodError(code)));
}

/**
 * Format Zod error for form submission
 *
 * Converts Zod validation errors into a form-friendly format with translated messages
 *
 * @param error - Zod error object
 * @returns Object mapping field paths to error message arrays
 */
export async function formatZodErrorForForm(error: {
  errors: Array<{ path: (string | number)[]; message: string }>;
}): Promise<Record<string, string[]>> {
  const formErrors: Record<string, string[]> = {};

  for (const err of error.errors) {
    const fieldPath = err.path.join('.');
    const translatedMessage = await translateZodError(err.message);

    if (!formErrors[fieldPath]) {
      formErrors[fieldPath] = [];
    }
    formErrors[fieldPath].push(translatedMessage);
  }

  return formErrors;
}
