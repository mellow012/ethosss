import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Upsert: if email already exists and is inactive, reactivate it
    const { data: newsletter, error } = await supabaseAdmin
      .from('Newsletter')
      .upsert({ id: uuidv4(), email, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, { onConflict: 'email' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ newsletter }, { status: 201 });
  } catch (error: any) {
    console.error("Newsletter POST error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe", details: error.message },
      { status: 500 }
    );
  }
}
