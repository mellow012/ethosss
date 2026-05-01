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
      conditionType,
      conditionValue,
      totalRounds,
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
        conditionType,
        conditionValue,
        totalRounds: totalRounds ?? 1,
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
    const {
      id,
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
      conditionType,
      conditionValue,
      totalRounds,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (rules !== undefined) updateData.rules = rules;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (prize !== undefined) updateData.prize = prize;
    if (entryType !== undefined) updateData.entryType = entryType;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (maxEntries !== undefined) updateData.maxEntries = maxEntries;
    if (conditionType !== undefined) updateData.conditionType = conditionType;
    if (conditionValue !== undefined) updateData.conditionValue = conditionValue;
    if (totalRounds !== undefined) updateData.totalRounds = totalRounds;

    const competition = await db.competition.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ competition });
  } catch (error: any) {
    console.error("Competitions PUT error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A competition with this slug already exists" },
        { status: 409 }
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update competition", details: error.message },
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
    const userRole = (session.user as any).role;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db.competition.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Competition deleted successfully" });
  } catch (error: any) {
    console.error("Competitions DELETE error:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete competition", details: error.message },
      { status: 500 }
    );
  }
}
