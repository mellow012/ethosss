import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [
      stats,
      totalTrees,
      userCount,
      hotelCount,
      winnerCount,
      uniqueRegionsSite,
      uniqueRegionsHotel
    ] = await Promise.all([
      db.impactStat.findMany({
        orderBy: { order: "asc" },
      }),
      db.plantingSite.aggregate({
        _sum: { treesPlanted: true },
      }),
      db.user.count(),
      db.hotel.count(),
      db.competitionEntry.count({
        where: { status: "winner" },
      }),
      db.plantingSite.groupBy({
        by: ['region'],
      }),
      db.hotel.groupBy({
        by: ['region'],
      }),
    ]);

    const allRegions = new Set([
      ...uniqueRegionsSite.map(r => r.region),
      ...uniqueRegionsHotel.map(r => r.region)
    ]);

    const updatedStats = stats.map((stat) => {
      switch (stat.label) {
        case "Trees Planted":
          return { ...stat, value: (totalTrees._sum.treesPlanted || 0).toString() };
        case "Active Members":
          return { ...stat, value: userCount.toString() };
        case "UK Regions":
          return { ...stat, value: allRegions.size.toString() };
        case "Eco Hotels":
          return { ...stat, value: hotelCount.toString() };
        case "Competitions Won":
          return { ...stat, value: winnerCount.toString() };
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

