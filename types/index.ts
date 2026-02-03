import { WatchStatus } from "@/app/generated/prisma/enums";

export interface TVMazeSearchItem {
  show: {
    id: number;
    name: string;
    image: { medium?: string; original?: string } | null;
  };
}

export interface ShowSnippet {
  tvmazeId: number;
  name: string;
  imageUrl: string | null;
  status?: "PLANNED" | "WATCHING" | "COMPLETED" | "DROPPED";
}

export interface AddShowButtonProps {
  show: {
    tvmazeId: number;
    name: string;
    imageUrl?: string;
    status: WatchStatus;
  };
}
