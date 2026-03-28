import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getMatchSquad } from "@/lib/cricket-api";
import { validateTeamSelection } from "@/lib/validation";

const joinSchema = z.object({
  participant: z.string().min(2).max(30),
  matchExternalId: z.string().min(1),
  captainExternalId: z.string().min(1),
  viceCaptainExternalId: z.string().min(1),
  playerExternalIds: z.array(z.string().min(1)).length(11),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ contestId: string }> },
) {
  const { contestId } = await params;
  const parsed = joinSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;
  const squad = await getMatchSquad(payload.matchExternalId);

  const selectedPlayers = payload.playerExternalIds
    .map((id) => squad.find((player) => player.externalId === id))
    .filter((player): player is NonNullable<typeof player> => Boolean(player));

  const validationError = validateTeamSelection(
    selectedPlayers,
    payload.captainExternalId,
    payload.viceCaptainExternalId,
  );

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const players = await prisma.$transaction(
    selectedPlayers.map((player) =>
      prisma.player.upsert({
        where: { externalId: player.externalId },
        update: {
          name: player.name,
          teamName: player.teamName,
          role: player.role,
        },
        create: {
          externalId: player.externalId,
          name: player.name,
          teamName: player.teamName,
          role: player.role,
        },
      }),
    ),
  );

  const entry = await prisma.contestEntry.create({
    data: {
      contestId,
      participant: payload.participant,
      teamPlayers: {
        create: players.map((player) => ({
          playerId: player.id,
          multiplierRole:
            player.externalId === payload.captainExternalId
              ? "CAPTAIN"
              : player.externalId === payload.viceCaptainExternalId
                ? "VICE_CAPTAIN"
                : "NONE",
        })),
      },
    },
    include: {
      teamPlayers: {
        include: { player: true },
      },
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
