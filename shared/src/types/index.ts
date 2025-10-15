export type ApiResponse = {
  message: string;
  success: true;
};

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Content = {
  id: string;
  title: string;
  type: "movie" | "show";
  description: string | null;
  releaseDate: string | null;
  runtime: number | null;
  rating: string | null;
  status:
    | "released"
    | "upcoming"
    | "in_production"
    | "canceled"
    | "ended"
    | null;
  language: string | null;
  numberOfSeasons: number | null;
  numberOfEpisodes: number | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type Media = {
  id: string;
  contentId: string | null;
  fileUrl: string;
  type: "image" | "video";
  mediaCategory:
    | "poster"
    | "gallery_image"
    | "trailer"
    | "clip"
    | "profile_image";
  title: string | null;
  fileSize: number | null;
  key: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ContentWithMedia = {
  content: Content;
  media: Media[];
};
