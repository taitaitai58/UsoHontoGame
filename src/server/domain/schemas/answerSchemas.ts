// Zod Schemas: Answer Validation
// Runtime validation schemas with error codes for i18n translation via translateZodError()

import { z } from 'zod';

/**
 * Schema for submit answer request
 * Validates game ID and selections (presenterId -> episodeId mapping)
 */
export const SubmitAnswerSchema = z.object({
  gameId: z.string().min(1, 'REQUIRED'),
  selections: z
    .record(
      z.string().min(1, 'REQUIRED'),
      z.string().min(1, 'REQUIRED')
    )
    .refine(
      (selections) => Object.keys(selections).length > 0,
      'ANSWER_NO_SELECTIONS'
    ),
});

export type SubmitAnswerInput = z.infer<typeof SubmitAnswerSchema>;
