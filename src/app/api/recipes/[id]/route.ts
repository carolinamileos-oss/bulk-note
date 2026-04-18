export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const recipe = await prisma.recipe.findUnique({
    where: { id: params.id },
    include: { ingredients: { include: { ingredient: true } }, mealHistory: true },
  })
  if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(recipe)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { ingredients, ...recipeData } = body

  // Delete existing ingredients and recreate
  await prisma.recipeIngredient.deleteMany({ where: { recipeId: params.id } })

  const recipe = await prisma.recipe.update({
    where: { id: params.id },
    data: {
      ...recipeData,
      ingredients: {
        create: ingredients.map((ing: { ingredientId: string; quantity: number; unit: string }) => ({
          ingredientId: ing.ingredientId,
          quantity: ing.quantity,
          unit: ing.unit,
        }))
      }
    },
    include: { ingredients: { include: { ingredient: true } } },
  })
  return NextResponse.json(recipe)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const recipe = await prisma.recipe.update({ where: { id: params.id }, data: body })
  return NextResponse.json(recipe)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.mealHistory.deleteMany({ where: { recipeId: params.id } })
  await prisma.mealPlanItem.deleteMany({ where: { recipeId: params.id } })
  await prisma.recipeIngredient.deleteMany({ where: { recipeId: params.id } })
  await prisma.recipe.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
