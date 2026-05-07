import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === "admin";

    let query = supabaseAdmin
      .from('Comment')
      .select('*, author:User(id, name, email, image)')
      .eq('postId', postId);

    if (!isAdmin) {
      query = query.eq('approved', true);
    }

    const { data: comments, error } = await query.order('createdAt', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error("Comments GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments", details: error.message },
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
    const { content, postId } = body;

    if (!content || !postId) {
      return NextResponse.json(
        { error: "Content and postId are required" },
        { status: 400 }
      );
    }

    // Verify the post exists
    const { data: post, error: postError } = await supabaseAdmin
      .from('Post')
      .select('id')
      .eq('id', postId)
      .single();
    
    if (postError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const { data: comment, error } = await supabaseAdmin
      .from('Comment')
      .insert({
        content,
        authorId: (session.user as any).id,
        postId,
        approved: false,
      })
      .select('*, author:User(id, name, email, image)')
      .single();

    if (error) throw error;

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: any) {
    console.error("Comments POST error:", error);
    return NextResponse.json(
      { error: "Failed to create comment", details: error.message },
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
    const { id, approved } = body;

    if (!id || approved === undefined) {
      return NextResponse.json(
        { error: "Comment id and approved status are required" },
        { status: 400 }
      );
    }

    const { data: comment, error } = await supabaseAdmin
      .from('Comment')
      .update({ approved })
      .eq('id', id)
      .select('*, author:User(id, name, email, image)')
      .single();

    if (error) throw error;

    return NextResponse.json({ comment });
  } catch (error: any) {
    console.error("Comments PUT error:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update comment", details: error.message },
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

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Get the comment to check ownership
    const { data: comment, error: fetchError } = await supabaseAdmin
      .from('Comment')
      .select('id, authorId')
      .eq('id', id)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    const userRole = (session.user as any).role;
    const currentUserId = (session.user as any).id;

    // Allow delete if: admin OR comment author
    if (userRole !== "admin" && comment.authorId !== currentUserId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { error } = await supabaseAdmin
      .from('Comment')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error: any) {
    console.error("Comments DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete comment", details: error.message },
      { status: 500 }
    );
  }
}
