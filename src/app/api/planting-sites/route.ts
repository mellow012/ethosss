import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const sites = await db.plantingSite.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sites });
  } catch (error: any) {
    console.error("PlantingSites GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch planting sites", details: error.message },
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
      name,
      region,
      latitude,
      longitude,
      treesPlanted,
      species,
      dateStarted,
      status,
      description,
      area,
    } = body;

    if (!name || !region || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Name, region, latitude, and longitude are required" },
        { status: 400 }
      );
    }

    const site = await db.plantingSite.create({
      data: {
        name,
        region,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        treesPlanted: parseInt(treesPlanted || "0"),
        species: species ? JSON.stringify(species) : "[]",
        dateStarted: dateStarted || new Date().toISOString().split('T')[0],
        status: status || "active",
        description: description || "",
        area: area || "",
      },
    });

    return NextResponse.json({ site }, { status: 201 });
  } catch (error: any) {
    console.error("PlantingSites POST error:", error);
    return NextResponse.json(
      { error: "Failed to create planting site", details: error.message },
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

    await db.plantingSite.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Site deleted successfully" });
  } catch (error: any) {
    console.error("PlantingSites DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete planting site", details: error.message },
      { status: 500 }
    );
  }
}
