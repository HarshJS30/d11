import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIplMatches } from "@/lib/cricket-api";

export async function GET() {
  const matches = await getIplMatches();

  await prisma.$transaction(
    matches.map((match) =>
      prisma.match.upsert({
        where: { externalId: match.externalId },
        update: {
          title: match.title,
          teamA: match.teamA,
          teamB: match.teamB,
          startsAt: new Date(match.startsAt),
          status: match.status,
        },
        create: {
          externalId: match.externalId,
          title: match.title,
          teamA: match.teamA,
          teamB: match.teamB,
          startsAt: new Date(match.startsAt),
          status: match.status,
          contest: { create: {} },
        },
      }),
    ),
  );

  const dbMatches = await prisma.match.findMany({
    include: { contest: true },
    orderBy: { startsAt: "asc" },
  });

  return NextResponse.json(dbMatches);
}
