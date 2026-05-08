import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ registered: false });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const all = searchParams.get("all") === "true";
    const isAdmin = (session.user as any).role === "admin";

    if (eventId) {
      const { data, error } = await supabaseAdmin
        .from('EventRegistration')
        .select('id')
        .eq('eventId', eventId)
        .eq('userId', (session.user as any).id)
        .single();

      return NextResponse.json({ registered: !!data });
    }

    // Admin can fetch all registrations
    let query = supabaseAdmin
      .from('EventRegistration')
      .select(`
        *,
        event:Event(*),
        user:User(id, name, email, image)
      `);

    if (!all || !isAdmin) {
      query = query.eq('userId', (session.user as any).id);
    }

    const { data, error } = await query.order('createdAt', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ bookings: data });
  } catch (error: any) {
    return NextResponse.json({ registered: false });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, fullName, email, phone, notes } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    // Check if already registered
    const { data: existing } = await supabaseAdmin
      .from('EventRegistration')
      .select('id')
      .eq('eventId', eventId)
      .eq('userId', (session.user as any).id)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Already registered for this event" }, { status: 400 });
    }

    const { data: registration, error } = await supabaseAdmin
      .from('EventRegistration')
      .insert({
        id: uuidv4(),
        eventId,
        userId: (session.user as any).id,
        fullName,
        email,
        phone,
        notes,
        status: 'registered',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ registration });
  } catch (error: any) {
    console.error("Event registration error:", error);
    return NextResponse.json(
      { error: "Failed to book spot", details: error.message },
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

    const { eventId } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('EventRegistration')
      .delete()
      .eq('eventId', eventId)
      .eq('userId', (session.user as any).id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to cancel booking", details: error.message },
      { status: 500 }
    );
  }
}
