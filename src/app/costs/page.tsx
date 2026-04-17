import { prisma } from '@/lib/prisma'
import { formatCurrency, calculateRecipeMacros, CATEGORY_LABELS } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CostsCharts } from '@/components/costs/CostsCharts'
import Link from 'next/link'
import { TrendingUp, Award, Zap } from 'lucide-react'

export default async function CostsPage() {
  const recipes = await prisma.recipe.findMany({
    include: { ingredients: { include: { ingredient: true } } },
  })

  const history = await prisma.mealHistory.findMany({
    include: { recipe: { include: { ingredients: { include: { ingredient: true } } } } },
    orderBy: { date: 'desc' },
  })

  // Recipe cost analysis
  const recipeAnalysis = recipes.map(recipe => {
    const macros = calculateRecipeMacros(recipe.ingredients)
    const costPerServing = macros.cost / recipe.servings
    const calPerServing = macros.calories / recipe.servings
    const protPerServing = macros.protein / recipe.servings
    const costPerProtein = protPerServing > 0 ? costPerServing / protPerServing : 999
    const costPerCalorie = calPerServing > 0 ? costPerServing / (calPerServing / 100) : 999
    const timesUsed = history.filter(h => h.recipeId === recipe.id).length
    return {
      id: recipe.id, name: recipe.name, category: recipe.category,
      isFavorite: recipe.isFavorite, worthCost: recipe.worthCost,
      totalCost: macros.cost, costPerServing, calPerServing,
      protPerServing, costPerProtein, costPerCalorie, timesUsed,
      servings: recipe.servings,
    }
  }).sort((a, b) => a.costPerServing - b.costPerServing)

  // Category averages
  const categoryAverages: Record<string, { total: number; count: number }> = {}
  for (const r of recipeAnalysis) {
    if (!categoryAverages[r.category]) categoryAverages[r.category] = { total: 0, count: 0 }
    categoryAverages[r.category].total += r.costPerServing
    categoryAverages[r.category].count++
  }

  // Monthly cost from history (last 30 days)
  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentHistory = history.filter(h => new Date(h.date) >= thirtyDaysAgo)
  const monthCost = recentHistory.reduce((acc, h) => {
    const m = calculateRecipeMacros(h.recipe.ingredients)
    return acc + (m.cost / h.recipe.servings) * h.servings
  }, 0)

  // Weekly cost (last 7 days)
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const weekHistory = history.filter(h => new Date(h.date) >= sevenDaysAgo)
  const weekCost = weekHistory.reduce((acc, h) => {
    const m = calculateRecipeMacros(h.recipe.ingredients)
    return acc + (m.cost / h.recipe.servings) * h.servings
  }, 0)

  const bestValueProtein = [...recipeAnalysis].sort((a, b) => a.costPerProtein - b.costPerProtein)[0]
  const bestValueCalorie = [...recipeAnalysis].sort((a, b) => a.costPerCalorie - b.costPerCalorie)[0]
  const cheapest = recipeAnalysis[0]
  const mostExpensive = [...recipeAnalysis].sort((a, b) => b.costPerServing - a.costPerServing)[0]

  // Chart data
  const costByCategory = Object.entries(categoryAverages).map(([cat, data]) => ({
    name: CATEGORY_LABELS[cat] ?? cat,
    avg: Math.round((data.total / data.count) * 100) / 100,
  }))

  const topCostRecipes = [...recipeAnalysis]
    .sort((a, b) => b.costPerServing - a.costPerServing)
    .slice(0, 6)
    .map(r => ({ name: r.name.split(' ').slice(0,2).join(' '), cost: Math.round(r.costPerServing * 100) / 100 }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Análise de Custos</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Controlo financeiro da tua dieta</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Gasto esta semana</p>
          <p className="text-2xl font-display font-semibold text-sage-600">{formatCurrency(weekCost)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Gasto este mês</p>
          <p className="text-2xl font-display font-semibold text-sage-600">{formatCurrency(monthCost)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Mais barata/porção</p>
          <p className="text-lg font-display font-semibold text-emerald-600">{cheapest ? formatCurrency(cheapest.costPerServing) : '—'}</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{cheapest?.name}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Mais cara/porção</p>
          <p className="text-lg font-display font-semibold text-red-500">{mostExpensive ? formatCurrency(mostExpensive.costPerServing) : '—'}</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{mostExpensive?.name}</p>
        </div>
      </div>

      {/* Best value cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {bestValueProtein && (
          <Card className="card-hover border-emerald-200 bg-emerald-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-emerald-700">
                <Award className="w-4 h-4" /> Melhor custo por proteína
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/recipes/${bestValueProtein.id}`} className="group">
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{bestValueProtein.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(bestValueProtein.costPerProtein)}/g de proteína · {Math.round(bestValueProtein.protPerServing)}g prot/porção
                </p>
              </Link>
            </CardContent>
          </Card>
        )}
        {bestValueCalorie && (
          <Card className="card-hover border-amber-200 bg-amber-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
                <Zap className="w-4 h-4" /> Melhor custo por caloria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/recipes/${bestValueCalorie.id}`} className="group">
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{bestValueCalorie.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(bestValueCalorie.costPerCalorie)}/100 kcal · {Math.round(bestValueCalorie.calPerServing)} kcal/porção
                </p>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts */}
      <CostsCharts costByCategory={costByCategory} topCostRecipes={topCostRecipes} />

      {/* Full recipe table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Comparação por receita
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Receita</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Total</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Por porção</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Kcal/porção</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Prot/porção</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Usos</th>
                </tr>
              </thead>
              <tbody>
                {recipeAnalysis.map((r, i) => (
                  <tr key={r.id} className={`border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${r.isFavorite ? 'bg-pink-50/30' : ''}`}>
                    <td className="py-2.5 px-3">
                      <Link href={`/recipes/${r.id}`} className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                        {r.isFavorite && <span className="text-pink-400 text-xs">❤</span>}
                        {r.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[r.category] ?? r.category}</p>
                    </td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">{formatCurrency(r.totalCost)}</td>
                    <td className="py-2.5 px-3 text-right font-medium">
                      <span className={i === 0 ? 'text-emerald-600' : i === recipeAnalysis.length - 1 ? 'text-red-500' : 'text-foreground'}>
                        {formatCurrency(r.costPerServing)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">{Math.round(r.calPerServing)}</td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">{Math.round(r.protPerServing)}g</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">{r.timesUsed}×</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
