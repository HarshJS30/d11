import { MatchCard } from "@/components/match-card";
import { PageShell } from "@/components/page-shell";
import { syncMatchesAndContests } from "@/lib/match-sync";

export default async function Home() {
  const matches = await syncMatchesAndContests();

  return (
    <PageShell title="IPL Fantasy" subtitle="Pick your XI, assign C/VC, and climb the live leaderboard.">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={{
              ...match,
              startsAt: match.startsAt.toISOString(),
            }}
          />
        ))}
      </section>
    </PageShell>
  );
}
