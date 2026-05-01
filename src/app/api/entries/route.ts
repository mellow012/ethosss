import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competitionId = searchParams.get("competitionId");
    const userId = searchParams.get("userId");

    if (!competitionId) {
      return NextResponse.json(
        { error: "competitionId is required" },
        { status: 400 }
      );
    }

    // Verify competition exists
    const competition = await db.competition.findUnique({
      where: { id: competitionId },
    });
    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      );
    }

    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === "admin";
    const currentUserId = (session?.user as any)?.id;

    const where: any = { competitionId };

    // Filter by userId if provided
    if (userId) {
      // Only allow users to see their own entries, or admin to see any
      if (isAdmin || userId === currentUserId) {
        where.userId = userId;
      } else {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }
    }

    // Non-admins only see approved or their own entries
    if (!isAdmin && !userId) {
      where.status = { in: ["approved", "winner"] };
    }

    const entries = await db.competitionEntry.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ entries });
  } catch (error: any) {
    console.error("Entries GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch entries", details: error.message },
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
    const { competitionId, content, imageUrl } = body;

    if (!competitionId || !content) {
      return NextResponse.json(
        { error: "competitionId and content are required" },
        { status: 400 }
      );
    }

    const currentUserId = (session.user as any).id;

    // Verify competition exists and is active
    const competition = await db.competition.findUnique({
      where: { id: competitionId },
    });

    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      );
    }

    if (!competition.isActive) {
      return NextResponse.json(
        { error: "Competition is no longer active" },
        { status: 400 }
      );
    }

    // Check if competition is still open
    const now = new Date();
    if (now < competition.startDate) {
      return NextResponse.json(
        { error: "Competition has not started yet" },
        { status: 400 }
      );
    }
    if (now > competition.endDate) {
      return NextResponse.json(
        { error: "Competition has ended" },
        { status: 400 }
      );
    }

    // Check max entries limit
    if (competition.maxEntries) {
      const existingCount = await db.competitionEntry.count({
        where: { competitionId, userId: currentUserId },
      });
      if (existingCount >= competition.maxEntries) {
        return NextResponse.json(
          { error: `Maximum of ${competition.maxEntries} entries allowed` },
          { status: 400 }
        );
      }
    }

    const entry = await db.competitionEntry.create({
      data: {
        competitionId,
        userId: currentUserId,
        content,
        imageUrl,
        status: "pending",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error: any) {
    console.error("Entries POST error:", error);
    return NextResponse.json(
      { error: "Failed to create entry", details: error.message },
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
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Entry id and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["pending", "approved", "rejected", "winner"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const entry = await db.competitionEntry.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: (session.user as any).id,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json({ entry });
  } catch (error: any) {
    console.error("Entries PUT error:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Entry not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update entry", details: error.message },
      { status: 500 }
    );
  }
}
