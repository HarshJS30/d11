import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ contestId: string }> },
) {
  const { contestId } = await params;

  const rows = await prisma.contestEntry.findMany({
    where: { contestId },
    orderBy: [{ totalPoints: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      participant: true,
      totalPoints: true,
    },
  });

  return NextResponse.json(
    rows.map((row, index) => ({
      rank: index + 1,
      ...row,
    })),
  );
}
