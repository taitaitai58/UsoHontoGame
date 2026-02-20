'use server';

// Presenter Server Actions
// Feature: 002-game-preparation, Server Actions リファクタリング - Phase 3
// Server Actions with Zod validation for presenter/episode management
// Refactored to use PresenterApplicationService

import { revalidatePath } from 'next/cache';
import { translateZodError } from '@/lib/i18n/translateZodError';
import type { EpisodeWithLieDto } from '@/server/application/dto/EpisodeWithLieDto';
import type { PresenterWithLieDto } from '@/server/application/dto/PresenterWithLieDto';
import { PresenterApplicationService } from '@/server/application/services/PresenterApplicationService';
import {
  AddEpisodeSchema,
  AddPresenterSchema,
  AddPresenterWithEpisodesSchema,
  RemovePresenterSchema,
} from '@/server/domain/schemas/gameSchemas';

// PresenterApplicationService インスタンス（モジュールレベルSingleton）
const presenterService = new PresenterApplicationService();

/**
 * Add Presenter Server Action
 * Adds a new presenter to a game
 * @param formData Form data with gameId and nickname
 * @returns Added presenter or validation errors
 */
export async function addPresenterAction(
  formData: FormData
): Promise<
  | { success: true; presenter: PresenterWithLieDto }
  | { success: false; errors: Record<string, string[]> }
> {
  // 1. FormDataパース・Zodバリデーション
  const rawData = {
    gameId: formData.get('gameId'),
    nickname: formData.get('nickname'),
  };

  const validationResult = AddPresenterSchema.safeParse(rawData);
  if (!validationResult.success) {
    return {
      success: false,
      errors: await translateZodError(validationResult.error),
    };
  }

  // 2. Application Service呼び出し
  const result = await presenterService.addPresenter({
    gameId: validationResult.data.gameId,
    nickname: validationResult.data.nickname,
  });

  // 3. 成功時のみrevalidatePath
  if (result.success) {
    revalidatePath(`/game/${validationResult.data.gameId}/presenters`);
    return { success: true, presenter: result.data };
  }

  return result;
}

/**
 * Remove Presenter Server Action
 * Removes a presenter from a game (cascade deletes episodes)
 * @param formData Form data with gameId and presenterId
 * @returns Success status or validation errors
 */
export async function removePresenterAction(
  formData: FormData
): Promise<{ success: true } | { success: false; errors: Record<string, string[]> }> {
  // 1. FormDataパース・Zodバリデーション
  const rawData = {
    gameId: formData.get('gameId'),
    presenterId: formData.get('presenterId'),
  };

  const validationResult = RemovePresenterSchema.safeParse(rawData);
  if (!validationResult.success) {
    return {
      success: false,
      errors: await translateZodError(validationResult.error),
    };
  }

  // 2. Application Service呼び出し
  const result = await presenterService.removePresenter({
    gameId: validationResult.data.gameId,
    presenterId: validationResult.data.presenterId,
  });

  // 3. 成功時のみrevalidatePath
  if (result.success) {
    revalidatePath(`/game/${validationResult.data.gameId}/presenters`);
  }

  return result;
}

/**
 * Add Episode Server Action
 * Adds a new episode to a presenter
 * @param formData Form data with presenterId, text, and isLie
 * @returns Added episode or validation errors
 *
 * @deprecated This action is deprecated as of feature 003-presenter-episode-inline.
 * Use addPresenterWithEpisodesAction instead, which allows registering a presenter
 * with all 3 episodes in a single atomic operation.
 * This action remains for backward compatibility only.
 */
export async function addEpisodeAction(
  formData: FormData
): Promise<
  | { success: true; episode: EpisodeWithLieDto }
  | { success: false; errors: Record<string, string[]> }
> {
  // 1. FormDataパース・Zodバリデーション
  const rawData = {
    presenterId: formData.get('presenterId'),
    text: formData.get('text'),
    isLie: formData.get('isLie') === 'true',
  };

  const validationResult = AddEpisodeSchema.safeParse(rawData);
  if (!validationResult.success) {
    return {
      success: false,
      errors: await translateZodError(validationResult.error),
    };
  }

  // 2. Application Service呼び出し
  const result = await presenterService.addEpisode({
    presenterId: validationResult.data.presenterId,
    text: validationResult.data.text,
    isLie: validationResult.data.isLie,
  });

  // 3. 成功時のみrevalidatePath（gameIdは不明なので省略）
  // Note: このアクションはdeprecatedのため、revalidatePathは省略

  if (result.success) {
    return { success: true, episode: result.data };
  }

  return result;
}

/**
 * Add Presenter With Episodes Server Action (Feature: 003-presenter-episode-inline)
 * Adds a new presenter to a game with 3 episodes in a single atomic operation
 * This replaces the 2-step process of adding presenter then episodes separately
 * @param formData Form data with gameId, nickname, and 3 episodes
 * @returns Added presenter with episodes or validation errors
 */
export async function addPresenterWithEpisodesAction(
  formData: FormData
): Promise<
  | { success: true; presenter: PresenterWithLieDto }
  | { success: false; errors: Record<string, string[]> }
> {
  // 1. FormDataパース
  const episodesRaw = [];
  for (let i = 0; i < 3; i += 1) {
    const text = formData.get(`episodes[${i}].text`) || formData.get(`episode${i}Text`);
    const isLieStr = formData.get(`episodes[${i}].isLie`) || formData.get(`episode${i}IsLie`);
    episodesRaw.push({
      text: text || '', // Convert null to empty string for validation
      isLie: isLieStr === 'true',
    });
  }

  const rawData = {
    gameId: formData.get('gameId'),
    nickname: formData.get('nickname') || '', // Convert null to empty string for validation
    episodes: episodesRaw,
  };

  // 2. Zodバリデーション
  const validationResult = AddPresenterWithEpisodesSchema.safeParse(rawData);
  if (!validationResult.success) {
    return {
      success: false,
      errors: await translateZodError(validationResult.error),
    };
  }

  // 3. Application Service呼び出し
  const result = await presenterService.addPresenterWithEpisodes({
    gameId: validationResult.data.gameId,
    nickname: validationResult.data.nickname,
    episodes: validationResult.data.episodes,
  });

  // 4. 成功時のみrevalidatePath
  if (result.success) {
    revalidatePath(`/game/${validationResult.data.gameId}/presenters`);
    return { success: true, presenter: result.data };
  }

  return result;
}
