import { prisma } from '@/lib/prisma'
import { getWeekDates, calculateRecipeMacros, formatCurrency, CATEGORY_LABELS } from '@/lib/utils'
import { WeeklyPlanner } from '@/components/planning/WeeklyPlanner'

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

export default async function PlanningPage() {
  const { monday, sunday } = getWeekDates()

  // Find or note there's no plan
  const plan = await prisma.mealPlan.findFirst({
    where: {
      weekStart: { gte: monday },
      weekEnd: { lte: sunday },
    },
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
  })

  const recipes = await prisma.recipe.findMany({ orderBy: { name: 'asc' } })

  // Build day data
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    const dayItems = plan?.items.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate.toDateString() === date.toDateString()
    }) ?? []

    const dayCalories = dayItems.reduce((acc, item) => {
      const m = calculateRecipeMacros(item.recipe.ingredients)
      return acc + (m.calories / item.recipe.servings) * item.servings
    }, 0)
    const dayProtein = dayItems.reduce((acc, item) => {
      const m = calculateRecipeMacros(item.recipe.ingredients)
      return acc + (m.protein / item.recipe.servings) * item.servings
    }, 0)
    const dayCost = dayItems.reduce((acc, item) => {
      const m = calculateRecipeMacros(item.recipe.ingredients)
      return acc + (m.cost / item.recipe.servings) * item.servings
    }, 0)

    return { date, label: DAYS[i], items: dayItems, dayCalories, dayProtein, dayCost }
  })

  const weekCalories = days.reduce((acc, d) => acc + d.dayCalories, 0)
  const weekProtein = days.reduce((acc, d) => acc + d.dayProtein, 0)
  const weekCost = days.reduce((acc, d) => acc + d.dayCost, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title">Planeamento Semanal</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {monday.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' })} – {sunday.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Week summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Kcal semana</p>
          <p className="text-2xl font-display font-semibold text-amber-600">{Math.round(weekCalories).toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Proteína semana</p>
          <p className="text-2xl font-display font-semibold text-blue-600">{Math.round(weekProtein)}g</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Custo semana</p>
          <p className="text-2xl font-display font-semibold text-sage-600">{formatCurrency(weekCost)}</p>
        </div>
      </div>

      <WeeklyPlanner
        days={days}
        recipes={recipes}
        planId={plan?.id ?? null}
        monday={monday.toISOString()}
        sunday={sunday.toISOString()}
      />
    </div>
  )
}
