export type PlayerRole = "BAT" | "BOWL" | "AR" | "WK";

export type ExternalMatch = {
  externalId: string;
  title: string;
  teamA: string;
  teamB: string;
  startsAt: string;
  status: "UPCOMING" | "LIVE" | "COMPLETED";
};

export type ExternalPlayer = {
  externalId: string;
  name: string;
  teamName: string;
  role: PlayerRole;
};

export type ExternalPlayerStats = {
  externalId: string;
  runs: number;
  wickets: number;
  catches: number;
  ballsFaced?: number;
};
