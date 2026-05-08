import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { type = 'like' } = body;

    // Check if reaction already exists
    const { data: existing } = await supabaseAdmin
      .from('PostReaction')
      .select('id')
      .eq('postId', postId)
      .eq('userId', userId)
      .eq('type', type)
      .maybeSingle();

    if (existing) {
      // Remove reaction (toggle off)
      await supabaseAdmin
        .from('PostReaction')
        .delete()
        .eq('id', existing.id);
      
      return NextResponse.json({ action: 'removed' });
    } else {
      // Add reaction
      await supabaseAdmin
        .from('PostReaction')
        .insert({
          id: uuidv4(),
          postId,
          userId,
          type,
          createdAt: new Date().toISOString()
        });
      
      return NextResponse.json({ action: 'added' });
    }
  } catch (error: any) {
    console.error("Reaction POST error:", error);
    return NextResponse.json(
      { error: "Failed to process reaction", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any).id : null;

    const [
      { count: likesCount, error: countError },
      { data: userReaction, error: reactionError }
    ] = await Promise.all([
      supabaseAdmin
        .from('PostReaction')
        .select('*', { count: 'exact', head: true })
        .eq('postId', postId)
        .eq('type', 'like'),
      userId 
        ? supabaseAdmin
            .from('PostReaction')
            .select('id')
            .eq('postId', postId)
            .eq('userId', userId)
            .eq('type', 'like')
            .maybeSingle()
        : Promise.resolve({ data: null, error: null })
    ]);

    if (countError) throw countError;

    return NextResponse.json({
      likesCount: likesCount || 0,
      isLiked: !!userReaction
    });
  } catch (error: any) {
    console.error("Reaction GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reactions" },
      { status: 500 }
    );
  }
}
