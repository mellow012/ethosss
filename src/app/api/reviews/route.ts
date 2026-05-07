import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get("hotelId");

    if (!hotelId) {
      return NextResponse.json(
        { error: "hotelId is required" },
        { status: 400 }
      );
    }

    // Verify hotel exists
    const { data: hotel, error: hotelError } = await supabaseAdmin
      .from('Hotel')
      .select('id')
      .eq('id', hotelId)
      .single();

    if (hotelError || !hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    const { data: reviews, error } = await supabaseAdmin
      .from('HotelReview')
      .select('*')
      .eq('hotelId', hotelId)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error("Reviews GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rating, content, authorName, hotelId } = body;

    if (!rating || !authorName || !hotelId) {
      return NextResponse.json(
        { error: "Rating, authorName, and hotelId are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Verify hotel exists
    const { data: hotel, error: hotelError } = await supabaseAdmin
      .from('Hotel')
      .select('id')
      .eq('id', hotelId)
      .single();

    if (hotelError || !hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    const { data: review, error } = await supabaseAdmin
      .from('HotelReview')
      .insert({
        rating,
        content,
        authorName,
        hotelId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    console.error("Reviews POST error:", error);
    return NextResponse.json(
      { error: "Failed to create review", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, rating, content, authorName } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (rating !== undefined) updateData.rating = rating;
    if (content !== undefined) updateData.content = content;
    if (authorName !== undefined) updateData.authorName = authorName;

    const { data: review, error } = await supabaseAdmin
      .from('HotelReview')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ review });
  } catch (error: any) {
    console.error("Reviews PUT error:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update review", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('HotelReview')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (error: any) {
    console.error("Reviews DELETE error:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete review", details: error.message },
      { status: 500 }
    );
  }
}
