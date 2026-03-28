import type { PlayerRole } from "@/types";

export const TEAM_RULES = {
  totalPlayers: 11,
  maxFromSingleTeam: 7,
  minRoleCount: {
    BAT: 3,
    BOWL: 3,
    AR: 1,
    WK: 1,
  } satisfies Record<PlayerRole, number>,
};

export function validateTeamSelection(
  players: Array<{ teamName: string; role: PlayerRole }>,
  captainId?: string,
  viceCaptainId?: string,
) {
  if (players.length !== TEAM_RULES.totalPlayers) {
    return `Select exactly ${TEAM_RULES.totalPlayers} players`;
  }

  const teamCount = new Map<string, number>();
  const roleCount = new Map<PlayerRole, number>();

  for (const player of players) {
    teamCount.set(player.teamName, (teamCount.get(player.teamName) ?? 0) + 1);
    roleCount.set(player.role, (roleCount.get(player.role) ?? 0) + 1);
  }

  for (const [, count] of teamCount) {
    if (count > TEAM_RULES.maxFromSingleTeam) {
      return `Max ${TEAM_RULES.maxFromSingleTeam} players allowed from one team`;
    }
  }

  for (const [role, min] of Object.entries(TEAM_RULES.minRoleCount) as Array<[PlayerRole, number]>) {
    if ((roleCount.get(role) ?? 0) < min) {
      return `At least ${min} ${role} players required`;
    }
  }

  if (!captainId || !viceCaptainId) return "Select both captain and vice-captain";
  if (captainId === viceCaptainId) return "Captain and vice-captain must be different";

  return null;
}
