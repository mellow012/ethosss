import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET all rounds for a competition
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rounds = await db.competitionRound.findMany({
      where: { competitionId: id },
      orderBy: { roundNumber: "asc" },
    });

    return NextResponse.json({ rounds });
  } catch (error: any) {
    console.error("Rounds GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rounds", details: error.message },
      { status: 500 }
    );
  }
}

// POST create a new round
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, objective, isFinal, startDate, endDate } = body;

    // Get next round number
    const lastRound = await db.competitionRound.findFirst({
      where: { competitionId: id },
      orderBy: { roundNumber: "desc" },
    });
    const nextRoundNumber = (lastRound?.roundNumber || 0) + 1;

    const round = await db.competitionRound.create({
      data: {
        competitionId: id,
        roundNumber: nextRoundNumber,
        title: title || `Round ${nextRoundNumber}`,
        description,
        objective,
        isFinal: isFinal || false,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: nextRoundNumber === 1 ? "active" : "upcoming",
      },
    });

    // Update competition totalRounds
    await db.competition.update({
      where: { id },
      data: { totalRounds: nextRoundNumber },
    });

    return NextResponse.json({ round }, { status: 201 });
  } catch (error: any) {
    console.error("Rounds POST error:", error);
    return NextResponse.json(
      { error: "Failed to create round", details: error.message },
      { status: 500 }
    );
  }
}
