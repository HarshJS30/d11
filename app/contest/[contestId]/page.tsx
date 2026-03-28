import { LiveLeaderboard } from "@/components/live-leaderboard";
import { PageShell } from "@/components/page-shell";

export default async function ContestPage({
  params,
}: {
  params: Promise<{ contestId: string }>;
}) {
  const { contestId } = await params;

  return (
    <PageShell title="Live Contest" subtitle="Global match leaderboard updates in near real-time.">
      <LiveLeaderboard contestId={contestId} />
    </PageShell>
  );
}
