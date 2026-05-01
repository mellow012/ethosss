import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
    const newsletter = await db.newsletter.upsert({
      where: { email },
      update: { active: true },
      create: { email, active: true },
    });

    return NextResponse.json({ newsletter }, { status: 201 });
  } catch (error: any) {
    console.error("Newsletter POST error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe", details: error.message },
      { status: 500 }
    );
  }
}
