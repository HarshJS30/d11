import { MatchCard } from "@/components/match-card";
import { PageShell } from "@/components/page-shell";

async function getMatches() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/matches`, {
    cache: "no-store",
  });

  if (!response.ok) return [];
  return (await response.json()) as Array<{
    id: string;
    title: string;
    teamA: string;
    teamB: string;
    startsAt: string;
    status: string;
    contest: { id: string } | null;
  }>;
}

export default async function Home() {
  const matches = await getMatches();

  return (
    <PageShell title="IPL Fantasy" subtitle="Pick your XI, assign C/VC, and climb the live leaderboard.">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </section>
    </PageShell>
  );
}
