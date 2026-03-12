import { Image } from "@raycast/api";

export interface Drama {
  id: string;
  icon: Image.ImageLike;
  title: string;
  nativeTitle?: string;
  aka?: string[];
  directors?: string[];
  genres: string[];
  tags?: string[];
  cast: string[];
  link: string;
  type: MovieType;
  status: MovieStatus;
  watchedStatus: WatchlistStatus;
  country: string;
  episodes?: number;
  episodesWatched?: number;
  airs?: string;
  aired?: string;
  airedOn?: string;
  airedYear?: number;
  originalNetwork?: string;
  duration?: string;
  score?: number;
  mdlScore?: number;
  ranked?: number;
  popularity?: number;
  watchers?: number;
  related?: string[];
  description?: string;
  externalLink?: {
    title: string;
    text: string;
    link: string;
  }[];
}

export interface ProgressForm {
  status: string;
  episodesWatched: string;
  rate: string;
  whatYouLikeMost: string[];
  notes: string;
}

export type MovieType = "drama" | "movie" | "show";
export type MovieStatus = "ongoing" | "completed" | "upcoming";

export type WatchlistStatus =
  | "watching"
  | "completed"
  | "on-hold"
  | "dropped"
  | "plan-to-watch"
  | "undecided"
  | "not-interested";

export type SearchFilter = "all" | MovieType | MovieStatus;

export type WatchlistFilter = "all" | WatchlistStatus;
