import { notFound } from "next/navigation";
import { TeamBuilder } from "@/components/team-builder";
import { PageShell } from "@/components/page-shell";
import { prisma } from "@/lib/prisma";
import { getMatchSquad } from "@/lib/cricket-api";

export default async function MatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ matchId: string }>;
  searchParams: Promise<{ contestId?: string }>;
}) {
  const { matchId } = await params;
  const { contestId } = await searchParams;

  if (!contestId) notFound();

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) notFound();

  const players = await getMatchSquad(match.externalId);

  return (
    <PageShell title="Create Team" subtitle={`${match.title} · Build a balanced 11-player squad`}>
      <TeamBuilder players={players} contestId={contestId} matchExternalId={match.externalId} />
    </PageShell>
  );
}
