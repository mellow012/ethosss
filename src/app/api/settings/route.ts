import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('SiteSetting')
      .select('*');

    if (error) throw error;

    const settingsMap = (settings || []).reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    return NextResponse.json({ settings: settingsMap });
  } catch (error: any) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    // Upsert using Supabase
    const { data: setting, error } = await supabaseAdmin
      .from('SiteSetting')
      .upsert({ 
        key, 
        value: String(value),
        updatedAt: new Date().toISOString()
      }, {
        onConflict: 'key'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ setting });
  } catch (error: any) {
    console.error("Settings POST error:", error);
    return NextResponse.json(
      { error: "Failed to update setting", details: error.message },
      { status: 500 }
    );
  }
}
