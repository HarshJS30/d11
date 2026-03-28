import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyCaptainMultiplier, calculateBasePoints } from "@/lib/scoring";
import { getLivePlayerStats } from "@/lib/cricket-api";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ contestId: string }> },
) {
  const { contestId } = await params;

  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
    include: {
      match: true,
      entries: {
        include: {
          teamPlayers: {
            include: {
              player: true,
            },
          },
        },
      },
    },
  });

  if (!contest) {
    return NextResponse.json({ message: "Contest not found" }, { status: 404 });
  }

  const stats = await getLivePlayerStats(contest.match.externalId);

  const statMap = new Map(stats.map((item) => [item.externalId, item]));

  for (const entry of contest.entries) {
    let total = 0;

    for (const teamPlayer of entry.teamPlayers) {
      const snapshot = statMap.get(teamPlayer.player.externalId);
      if (!snapshot) continue;

      const base = calculateBasePoints(snapshot);
      const final = applyCaptainMultiplier(base, teamPlayer.multiplierRole);
      total += final;

      await prisma.playerStat.upsert({
        where: {
          playerId_matchId: {
            playerId: teamPlayer.playerId,
            matchId: contest.matchId,
          },
        },
        update: {
          runs: snapshot.runs,
          wickets: snapshot.wickets,
          catches: snapshot.catches,
          ballsFaced: snapshot.ballsFaced,
          points: final,
        },
        create: {
          playerId: teamPlayer.playerId,
          matchId: contest.matchId,
          runs: snapshot.runs,
          wickets: snapshot.wickets,
          catches: snapshot.catches,
          ballsFaced: snapshot.ballsFaced,
          points: final,
        },
      });
    }

    await prisma.contestEntry.update({
      where: { id: entry.id },
      data: { totalPoints: total },
    });
  }

  return NextResponse.json({ message: "Scores updated" });
}
