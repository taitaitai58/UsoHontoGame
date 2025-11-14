// Types for Inline Episode Registration
// Feature: 003-presenter-episode-inline

export interface EpisodeInput {
  text: string;
  isLie: boolean;
}

export interface AddPresenterWithEpisodesInput {
  gameId: string;
  nickname: string;
  episodes: [EpisodeInput, EpisodeInput, EpisodeInput]; // Exactly 3
}

export interface AddPresenterWithEpisodesOutput {
  presenter: {
    id: string;
    gameId: string;
    nickname: string;
    episodes: Array<{
      id: string;
      presenterId: string;
      text: string;
      isLie: boolean;
      createdAt: Date;
    }>;
    createdAt: Date;
  };
}
