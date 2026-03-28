import { NextResponse } from "next/server";
import { syncMatchesAndContests } from "@/lib/match-sync";

export async function GET() {
  const matches = await syncMatchesAndContests();
  return NextResponse.json(matches);
}
