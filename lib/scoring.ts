import type { ExternalPlayerStats } from "@/types";

const POINTS = {
  run: 1,
  wicket: 25,
  catch: 8,
  strikeRateBonus: 6,
  strikeRatePenalty: -4,
} as const;

export function calculateBasePoints(stats: ExternalPlayerStats) {
  const base =
    stats.runs * POINTS.run +
    stats.wickets * POINTS.wicket +
    stats.catches * POINTS.catch;

  if (!stats.ballsFaced || stats.ballsFaced < 10) return base;

  const strikeRate = (stats.runs / stats.ballsFaced) * 100;

  if (strikeRate >= 150) return base + POINTS.strikeRateBonus;
  if (strikeRate < 90) return base + POINTS.strikeRatePenalty;
  return base;
}

export function applyCaptainMultiplier(
  basePoints: number,
  multiplier: "CAPTAIN" | "VICE_CAPTAIN" | "NONE",
) {
  if (multiplier === "CAPTAIN") return basePoints * 2;
  if (multiplier === "VICE_CAPTAIN") return basePoints * 1.5;
  return basePoints;
}
