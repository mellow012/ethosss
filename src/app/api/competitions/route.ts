import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const active = searchParams.get("active");

    const where: any = {};

    if (active !== null) {
      where.isActive = active === "true";
    }

    const skip = (page - 1) * limit;

    const [competitions, total] = await Promise.all([
      db.competition.findMany({
        where,
        include: {
          _count: {
            select: { entries: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.competition.count({ where }),
    ]);

    return NextResponse.json({
      competitions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Competitions GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch competitions", details: error.message },
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
    const userRole = (session.user as any).role;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      description,
      rules,
      coverImage,
      prize,
      entryType,
      startDate,
      endDate,
      isActive,
      maxEntries,
    } = body;

    if (!title || !slug || !description || !prize || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Title, slug, description, prize, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    const competition = await db.competition.create({
      data: {
        title,
        slug,
        description,
        rules,
        coverImage,
        prize,
        entryType: entryType ?? "story",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive ?? true,
        maxEntries,
      },
    });

    return NextResponse.json({ competition }, { status: 201 });
  } catch (error: any) {
    console.error("Competitions POST error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A competition with this slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create competition", details: error.message },
      { status: 500 }
    );
  }
}
