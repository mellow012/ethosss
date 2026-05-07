import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const active = searchParams.get("active");

    let query = supabaseAdmin
      .from('Competition')
      .select('*, entries:CompetitionEntry(count)', { count: 'exact' });

    if (active !== null) {
      query = query.eq('isActive', active === "true");
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: competitions, count: total, error } = await query
      .order('createdAt', { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Format the count to match the expected structure if needed
    const formattedCompetitions = (competitions || []).map(comp => ({
      ...comp,
      _count: {
        entries: comp.entries?.[0]?.count || 0
      }
    }));

    return NextResponse.json({
      competitions: formattedCompetitions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil((total || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error("Competitions GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch competitions", details: error.message },
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
    const userRole = (session.user as any).role;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      description,
      rules,
      coverImage,
      prize,
      entryType,
      startDate,
      endDate,
      isActive,
      maxEntries,
      conditionType,
      conditionValue,
      totalRounds,
    } = body;

    if (!title || !slug || !description || !prize || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Title, slug, description, prize, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    const { data: competition, error } = await supabaseAdmin
      .from('Competition')
      .insert({
        id: uuidv4(),
        title,
        slug,
        description,
        rules,
        coverImage,
        prize,
        entryType: entryType ?? "story",
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isActive: isActive ?? true,
        maxEntries,
        conditionType,
        conditionValue,
        totalRounds: totalRounds ?? 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ competition }, { status: 201 });
  } catch (error: any) {
    console.error("Competitions POST error:", error);
    return NextResponse.json(
      { error: "Failed to create competition", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userRole = (session.user as any).role;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      title,
      slug,
      description,
      rules,
      coverImage,
      prize,
      entryType,
      startDate,
      endDate,
      isActive,
      maxEntries,
      conditionType,
      conditionValue,
      totalRounds,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (rules !== undefined) updateData.rules = rules;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (prize !== undefined) updateData.prize = prize;
    if (entryType !== undefined) updateData.entryType = entryType;
    if (startDate !== undefined) updateData.startDate = new Date(startDate).toISOString();
    if (endDate !== undefined) updateData.endDate = new Date(endDate).toISOString();
    if (isActive !== undefined) updateData.isActive = isActive;
    if (maxEntries !== undefined) updateData.maxEntries = maxEntries;
    if (conditionType !== undefined) updateData.conditionType = conditionType;
    if (conditionValue !== undefined) updateData.conditionValue = conditionValue;
    if (totalRounds !== undefined) updateData.totalRounds = totalRounds;
    updateData.updatedAt = new Date().toISOString();

    const { data: competition, error } = await supabaseAdmin
      .from('Competition')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ competition });
  } catch (error: any) {
    console.error("Competitions PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update competition", details: error.message },
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
    const userRole = (session.user as any).role;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('Competition')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: "Competition deleted successfully" });
  } catch (error: any) {
    console.error("Competitions DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete competition", details: error.message },
      { status: 500 }
    );
  }
}
