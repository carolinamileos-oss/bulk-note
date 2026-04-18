export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const favorite = searchParams.get('favorite')
  const search = searchParams.get('search')

  const where: Record<string, unknown> = {}
  if (category) where.category = category
  if (favorite === 'true') where.isFavorite = true
  if (search) where.name = { contains: search }

  const recipes = await prisma.recipe.findMany({
    where,
    include: { ingredients: { include: { ingredient: true } } },
    orderBy: [{ isFavorite: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(recipes)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { ingredients, ...recipeData } = body

  const recipe = await prisma.recipe.create({
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
  return NextResponse.json(recipe, { status: 201 })
}
