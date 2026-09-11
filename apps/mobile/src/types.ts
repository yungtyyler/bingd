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

export type SearchUser = {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  isCurrentUser: boolean;
  isFollowing: boolean;
};

export type FriendActivity = {
  id: string;
  status: WatchStatus;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  } | null;
  show: {
    tvmazeId: number;
    name: string;
    imageUrl: string | null;
    network: string | null;
  } | null;
};
