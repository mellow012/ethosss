import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { subMonths, startOfMonth, format } from 'date-fns'

export async function GET() {
  try {
    // Last 6 months labels
    const months = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), i)
      return {
        label: format(date, 'MMM'),
        start: startOfMonth(date),
        end: i === 0 ? new Date() : startOfMonth(subMonths(new Date(), i - 1))
      }
    }).reverse()

    // Fetch monthly data for users and posts
    const analyticsData = await Promise.all(months.map(async (month) => {
      const [userCount, postCount] = await Promise.all([
        db.user.count({
          where: {
            createdAt: {
              gte: month.start,
              lt: month.end
            }
          }
        }),
        db.post.count({
          where: {
            createdAt: {
              gte: month.start,
              lt: month.end
            }
          }
        })
      ])
      return {
        name: month.label,
        users: userCount,
        posts: postCount
      }
    }))

    // Fetch competition distribution
    const competitions = await db.competition.findMany({
      select: {
        title: true,
        _count: {
          select: { entries: true }
        }
      },
      take: 5,
      orderBy: {
        entries: { _count: 'desc' }
      }
    })

    const competitionData = competitions.map(c => ({
      name: c.title.length > 15 ? c.title.substring(0, 15) + '...' : c.title,
      value: c._count.entries
    }))

    return NextResponse.json({
      growth: analyticsData,
      competitions: competitionData
    })
  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
