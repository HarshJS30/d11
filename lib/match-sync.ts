import { prisma } from "@/lib/prisma";
import { getIplMatches } from "@/lib/cricket-api";

export async function syncMatchesAndContests() {
  const matches = await getIplMatches();

  if (matches.length === 0) {
    return prisma.match.findMany({
      include: { contest: true },
      orderBy: { startsAt: "asc" },
    });
  }

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

  return prisma.match.findMany({
    include: { contest: true },
    orderBy: { startsAt: "asc" },
  });
}
