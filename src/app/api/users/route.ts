import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userRole = (session.user as any).role;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    let query = supabaseAdmin
      .from('User')
      .select(`
        id, email, name, image, role, bio, isVerified, createdAt, updatedAt,
        posts:Post(count),
        comments:Comment(count),
        entries:CompetitionEntry(count)
      `, { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, count: total, error } = await query
      .order('createdAt', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw error;

    const formattedUsers = (users || []).map(user => ({
      ...user,
      _count: {
        posts: user.posts?.[0]?.count || 0,
        comments: user.comments?.[0]?.count || 0,
        entries: user.entries?.[0]?.count || 0,
      }
    }));

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error("Users GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users", details: error.message },
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
    const { id, role } = body;

    if (!id || !role) {
      return NextResponse.json(
        { error: "User id and role are required" },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabaseAdmin
      .from('User')
      .update({ role, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select('id, email, name, image, role, bio, isVerified, createdAt, updatedAt')
      .single();

    if (error) throw error;

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Users PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update user", details: error.message },
      { status: 500 }
    );
  }
}
