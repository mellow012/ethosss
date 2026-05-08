import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (id) {
      const { data: story, error } = await supabaseAdmin
        .from('SuccessStory')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return NextResponse.json({ story });
    }

    let query = supabaseAdmin
      .from('SuccessStory')
      .select('*');

    if (featured === "true") {
      query = query.eq('featured', true);
    }

    const { data: stories, error } = await query
      .order('createdAt', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({ stories });
  } catch (error: any) {
    console.error("Success stories GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch success stories", details: error.message },
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
    const { title, businessName, category, impact, description, image, content, featured } = body;

    const { data: story, error } = await supabaseAdmin
      .from('SuccessStory')
      .insert({
        id: uuidv4(),
        title,
        businessName,
        category,
        impact,
        description,
        image,
        content,
        featured: featured ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ story }, { status: 201 });
  } catch (error: any) {
    console.error("Success stories POST error:", error);
    return NextResponse.json(
      { error: "Failed to create success story", details: error.message },
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
    const { id, title, businessName, category, impact, description, image, content, featured } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { data: story, error } = await supabaseAdmin
      .from('SuccessStory')
      .update({
        title,
        businessName,
        category,
        impact,
        description,
        image,
        content,
        featured,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ story });
  } catch (error: any) {
    console.error("Success stories PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update success story", details: error.message },
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

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('SuccessStory')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: "Success story deleted successfully" });
  } catch (error: any) {
    console.error("Success stories DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete success story", details: error.message },
      { status: 500 }
    );
  }
}
