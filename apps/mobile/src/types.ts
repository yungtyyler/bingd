export type WatchStatus = "PLANNED" | "WATCHING" | "COMPLETED" | "DROPPED";

export type MobileUser = {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  needsUsername: boolean;
};

export type LibraryEntry = {
  id: string;
  showId: string;
  status: WatchStatus;
  updatedAt: string;
  show: {
    tvmazeId: number;
    name: string;
    imageUrl: string | null;
    status: string | null;
    network: string | null;
    nextEpisodeDate: string | null;
    nextEpisodeSeason: number | null;
    nextEpisodeNumber: number | null;
  } | null;
};

export type SearchShow = {
  tvmazeId: number;
  name: string;
  imageUrl: string | null;
  status?: WatchStatus;
};
