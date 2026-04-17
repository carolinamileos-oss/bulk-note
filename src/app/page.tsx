import { prisma } from '@/lib/prisma'
import { formatCurrency, formatMacro, calculateRecipeMacros, CATEGORY_LABELS, getWeekDates } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { BookOpen, Heart, CalendarDays, ShoppingCart, History, TrendingUp, Star, Zap, Plus } from 'lucide-react'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'

async function getDashboardData() {
  const { monday, sunday } = getWeekDates()

  const [
    totalRecipes,
    favoriteRecipes,
    weekPlan,
    allHistory,
    topRecipe,
    bestRated,
  ] = await Promise.all([
    prisma.recipe.count(),
    prisma.recipe.count({ where: { isFavorite: true } }),
    prisma.mealPlan.findFirst({
      where: { weekStart: { gte: monday }, weekEnd: { lte: sunday } },
      include: {
        items: {
          include: {
            recipe: {
              include: { ingredients: { include: { ingredient: true } } }
            }
          }
        }
      }
    }),
    prisma.mealHistory.findMany({
      include: { recipe: { include: { ingredients: { include: { ingredient: true } } } } },
      orderBy: { date: 'desc' },
      take: 30,
    }),
    prisma.mealHistory.groupBy({
      by: ['recipeId'],
      _count: { recipeId: true },
      orderBy: { _count: { recipeId: 'desc' } },
      take: 1,
    }),
    prisma.recipe.findFirst({ where: { rating: { not: null } }, orderBy: { rating: 'desc' } }),
  ])

  // Week cost
  let weekCost = 0
  if (weekPlan) {
    for (const item of weekPlan.items) {
      const macros = calculateRecipeMacros(item.recipe.ingredients)
      weekCost += (macros.cost / item.recipe.servings) * item.servings
    }
  }

  // Month cost estimate
  const monthCost = weekCost * 4.3

  // Average cost per serving from history
  let totalCostFromHistory = 0
  for (const h of allHistory) {
    const macros = calculateRecipeMacros(h.recipe.ingredients)
    totalCostFromHistory += (macros.cost / h.recipe.servings) * h.servings
  }
  const avgCostPerServing = allHistory.length > 0 ? totalCostFromHistory / allHistory.length : 0

  // Most repeated recipe
  let mostRepeatedRecipe = null
  if (topRecipe.length > 0) {
    mostRepeatedRecipe = await prisma.recipe.findUnique({ where: { id: topRecipe[0].recipeId } })
  }

  // Weekly spending chart data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })

  const weeklyChart = await Promise.all(
    last7Days.map(async (date) => {
      const start = new Date(date); start.setHours(0,0,0,0)
      const end = new Date(date); end.setHours(23,59,59,999)
      const dayHistory = await prisma.mealHistory.findMany({
        where: { date: { gte: start, lte: end } },
        include: { recipe: { include: { ingredients: { include: { ingredient: true } } } } }
      })
      let dayCost = 0
      for (const h of dayHistory) {
        const macros = calculateRecipeMacros(h.recipe.ingredients)
        dayCost += (macros.cost / h.recipe.servings) * h.servings
      }
      return { day: date.toLocaleDateString('pt-PT', { weekday: 'short' }), cost: Math.round(dayCost * 100) / 100 }
    })
  )

  // Recipe usage chart
  const recipeUsage = await prisma.mealHistory.groupBy({
    by: ['recipeId'],
    _count: { recipeId: true },
    orderBy: { _count: { recipeId: 'desc' } },
    take: 5,
  })
  const recipeUsageWithNames = await Promise.all(
    recipeUsage.map(async (r) => {
      const recipe = await prisma.recipe.findUnique({ where: { id: r.recipeId } })
      return { name: recipe?.name.split(' ').slice(0, 2).join(' ') ?? '', count: r._count.recipeId }
    })
  )

  return {
    totalRecipes, favoriteRecipes,
    weekPlanCount: weekPlan?.items.length ?? 0,
    weekCost, monthCost, avgCostPerServing,
    mostRepeatedRecipe, bestRated,
    weeklyChart, recipeUsageWithNames,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  const quickActions = [
    { href: '/recipes/new', label: 'Nova Receita', icon: Plus, color: 'bg-sage-500' },
    { href: '/planning', label: 'Planeamento', icon: CalendarDays, color: 'bg-blue-500' },
    { href: '/shopping', label: 'Lista de Compras', icon: ShoppingCart, color: 'bg-amber-500' },
    { href: '/history', label: 'Histórico', icon: History, color: 'bg-pink-500' },
  ]

  const stats = [
    { label: 'Receitas', value: data.totalRecipes, icon: BookOpen, suffix: 'receitas', color: 'text-sage-600' },
    { label: 'Favoritas', value: data.favoriteRecipes, icon: Heart, suffix: 'receitas', color: 'text-pink-500' },
    { label: 'Refeições esta semana', value: data.weekPlanCount, icon: CalendarDays, suffix: 'planeadas', color: 'text-blue-500' },
    { label: 'Custo esta semana', value: formatCurrency(data.weekCost), icon: TrendingUp, isString: true, color: 'text-amber-600' },
    { label: 'Custo este mês (est.)', value: formatCurrency(data.monthCost), icon: TrendingUp, isString: true, color: 'text-orange-500' },
    { label: 'Custo médio por porção', value: formatCurrency(data.avgCostPerServing), icon: Zap, isString: true, color: 'text-emerald-600' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="section-title text-3xl">Olá! 👋</h1>
        <p className="text-muted-foreground mt-1">Aqui está o resumo da tua dieta de ganho de peso.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map(({ href, label, icon: Icon, color }) => (
          <Link key={href} href={href}
            className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-white border border-border hover:shadow-md transition-all hover:-translate-y-0.5 group">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-foreground text-center">{label}</span>
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, suffix, isString, color }) => (
          <div key={label} className="stat-card">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-2xl font-display font-semibold ${color}`}>
              {isString ? value : value}
            </p>
            {suffix && <p className="text-xs text-muted-foreground mt-0.5">{suffix}</p>}
          </div>
        ))}
      </div>

      {/* Charts */}
      <DashboardCharts weeklyChart={data.weeklyChart} recipeUsage={data.recipeUsageWithNames} />

      {/* Bottom cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.mostRepeatedRecipe && (
          <Card className="card-hover">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-lg">🔁</span> Receita mais repetida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/recipes/${data.mostRepeatedRecipe.id}`} className="group">
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {data.mostRepeatedRecipe.name}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {CATEGORY_LABELS[data.mostRepeatedRecipe.category] ?? data.mostRepeatedRecipe.category}
                </p>
              </Link>
            </CardContent>
          </Card>
        )}

        {data.bestRated && (
          <Card className="card-hover">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Melhor avaliação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/recipes/${data.bestRated.id}`} className="group">
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {data.bestRated.name}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < (data.bestRated?.rating ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">{data.bestRated.rating}/5</span>
                </div>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
