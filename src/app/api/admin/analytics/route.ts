import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { subMonths, startOfMonth, format, endOfMonth } from 'date-fns'

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Last 6 months labels
    const months = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), i)
      return {
        label: format(date, 'MMM'),
        start: startOfMonth(date).toISOString(),
        end: i === 0 ? new Date().toISOString() : startOfMonth(subMonths(new Date(), i - 1)).toISOString()
      }
    }).reverse()

    // Fetch monthly data for users and posts
    const analyticsData = await Promise.all(months.map(async (month) => {
      const [userRes, postRes] = await Promise.all([
        supabaseAdmin
          .from('User')
          .select('*', { count: 'exact', head: true })
          .gte('createdAt', month.start)
          .lt('createdAt', month.end),
        supabaseAdmin
          .from('Post')
          .select('*', { count: 'exact', head: true })
          .gte('createdAt', month.start)
          .lt('createdAt', month.end)
      ])
      
      return {
        name: month.label,
        users: userRes.count || 0,
        posts: postRes.count || 0
      }
    }))

    // Fetch competition distribution (top 5 by entries)
    // Supabase doesn't support easy "count by join" in a single order query without a view
    // So we fetch competitions and their entry counts separately or using a join
    const { data: competitions, error: compError } = await supabaseAdmin
      .from('Competition')
      .select('title, entries:CompetitionEntry(count)')
      .limit(20); // Fetch a few to sort manually

    if (compError) throw compError;

    const competitionData = (competitions || [])
      .map(comp => ({
        name: comp.title.length > 15 ? comp.title.substring(0, 15) + '...' : comp.title,
        value: comp.entries?.[0]?.count || 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return NextResponse.json({
      growth: analyticsData,
      competitions: competitionData
    })
  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
