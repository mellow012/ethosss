import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
    }

    const { data: user, error } = await supabaseAdmin
      .from('User')
      .select('id, email, name, image, role, bio, isVerified, createdAt, updatedAt')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
    }

    const body = await request.json();
    const { name, bio, image } = body;

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (image !== undefined) updateData.image = image;

    const { data: user, error } = await supabaseAdmin
      .from('User')
      .update(updateData)
      .eq('id', userId)
      .select('id, email, name, image, role, bio, isVerified, createdAt, updatedAt')
      .single();

    if (error) throw error;

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Profile PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update profile", details: error.message },
      { status: 500 }
    );
  }
}
