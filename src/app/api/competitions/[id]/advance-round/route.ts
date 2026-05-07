import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

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

    const { data: competition, error: compError } = await supabaseAdmin
      .from('Competition')
      .select('*, rounds:CompetitionRound(*), entries:CompetitionEntry(*)')
      .eq('id', id)
      .order('roundNumber', { foreignTable: 'CompetitionRound', ascending: true })
      .single();

    if (compError || !competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 });
    }

    if (!competition.isActive) {
      return NextResponse.json({ error: "Competition is no longer active" }, { status: 400 });
    }

    const currentRoundNum = competition.currentRound;
    const currentRound = competition.rounds.find((r: any) => r.roundNumber === currentRoundNum);
    const nextRound = competition.rounds.find((r: any) => r.roundNumber === currentRoundNum + 1);

    // Get approved entries for the current round
    const approvedEntries = competition.entries.filter(
      (e: any) => e.round === currentRoundNum && e.status === "approved"
    );
    const pendingEntries = competition.entries.filter(
      (e: any) => e.round === currentRoundNum && e.status === "pending"
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

      // Mark winner
      await supabaseAdmin
        .from('CompetitionEntry')
        .update({ status: "winner", reviewedAt: new Date().toISOString() })
        .eq('id', winnerEntry.id);

      // Mark others as eliminated
      await supabaseAdmin
        .from('CompetitionEntry')
        .update({ status: "eliminated" })
        .eq('competitionId', id)
        .eq('round', currentRoundNum)
        .eq('status', 'approved')
        .neq('id', winnerEntry.id);

      // Close the competition
      await supabaseAdmin
        .from('Competition')
        .update({
          isActive: false,
          winnerId: winnerEntry.userId,
        })
        .eq('id', id);

      // Mark current round as completed
      if (currentRound) {
        await supabaseAdmin
          .from('CompetitionRound')
          .update({ status: "completed" })
          .eq('id', currentRound.id);
      }

      // Fetch winner details
      const { data: winner } = await supabaseAdmin
        .from('User')
        .select('id, name, email, image')
        .eq('id', winnerEntry.userId)
        .single();

      return NextResponse.json({
        status: "winner_selected",
        winner,
        message: `🎉 Winner selected: ${winner?.name || winner?.email}!`,
      });
    } else {
      // === ADVANCE TO NEXT ROUND ===
      // Mark approved entries as "advanced"
      await supabaseAdmin
        .from('CompetitionEntry')
        .update({ status: "advanced" })
        .eq('competitionId', id)
        .eq('round', currentRoundNum)
        .eq('status', 'approved');

      // Mark rejected entries as "eliminated"
      await supabaseAdmin
        .from('CompetitionEntry')
        .update({ status: "eliminated" })
        .eq('competitionId', id)
        .eq('round', currentRoundNum)
        .eq('status', 'rejected');

      // Mark current round as completed
      if (currentRound) {
        await supabaseAdmin
          .from('CompetitionRound')
          .update({ status: "completed" })
          .eq('id', currentRound.id);
      }

      // Activate next round
      await supabaseAdmin
        .from('CompetitionRound')
        .update({ status: "active" })
        .eq('id', nextRound.id);

      // Advance competition to next round
      await supabaseAdmin
        .from('Competition')
        .update({ currentRound: currentRoundNum + 1 })
        .eq('id', id);

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
