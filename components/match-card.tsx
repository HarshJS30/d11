import Link from "next/link";

type Match = {
  id: string;
  title: string;
  teamA: string;
  teamB: string;
  startsAt: string;
  status: string;
  contest: { id: string } | null;
};

export function MatchCard({ match }: { match: Match }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-indigo-300">{match.status}</p>
        <time className="text-xs text-slate-400">
          {new Date(match.startsAt).toLocaleString()}
        </time>
      </div>

      <h2 className="mt-3 text-lg font-semibold">{match.title}</h2>
      <p className="mt-1 text-sm text-slate-400">
        {match.teamA} vs {match.teamB}
      </p>

      {match.contest ? (
        <Link
          href={`/match/${match.id}?contestId=${match.contest.id}`}
          className="mt-4 inline-flex rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
        >
          Join Contest
        </Link>
      ) : null}
    </article>
  );
}
