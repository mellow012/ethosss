import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    const { data: sites, error } = await supabaseAdmin
      .from('PlantingSite')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;

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
      image,
    } = body;

    if (!name || !region || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Name, region, latitude, and longitude are required" },
        { status: 400 }
      );
    }

    const { data: site, error } = await supabaseAdmin
      .from('PlantingSite')
      .insert({
        id: uuidv4(),
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
        image: image || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ site }, { status: 201 });
  } catch (error: any) {
    console.error("PlantingSites POST error:", error);
    return NextResponse.json(
      { error: "Failed to create planting site", details: error.message },
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
      image,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (region !== undefined) updateData.region = region;
    if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
    if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
    if (treesPlanted !== undefined) updateData.treesPlanted = parseInt(treesPlanted);
    if (species !== undefined) updateData.species = JSON.stringify(species);
    if (dateStarted !== undefined) updateData.dateStarted = dateStarted;
    if (status !== undefined) updateData.status = status;
    if (description !== undefined) updateData.description = description;
    if (area !== undefined) updateData.area = area;
    if (image !== undefined) updateData.image = image;
    updateData.updatedAt = new Date().toISOString();

    const { data: site, error } = await supabaseAdmin
      .from('PlantingSite')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ site });
  } catch (error: any) {
    console.error("PlantingSites PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update planting site", details: error.message },
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

    const { error } = await supabaseAdmin
      .from('PlantingSite')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: "Site deleted successfully" });
  } catch (error: any) {
    console.error("PlantingSites DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete planting site", details: error.message },
      { status: 500 }
    );
  }
}
