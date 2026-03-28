"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TEAM_RULES } from "@/lib/validation";

type Player = {
  externalId: string;
  name: string;
  teamName: string;
  role: "BAT" | "BOWL" | "AR" | "WK";
};

export function TeamBuilder({
  players,
  contestId,
  matchExternalId,
}: {
  players: Player[];
  contestId: string;
  matchExternalId: string;
}) {
  const router = useRouter();
  const [participant, setParticipant] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [captain, setCaptain] = useState<string>("");
  const [viceCaptain, setViceCaptain] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const selectedPlayers = useMemo(
    () => players.filter((player) => selected.includes(player.externalId)),
    [players, selected],
  );

  const byRole = useMemo(() => {
    return selectedPlayers.reduce(
      (acc, player) => {
        acc[player.role] += 1;
        return acc;
      },
      { BAT: 0, BOWL: 0, AR: 0, WK: 0 },
    );
  }, [selectedPlayers]);

  function togglePlayer(playerId: string) {
    setSelected((prev) => {
      if (prev.includes(playerId)) return prev.filter((id) => id !== playerId);
      if (prev.length >= TEAM_RULES.totalPlayers) return prev;
      return [...prev, playerId];
    });
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");

    const response = await fetch(`/api/contests/${contestId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participant,
        matchExternalId,
        playerExternalIds: selected,
        captainExternalId: captain,
        viceCaptainExternalId: viceCaptain,
      }),
    });

    setLoading(false);

    if (!response.ok) {
      const body = (await response.json()) as { message?: string };
      setError(body.message ?? "Unable to join contest.");
      return;
    }

    router.push(`/contest/${contestId}`);
  }

  return (
    <section className="grid gap-4 md:grid-cols-[2fr_1fr]">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="font-semibold">Choose 11 Players</h2>
        <p className="mt-1 text-xs text-slate-400">Max 7 from one team, role balanced squad.</p>

        <div className="mt-4 grid gap-2">
          {players.map((player) => {
            const isSelected = selected.includes(player.externalId);
            return (
              <button
                key={player.externalId}
                type="button"
                onClick={() => togglePlayer(player.externalId)}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-slate-700 bg-slate-950 hover:border-slate-500"
                }`}
              >
                <span>
                  {player.name} <span className="text-xs text-slate-500">({player.teamName})</span>
                </span>
                <span className="rounded-md bg-slate-800 px-2 py-1 text-xs">{player.role}</span>
              </button>
            );
          })}
        </div>
      </div>

      <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h3 className="font-semibold">Finalize Team</h3>
        <div className="mt-4 space-y-3 text-sm">
          <input
            value={participant}
            onChange={(event) => setParticipant(event.target.value)}
            placeholder="Enter your name"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-indigo-500 focus:ring"
          />
          <p className="text-xs text-slate-400">Selected: {selected.length}/11</p>
          <p className="text-xs text-slate-400">
            BAT {byRole.BAT} · BOWL {byRole.BOWL} · AR {byRole.AR} · WK {byRole.WK}
          </p>

          <select
            value={captain}
            onChange={(event) => setCaptain(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
          >
            <option value="">Select Captain (2x)</option>
            {selectedPlayers.map((player) => (
              <option key={player.externalId} value={player.externalId}>
                {player.name}
              </option>
            ))}
          </select>

          <select
            value={viceCaptain}
            onChange={(event) => setViceCaptain(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
          >
            <option value="">Select Vice Captain (1.5x)</option>
            {selectedPlayers.map((player) => (
              <option key={player.externalId} value={player.externalId}>
                {player.name}
              </option>
            ))}
          </select>

          {error ? <p className="text-xs text-rose-400">{error}</p> : null}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-xl bg-indigo-500 px-4 py-2 font-medium text-white hover:bg-indigo-400 disabled:opacity-60"
          >
            {loading ? "Joining..." : "Join Contest"}
          </button>
        </div>
      </aside>
    </section>
  );
}
