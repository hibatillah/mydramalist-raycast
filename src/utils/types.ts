import { Image } from "@raycast/api";

export interface Drama {
  id: number;
  icon: Image.ImageLike;
  title: string;
  nativeTitle?: string;
  aka?: string[];
  directors?: string[];
  genres: string[];
  tags?: string[];
  cast: string[];
  link: string;
  type: string;
  status: string;
  country: string;
  episodes?: number;
  airs?: string;
  aired?: string;
  airedOn?: string;
  airedYear?: number;
  originalNetwork?: string;
  duration?: string;
  score?: number;
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
