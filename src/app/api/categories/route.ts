import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('Category')
      .select('*, posts:Post(count)')
      .order('name', { ascending: true });

    if (error) throw error;

    const formattedCategories = (categories || []).map(cat => ({
      ...cat,
      _count: {
        posts: cat.posts?.[0]?.count || 0
      }
    }));

    return NextResponse.json({ categories: formattedCategories });
  } catch (error: any) {
    console.error("Categories GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories", details: error.message },
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
    const { name, slug, description } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const { data: category, error } = await supabaseAdmin
      .from('Category')
      .insert({ name, slug, description: description || "" })
      .select('*, posts:Post(count)')
      .single();

    if (error) throw error;

    const formattedCategory = {
      ...category,
      _count: { posts: category.posts?.[0]?.count || 0 }
    };

    return NextResponse.json({ category: formattedCategory }, { status: 201 });
  } catch (error: any) {
    console.error("Categories POST error:", error);
    return NextResponse.json(
      { error: "Failed to create category", details: error.message },
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
    const { id, name, slug, description } = body;

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;

    const { data: category, error } = await supabaseAdmin
      .from('Category')
      .update(updateData)
      .eq('id', id)
      .select('*, posts:Post(count)')
      .single();

    if (error) throw error;

    const formattedCategory = {
      ...category,
      _count: { posts: category.posts?.[0]?.count || 0 }
    };

    return NextResponse.json({ category: formattedCategory });
  } catch (error: any) {
    console.error("Categories PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update category", details: error.message },
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
      .from('Category')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("Categories DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete category", details: error.message },
      { status: 500 }
    );
  }
}
