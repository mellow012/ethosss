import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// GET all rounds for a competition
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: rounds, error } = await supabaseAdmin
      .from('CompetitionRound')
      .select('*')
      .eq('competitionId', id)
      .order('roundNumber', { ascending: true });

    if (error) throw error;

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
    const { data: lastRound, error: fetchError } = await supabaseAdmin
      .from('CompetitionRound')
      .select('roundNumber')
      .eq('competitionId', id)
      .order('roundNumber', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) throw fetchError;
    const nextRoundNumber = (lastRound?.roundNumber || 0) + 1;

    const { data: round, error: createError } = await supabaseAdmin
      .from('CompetitionRound')
      .insert({
        competitionId: id,
        roundNumber: nextRoundNumber,
        title: title || `Round ${nextRoundNumber}`,
        description,
        objective,
        isFinal: isFinal || false,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        status: nextRoundNumber === 1 ? "active" : "upcoming",
      })
      .select()
      .single();

    if (createError) throw createError;

    // Update competition totalRounds
    const { error: updateError } = await supabaseAdmin
      .from('Competition')
      .update({ totalRounds: nextRoundNumber })
      .eq('id', id);

    if (updateError) throw updateError;

    return NextResponse.json({ round }, { status: 201 });
  } catch (error: any) {
    console.error("Rounds POST error:", error);
    return NextResponse.json(
      { error: "Failed to create round", details: error.message },
      { status: 500 }
    );
  }
}
