import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const featured = searchParams.get("featured");
    const region = searchParams.get("region");
    const ecoRating = searchParams.get("ecoRating");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;
    
    let query = supabaseAdmin
      .from('Hotel')
      .select('*, reviews:HotelReview(count)', { count: 'exact' });

    if (featured !== null) {
      query = query.eq('featured', featured === "true");
    }

    if (region) {
      query = query.eq('region', region);
    }

    if (ecoRating) {
      query = query.eq('ecoRating', parseInt(ecoRating));
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,description.ilike.%${search}%,shortDesc.ilike.%${search}%`);
    }

    const { data: hotels, count: total, error } = await query
      .order('createdAt', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw error;

    // Fetch average ratings
    const hotelIds = hotels.map((h: any) => h.id);
    const { data: reviews, error: reviewError } = await supabaseAdmin
      .from('HotelReview')
      .select('hotelId, rating')
      .in('hotelId', hotelIds);

    if (reviewError) throw reviewError;

    const ratingsMap = new Map();
    reviews?.forEach(r => {
      const current = ratingsMap.get(r.hotelId) || { sum: 0, count: 0 };
      ratingsMap.set(r.hotelId, { sum: current.sum + r.rating, count: current.count + 1 });
    });

    const hotelsWithAvg = hotels.map((hotel: any) => {
      const ratingInfo = ratingsMap.get(hotel.id);
      return {
        ...hotel,
        _count: { reviews: hotel.reviews?.[0]?.count || 0 },
        averageRating: ratingInfo 
          ? Math.round((ratingInfo.sum / ratingInfo.count) * 10) / 10 
          : null,
      };
    });

    return NextResponse.json({
      hotels: hotelsWithAvg,
      pagination: {
        page,
        limit,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / limit),
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

    const { data: hotel, error } = await supabaseAdmin
      .from('Hotel')
      .insert({
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
      })
      .select()
      .single();

    if (error) throw error;

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
      .from('Hotel')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: "Hotel deleted successfully" });
  } catch (error: any) {
    console.error("Hotels DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete hotel", details: error.message },
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

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (shortDesc !== undefined) updateData.shortDesc = shortDesc;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (gallery !== undefined) updateData.gallery = JSON.stringify(gallery);
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (region !== undefined) updateData.region = region;
    if (postcode !== undefined) updateData.postcode = postcode;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (ecoRating !== undefined) updateData.ecoRating = ecoRating;
    if (priceRange !== undefined) updateData.priceRange = priceRange;
    if (amenities !== undefined) updateData.amenities = JSON.stringify(amenities);
    if (website !== undefined) updateData.website = website;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (featured !== undefined) updateData.featured = featured;
    if (verified !== undefined) updateData.verified = verified;

    const { data: hotel, error } = await supabaseAdmin
      .from('Hotel')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ hotel });
  } catch (error: any) {
    console.error("Hotels PUT error:", error);
    if (error?.code === "23505") { // Supabase unique violation
      return NextResponse.json(
        { error: "A hotel with this slug already exists" },
        { status: 409 }
      );
    }
    if (error?.code === "P2025" || error?.message?.includes("No rows found")) {
      return NextResponse.json(
        { error: "Hotel not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update hotel", details: error.message },
      { status: 500 }
    );
  }
}
