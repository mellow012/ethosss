import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competitionId = searchParams.get("competitionId");
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "500");

    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === "admin";
    const currentUserId = (session?.user as any)?.id;

    if (!competitionId && !userId && !isAdmin) {
      return NextResponse.json(
        { error: "competitionId or userId is required" },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('CompetitionEntry')
      .select(`
        *,
        user:User(id, name, email, image),
        competition:Competition(id, title, prize)
      `);

    if (competitionId) {
      query = query.eq('competitionId', competitionId);
    }

    // Filter by userId if provided
    if (userId) {
      // Only allow users to see their own entries, or admin to see any
      if (isAdmin || userId === currentUserId) {
        query = query.eq('userId', userId);
      } else {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Non-admins only see approved or their own entries
    if (!isAdmin && !userId) {
      query = query.in('status', ["approved", "winner"]);
    }

    const { data: entries, error } = await query
      .order('submittedAt', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({ entries });
  } catch (error: any) {
    console.error("Entries GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch entries", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { competitionId, content, imageUrl } = body;

    if (!competitionId || !content) {
      return NextResponse.json(
        { error: "competitionId and content are required" },
        { status: 400 }
      );
    }

    const currentUserId = (session.user as any).id;

    // Verify competition exists and is active
    const { data: competition, error: compError } = await supabaseAdmin
      .from('Competition')
      .select('*')
      .eq('id', competitionId)
      .single();

    if (compError || !competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 });
    }

    if (!competition.isActive) {
      return NextResponse.json({ error: "Competition is no longer active" }, { status: 400 });
    }

    // Check dates
    const now = new Date();
    if (now > new Date(competition.endDate)) {
      return NextResponse.json({ error: "Competition has ended" }, { status: 400 });
    }

    // Check max entries
    if (competition.maxEntries) {
      const { count, error: countError } = await supabaseAdmin
        .from('CompetitionEntry')
        .select('*', { count: 'exact', head: true })
        .eq('competitionId', competitionId)
        .eq('userId', currentUserId);
      
      if (countError) throw countError;
      if (count && count >= competition.maxEntries) {
        return NextResponse.json(
          { error: `Maximum of ${competition.maxEntries} entries allowed` },
          { status: 400 }
        );
      }
    }

    // Create entry
    const { data: entry, error: insertError } = await supabaseAdmin
      .from('CompetitionEntry')
      .insert({
        id: uuidv4(),
        competitionId,
        userId: currentUserId,
        content,
        imageUrl,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select(`
        *,
        user:User(id, name, email, image)
      `)
      .single();

    if (insertError) throw insertError;

    // Automatic Winner Logic
    if (competition.conditionType === 'entry_count' && competition.conditionValue) {
      const threshold = parseInt(competition.conditionValue);
      const { count: currentCount } = await supabaseAdmin
        .from('CompetitionEntry')
        .select('*', { count: 'exact', head: true })
        .eq('competitionId', competitionId);
      
      if (currentCount && currentCount >= threshold) {
        const { data: allEntries } = await supabaseAdmin
          .from('CompetitionEntry')
          .select('id, userId')
          .eq('competitionId', competitionId);
        
        if (allEntries && allEntries.length > 0) {
          const winnerEntry = allEntries[Math.floor(Math.random() * allEntries.length)];
          
          await Promise.all([
            supabaseAdmin.from('CompetitionEntry').update({ status: 'winner' }).eq('id', winnerEntry.id),
            supabaseAdmin.from('Competition').update({ isActive: false, winnerId: winnerEntry.userId }).eq('id', competitionId)
          ]);
        }
      }
    }

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error: any) {
    console.error("Entries POST error:", error);
    return NextResponse.json(
      { error: "Failed to create entry", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Entry id and status are required" }, { status: 400 });
    }

    const { data: entry, error } = await supabaseAdmin
      .from('CompetitionEntry')
      .update({
        status,
        reviewedAt: new Date().toISOString(),
        reviewedBy: (session.user as any).id,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        user:User(id, name, email, image)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ entry });
  } catch (error: any) {
    console.error("Entries PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update entry", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const { data: entry, error: fetchError } = await supabaseAdmin
      .from('CompetitionEntry')
      .select('userId, status')
      .eq('id', id)
      .single();

    if (fetchError || !entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const userRole = (session.user as any).role;
    const currentUserId = (session.user as any).id;

    if (userRole !== "admin" && entry.userId !== currentUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (entry.status === "winner") {
      return NextResponse.json({ error: "Cannot delete winner entries" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('CompetitionEntry')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: "Entry deleted successfully" });
  } catch (error: any) {
    console.error("Entries DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete entry", details: error.message },
      { status: 500 }
    );
  }
}
