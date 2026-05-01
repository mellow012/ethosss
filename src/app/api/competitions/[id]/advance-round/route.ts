import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * POST /api/competitions/[id]/advance-round
 * 
 * Advances approved entries from the current round to the next round.
 * If the current round is the final round, picks a random winner.
 * 
 * Flow:
 * 1. Admin reviews entries in current round (approve/reject)
 * 2. Admin clicks "Advance Round" 
 * 3. System marks approved entries as "advanced", rejected as "eliminated"
 * 4. If next round is final → random winner from advanced pool
 * 5. Otherwise → advance contestants and activate next round
 */
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

    const competition = await db.competition.findUnique({
      where: { id },
      include: {
        rounds: { orderBy: { roundNumber: "asc" } },
        entries: true,
      },
    });

    if (!competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 });
    }

    if (!competition.isActive) {
      return NextResponse.json({ error: "Competition is no longer active" }, { status: 400 });
    }

    const currentRoundNum = competition.currentRound;
    const currentRound = competition.rounds.find(r => r.roundNumber === currentRoundNum);
    const nextRound = competition.rounds.find(r => r.roundNumber === currentRoundNum + 1);

    // Get approved entries for the current round
    const approvedEntries = competition.entries.filter(
      e => e.round === currentRoundNum && e.status === "approved"
    );
    const pendingEntries = competition.entries.filter(
      e => e.round === currentRoundNum && e.status === "pending"
    );

    if (pendingEntries.length > 0) {
      return NextResponse.json(
        { error: `${pendingEntries.length} entries are still pending review. Please review all entries before advancing.` },
        { status: 400 }
      );
    }

    if (approvedEntries.length === 0) {
      return NextResponse.json(
        { error: "No approved entries to advance" },
        { status: 400 }
      );
    }

    // Check if this is the final round (or the last round configured)
    const isFinalRound = currentRound?.isFinal || !nextRound;

    if (isFinalRound) {
      // === FINAL ROUND: Pick a random winner ===
      const winnerEntry = approvedEntries[Math.floor(Math.random() * approvedEntries.length)];

      await db.$transaction([
        // Mark winner
        db.competitionEntry.update({
          where: { id: winnerEntry.id },
          data: { status: "winner", reviewedAt: new Date() },
        }),
        // Mark others as eliminated
        db.competitionEntry.updateMany({
          where: {
            competitionId: id,
            round: currentRoundNum,
            status: "approved",
            id: { not: winnerEntry.id },
          },
          data: { status: "eliminated" },
        }),
        // Close the competition
        db.competition.update({
          where: { id },
          data: {
            isActive: false,
            winnerId: winnerEntry.userId,
          },
        }),
        // Mark current round as completed
        ...(currentRound ? [
          db.competitionRound.update({
            where: { id: currentRound.id },
            data: { status: "completed" },
          })
        ] : []),
      ]);

      // Fetch winner details
      const winner = await db.user.findUnique({
        where: { id: winnerEntry.userId },
        select: { id: true, name: true, email: true, image: true },
      });

      return NextResponse.json({
        status: "winner_selected",
        winner,
        message: `🎉 Winner selected: ${winner?.name || winner?.email}!`,
      });
    } else {
      // === ADVANCE TO NEXT ROUND ===
      await db.$transaction([
        // Mark approved entries as "advanced"
        db.competitionEntry.updateMany({
          where: {
            competitionId: id,
            round: currentRoundNum,
            status: "approved",
          },
          data: { status: "advanced" },
        }),
        // Mark rejected entries as "eliminated"  
        db.competitionEntry.updateMany({
          where: {
            competitionId: id,
            round: currentRoundNum,
            status: "rejected",
          },
          data: { status: "eliminated" },
        }),
        // Mark current round as completed
        ...(currentRound ? [
          db.competitionRound.update({
            where: { id: currentRound.id },
            data: { status: "completed" },
          })
        ] : []),
        // Activate next round
        db.competitionRound.update({
          where: { id: nextRound.id },
          data: { status: "active" },
        }),
        // Advance competition to next round
        db.competition.update({
          where: { id },
          data: { currentRound: currentRoundNum + 1 },
        }),
      ]);

      return NextResponse.json({
        status: "round_advanced",
        currentRound: currentRoundNum + 1,
        advancedCount: approvedEntries.length,
        message: `${approvedEntries.length} contestant(s) advanced to Round ${currentRoundNum + 1}`,
      });
    }
  } catch (error: any) {
    console.error("Advance round error:", error);
    return NextResponse.json(
      { error: "Failed to advance round", details: error.message },
      { status: 500 }
    );
  }
}
