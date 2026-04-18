export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const lists = await prisma.shoppingList.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(lists)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  // If planId provided, auto-generate from plan
  if (body.planId) {
    const plan = await prisma.mealPlan.findUnique({
      where: { id: body.planId },
      include: {
        items: {
          include: {
            recipe: {
              include: { ingredients: { include: { ingredient: true } } }
            }
          }
        }
      }
    })
    if (!plan) return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 })

    // Aggregate ingredients
    const ingredientMap: Record<string, {
      name: string; ingredientId: string; quantity: number; unit: string
      estimatedCost: number; category: string; usedInCount: number
    }> = {}

    for (const item of plan.items) {
      const servingFactor = item.servings / item.recipe.servings
      for (const ri of item.recipe.ingredients) {
        const key = ri.ingredientId
        const neededQty = ri.quantity * servingFactor
        const cost = ri.ingredient.costPer * neededQty
        if (ingredientMap[key]) {
          ingredientMap[key].quantity += neededQty
          ingredientMap[key].estimatedCost += cost
          ingredientMap[key].usedInCount += 1
        } else {
          ingredientMap[key] = {
            name: ri.ingredient.name,
            ingredientId: ri.ingredientId,
            quantity: neededQty,
            unit: ri.unit,
            estimatedCost: cost,
            category: ri.ingredient.category ?? 'Outros',
            usedInCount: 1,
          }
        }
      }
    }

    const list = await prisma.shoppingList.create({
      data: {
        name: body.name ?? `Compras — ${plan.name}`,
        planId: body.planId,
        items: {
          create: Object.values(ingredientMap).map(item => ({
            ...item,
            quantity: Math.ceil(item.quantity * 10) / 10,
            estimatedCost: Math.round(item.estimatedCost * 100) / 100,
          }))
        }
      },
      include: { items: true }
    })
    return NextResponse.json(list, { status: 201 })
  }

  // Manual creation
  const list = await prisma.shoppingList.create({
    data: { name: body.name, items: { create: body.items ?? [] } },
    include: { items: true }
  })
  return NextResponse.json(list, { status: 201 })
}
