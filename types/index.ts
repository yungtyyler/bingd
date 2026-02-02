export interface TVMazeSearchItem {
  show: {
    tvmazeId: number;
    name: string;
    image: { medium?: string; original?: string } | null;
  };
}
