import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const { data: tags, error } = await supabaseAdmin
      .from('Tag')
      .select('*, posts:PostTag(count)')
      .order('name', { ascending: true });

    if (error) throw error;

    const formattedTags = (tags || []).map(tag => ({
      ...tag,
      _count: {
        posts: tag.posts?.[0]?.count || 0
      }
    }));

    return NextResponse.json({ tags: formattedTags });
  } catch (error: any) {
    console.error("Tags GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const { data: tag, error } = await supabaseAdmin
      .from('Tag')
      .insert({ 
        id: uuidv4(), 
        name, 
        slug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select('*, posts:PostTag(count)')
      .single();

    if (error) throw error;

    const formattedTag = {
      ...tag,
      _count: { posts: tag.posts?.[0]?.count || 0 }
    };

    return NextResponse.json({ tag: formattedTag }, { status: 201 });
  } catch (error: any) {
    console.error("Tags POST error:", error);
    return NextResponse.json(
      { error: "Failed to create tag", details: error.message },
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
    const { id, name, slug } = body;

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    updateData.updatedAt = new Date().toISOString();

    const { data: tag, error } = await supabaseAdmin
      .from('Tag')
      .update(updateData)
      .eq('id', id)
      .select('*, posts:PostTag(count)')
      .single();

    if (error) throw error;

    const formattedTag = {
      ...tag,
      _count: { posts: tag.posts?.[0]?.count || 0 }
    };

    return NextResponse.json({ tag: formattedTag });
  } catch (error: any) {
    console.error("Tags PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update tag", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('Tag')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: "Tag deleted successfully" });
  } catch (error: any) {
    console.error("Tags DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete tag", details: error.message },
      { status: 500 }
    );
  }
}
