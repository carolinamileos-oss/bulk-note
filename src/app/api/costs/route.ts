import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { calculateRecipeMacros } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? 'week'

  const daysBack = period === 'month' ? 30 : 7
  const since = new Date()
  since.setDate(since.getDate() - daysBack)

  const history = await prisma.mealHistory.findMany({
    where: { date: { gte: since } },
    include: { recipe: { include: { ingredients: { include: { ingredient: true } } } } },
  })

  const totalCost = history.reduce((acc, h) => {
    const m = calculateRecipeMacros(h.recipe.ingredients)
    return acc + (m.cost / h.recipe.servings) * h.servings
  }, 0)

  const byRecipe: Record<string, { name: string; cost: number; count: number }> = {}
  for (const h of history) {
    const m = calculateRecipeMacros(h.recipe.ingredients)
    const cost = (m.cost / h.recipe.servings) * h.servings
    if (!byRecipe[h.recipeId]) byRecipe[h.recipeId] = { name: h.recipe.name, cost: 0, count: 0 }
    byRecipe[h.recipeId].cost += cost
    byRecipe[h.recipeId].count++
  }

  return NextResponse.json({ totalCost, byRecipe, period, daysBack })
}
