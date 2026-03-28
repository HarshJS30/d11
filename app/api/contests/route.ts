import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const contests = await prisma.contest.findMany({
    include: { match: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(contests);
}
