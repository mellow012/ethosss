import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const upcomingOnly = searchParams.get("upcoming") === "true";

    const where: any = {
      isActive: true,
    };

    if (upcomingOnly) {
      where.date = {
        gte: new Date(),
      };
    }

    const events = await db.event.findMany({
      where,
      orderBy: { date: "asc" },
      take: limit,
    });

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error("Events GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events", details: error.message },
      { status: 500 }
    );
  }
}
