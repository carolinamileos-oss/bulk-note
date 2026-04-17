import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await prisma.mealPlanItem.create({
    data: {
      planId: body.planId,
      recipeId: body.recipeId,
      date: new Date(body.date),
      mealType: body.mealType,
      servings: body.servings ?? 1,
    },
    include: { recipe: { include: { ingredients: { include: { ingredient: true } } } } }
  })
  return NextResponse.json(item, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
  await prisma.mealPlanItem.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
  const body = await req.json()
  const item = await prisma.mealPlanItem.update({
    where: { id },
    data: { servings: body.servings },
  })
  return NextResponse.json(item)
}
