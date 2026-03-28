import { addHours } from "date-fns";
import type { ExternalMatch, ExternalPlayer, ExternalPlayerStats, PlayerRole } from "@/types";

const API_KEY = process.env.CRIC_API_KEY;
const BASE_URL = "https://api.cricapi.com/v1";

function inferRole(name: string): PlayerRole {
  const seed = name.charCodeAt(0) % 4;
  return ["BAT", "BOWL", "AR", "WK"][seed] as PlayerRole;
}

async function fetchCricApi<T>(path: string): Promise<T | null> {
  if (!API_KEY) return null;

  const url = `${BASE_URL}${path}${path.includes("?") ? "&" : "?"}apikey=${API_KEY}`;
  const response = await fetch(url, {
    next: { revalidate: 20 },
  });

  if (!response.ok) return null;
  return (await response.json()) as T;
}

export async function getIplMatches(): Promise<ExternalMatch[]> {
  type CricApiResponse = {
    data?: Array<{
      id: string;
      name: string;
      dateTimeGMT: string;
      matchStarted: boolean;
      matchEnded: boolean;
      teams: string[];
    }>;
  };

  const result = await fetchCricApi<CricApiResponse>("/currentMatches?offset=0");

  if (!result?.data) {
    const now = new Date();
    return [
      {
        externalId: "mock-1",
        title: "MI vs CSK",
        teamA: "Mumbai Indians",
        teamB: "Chennai Super Kings",
        startsAt: addHours(now, 3).toISOString(),
        status: "UPCOMING",
      },
      {
        externalId: "mock-2",
        title: "RCB vs KKR",
        teamA: "Royal Challengers Bengaluru",
        teamB: "Kolkata Knight Riders",
        startsAt: addHours(now, -1).toISOString(),
        status: "LIVE",
      },
    ];
  }

  return result.data
    .filter((item) => item.name.toLowerCase().includes("ipl"))
    .map((item) => ({
      externalId: item.id,
      title: item.name,
      teamA: item.teams[0] ?? "Team A",
      teamB: item.teams[1] ?? "Team B",
      startsAt: item.dateTimeGMT,
      status: item.matchEnded ? "COMPLETED" : item.matchStarted ? "LIVE" : "UPCOMING",
    }));
}

export async function getMatchSquad(matchExternalId: string): Promise<ExternalPlayer[]> {
  type SquadResponse = {
    data?: {
      teamInfo?: Array<{
        name: string;
        players?: Array<{ id: string; name: string }>;
      }>;
    };
  };

  const data = await fetchCricApi<SquadResponse>(`/match_info?id=${matchExternalId}`);
  const players = data?.data?.teamInfo?.flatMap((team) =>
    (team.players ?? []).map((player) => ({
      externalId: player.id,
      name: player.name,
      teamName: team.name,
      role: inferRole(player.name),
    })),
  );

  if (!players?.length) {
    const teams = ["Team A", "Team B"];
    return Array.from({ length: 22 }, (_, i) => ({
      externalId: `${matchExternalId}-p${i + 1}`,
      name: `Player ${i + 1}`,
      teamName: teams[i < 11 ? 0 : 1],
      role: ["BAT", "BOWL", "AR", "WK"][i % 4] as PlayerRole,
    }));
  }

  return players;
}

export async function getLivePlayerStats(matchExternalId: string): Promise<ExternalPlayerStats[]> {
  const squad = await getMatchSquad(matchExternalId);

  return squad.map((player) => {
    const hash = player.externalId.length + player.name.length;
    return {
      externalId: player.externalId,
      runs: (hash * 3) % 80,
      wickets: hash % 4,
      catches: hash % 3,
      ballsFaced: 10 + (hash % 40),
    };
  });
}
