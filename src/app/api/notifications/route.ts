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

    const { data: notifications, error } = await supabaseAdmin
      .from('Notification')
      .select('*')
      .eq('userId', (session.user as any).id)
      .order('createdAt', { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error("Notifications GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
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

    const body = await request.json();
    const { id, all } = body;

    let query = supabaseAdmin
      .from('Notification')
      .update({ isRead: true })
      .eq('userId', (session.user as any).id);

    if (all) {
      // Mark all as read
      const { error } = await query;
      if (error) throw error;
    } else if (id) {
      // Mark specific as read
      const { error } = await query.eq('id', id);
      if (error) throw error;
    } else {
      return NextResponse.json({ error: "ID or all flag required" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Notifications PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // Only allow admin or system (if we had a secret)
    // For now, let's allow admins to send manual notifications
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, title, message, type, link } = body;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: "UserId, Title, and Message are required" },
        { status: 400 }
      );
    }

    const { data: notification, error } = await supabaseAdmin
      .from('Notification')
      .insert({
        id: crypto.randomUUID(),
        userId,
        title,
        message,
        type: type || 'info',
        link,
        isRead: false,
        createdAt: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error: any) {
    console.error("Notifications POST error:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
