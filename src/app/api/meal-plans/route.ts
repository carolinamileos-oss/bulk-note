export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const weekStart = searchParams.get('weekStart')

  const where: Record<string, unknown> = {}
  if (weekStart) {
    const start = new Date(weekStart)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    where.weekStart = { gte: start }
    where.weekEnd = { lte: end }
  }

  const plans = await prisma.mealPlan.findMany({
    where,
    include: {
      items: {
        include: {
          recipe: {
            include: { ingredients: { include: { ingredient: true } } }
          }
        },
        orderBy: { date: 'asc' }
      }
    },
    orderBy: { weekStart: 'desc' },
  })
  return NextResponse.json(plans)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const plan = await prisma.mealPlan.create({
    data: {
      name: body.name,
      weekStart: new Date(body.weekStart),
      weekEnd: new Date(body.weekEnd),
      notes: body.notes || null,
    }
  })
  return NextResponse.json(plan, { status: 201 })
}
