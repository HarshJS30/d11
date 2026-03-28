import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ contestId: string }> },
) {
  const { contestId } = await params;

  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
    include: {
      match: true,
      entries: {
        include: {
          teamPlayers: {
            include: {
              player: true,
            },
          },
        },
      },
    },
  });

  if (!contest) {
    return NextResponse.json({ message: "Contest not found" }, { status: 404 });
  }

  return NextResponse.json(contest);
}
