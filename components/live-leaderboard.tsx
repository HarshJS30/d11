"use client";

import useSWR from "swr";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch leaderboard");
  return (await response.json()) as Array<{
    id: string;
    participant: string;
    totalPoints: number;
    rank: number;
  }>;
};

export function LiveLeaderboard({ contestId }: { contestId: string }) {
  const { data, isLoading } = useSWR(`/api/contests/${contestId}/leaderboard`, fetcher, {
    refreshInterval: 10_000,
  });

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Live Leaderboard</h2>
        <button
          type="button"
          onClick={() => fetch(`/api/contests/${contestId}/score`, { method: "POST" })}
          className="rounded-lg border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800"
        >
          Refresh Scores
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading leaderboard...</p>
      ) : (
        <ul className="space-y-2">
          {data?.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm"
            >
              <span>
                #{row.rank} {row.participant}
              </span>
              <span className="font-semibold text-emerald-300">{row.totalPoints.toFixed(1)} pts</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
