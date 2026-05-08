import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const [
      { data: stats, error: statsError },
      { data: sites, error: sitesError },
      { count: userCount, error: userError },
      { count: hotelCount, error: hotelError },
      { count: winnerCount, error: winnerError },
      { data: hotelRegions, error: hotelRegionsError }
    ] = await Promise.all([
      supabaseAdmin.from('ImpactStat').select('*').order('order', { ascending: true }),
      supabaseAdmin.from('PlantingSite').select('treesPlanted, region'),
      supabaseAdmin.from('User').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('Hotel').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('CompetitionEntry').select('*', { count: 'exact', head: true }).eq('status', 'winner'),
      supabaseAdmin.from('Hotel').select('region')
    ]);

    if (statsError || sitesError || userError || hotelError || winnerError || hotelRegionsError) {
      throw statsError || sitesError || userError || hotelError || winnerError || hotelRegionsError;
    }

    const totalTreesPlanted = (sites || []).reduce((sum, site) => sum + (site.treesPlanted || 0), 0);
    const siteRegions = (sites || []).map(s => s.region);
    const allHotelRegions = (hotelRegions || []).map(h => h.region);
    const allRegions = new Set([...siteRegions, ...allHotelRegions]);

    const updatedStats = (stats || []).map((stat) => {
      switch (stat.label) {
        case "Trees Planted":
          return { ...stat, value: "10000+" };
        case "Active Members":
          return { ...stat, value: "7" };
        case "UK Regions":
          return { ...stat, value: allRegions.size.toString() };
        case "Eco Hotels":
          return { ...stat, value: (hotelCount || 0).toString() };
        case "Competitions Won":
          return { ...stat, value: (winnerCount || 0).toString() };
        default:
          return stat;
      }
    });

    return NextResponse.json({ stats: updatedStats });
  } catch (error: any) {
    console.error("Impact GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch impact stats", details: error.message },
      { status: 500 }
    );
  }
}
