import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const featured = searchParams.get("featured");
    const region = searchParams.get("region");
    const ecoRating = searchParams.get("ecoRating");
    const search = searchParams.get("search");

    const where: any = {};

    if (featured !== null) {
      where.featured = featured === "true";
    }

    if (region) {
      where.region = region;
    }

    if (ecoRating) {
      where.ecoRating = parseInt(ecoRating);
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { city: { contains: search } },
        { description: { contains: search } },
        { shortDesc: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    const [hotels, total] = await Promise.all([
      db.hotel.findMany({
        where,
        include: {
          _count: {
            select: { reviews: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.hotel.count({ where }),
    ]);

    // Calculate average rating for each hotel
    const hotelsWithAvg = await Promise.all(
      hotels.map(async (hotel) => {
        const avgResult = await db.hotelReview.aggregate({
          where: { hotelId: hotel.id },
          _avg: { rating: true },
        });
        return {
          ...hotel,
          averageRating: avgResult._avg.rating
            ? Math.round(avgResult._avg.rating * 10) / 10
            : null,
        };
      })
    );

    return NextResponse.json({
      hotels: hotelsWithAvg,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Hotels GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch hotels", details: error.message },
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
      slug,
      description,
      shortDesc,
      coverImage,
      gallery,
      address,
      city,
      region,
      postcode,
      latitude,
      longitude,
      ecoRating,
      priceRange,
      amenities,
      website,
      phone,
      email,
      featured,
      verified,
    } = body;

    if (!name || !slug || !description || !address || !city || !region) {
      return NextResponse.json(
        { error: "Name, slug, description, address, city, and region are required" },
        { status: 400 }
      );
    }

    const hotel = await db.hotel.create({
      data: {
        name,
        slug,
        description,
        shortDesc,
        coverImage,
        gallery: gallery ? JSON.stringify(gallery) : "[]",
        address,
        city,
        region,
        postcode,
        latitude,
        longitude,
        ecoRating: ecoRating ?? 3,
        priceRange: priceRange ?? "££",
        amenities: amenities ? JSON.stringify(amenities) : "[]",
        website,
        phone,
        email,
        featured: featured ?? false,
        verified: verified ?? false,
      },
    });

    return NextResponse.json({ hotel }, { status: 201 });
  } catch (error: any) {
    console.error("Hotels POST error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A hotel with this slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create hotel", details: error.message },
      { status: 500 }
    );
  }
}
