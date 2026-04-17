import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const recipeId = searchParams.get('recipeId')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const where: Record<string, unknown> = {}
  if (recipeId) where.recipeId = recipeId
  if (from || to) {
    where.date = {}
    if (from) (where.date as Record<string, unknown>).gte = new Date(from)
    if (to) (where.date as Record<string, unknown>).lte = new Date(to)
  }

  const history = await prisma.mealHistory.findMany({
    where,
    include: { recipe: { include: { ingredients: { include: { ingredient: true } } } } },
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(history)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const entry = await prisma.mealHistory.create({
    data: {
      date: new Date(body.date),
      mealType: body.mealType,
      recipeId: body.recipeId,
      servings: body.servings,
      satisfaction: body.satisfaction || null,
      wouldRepeat: body.wouldRepeat ?? null,
      notes: body.notes || null,
    },
    include: { recipe: true },
  })
  return NextResponse.json(entry, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
  await prisma.mealHistory.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
