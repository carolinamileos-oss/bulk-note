import { prisma } from '@/lib/prisma'
import { formatCurrency, calculateRecipeMacros, CATEGORY_LABELS } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, Plus } from 'lucide-react'
import { AddHistoryDialog } from '@/components/history/AddHistoryDialog'

export default async function HistoryPage() {
  const history = await prisma.mealHistory.findMany({
    include: { recipe: { include: { ingredients: { include: { ingredient: true } } } } },
    orderBy: { date: 'desc' },
  })

  // Group by date
  const grouped: Record<string, typeof history> = {}
  for (const h of history) {
    const dateKey = new Date(h.date).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    if (!grouped[dateKey]) grouped[dateKey] = []
    grouped[dateKey].push(h)
  }

  const recipes = await prisma.recipe.findMany({ orderBy: { name: 'asc' } })

  // Stats
  const totalLogs = history.length
  const totalCalories = history.reduce((acc, h) => {
    const macros = calculateRecipeMacros(h.recipe.ingredients)
    return acc + (macros.calories / h.recipe.servings) * h.servings
  }, 0)
  const totalCost = history.reduce((acc, h) => {
    const macros = calculateRecipeMacros(h.recipe.ingredients)
    return acc + (macros.cost / h.recipe.servings) * h.servings
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Histórico Alimentar</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{totalLogs} registos guardados</p>
        </div>
        <AddHistoryDialog recipes={recipes} />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total refeições</p>
          <p className="text-2xl font-display font-semibold text-primary">{totalLogs}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total kcal</p>
          <p className="text-2xl font-display font-semibold text-amber-600">{Math.round(totalCalories).toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total gasto</p>
          <p className="text-2xl font-display font-semibold text-sage-600">{formatCurrency(totalCost)}</p>
        </div>
      </div>

      {/* History List */}
      {Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="font-display font-semibold text-lg mb-2">Nenhum registo ainda</h3>
          <p className="text-muted-foreground text-sm mb-6">Começa a registar as tuas refeições!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => {
            const dayCalories = items.reduce((acc, h) => {
              const m = calculateRecipeMacros(h.recipe.ingredients)
              return acc + (m.calories / h.recipe.servings) * h.servings
            }, 0)
            const dayCost = items.reduce((acc, h) => {
              const m = calculateRecipeMacros(h.recipe.ingredients)
              return acc + (m.cost / h.recipe.servings) * h.servings
            }, 0)

            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-foreground capitalize">{date}</h2>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{Math.round(dayCalories)} kcal</span>
                    <span>{formatCurrency(dayCost)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {items.map((h) => {
                    const macros = calculateRecipeMacros(h.recipe.ingredients)
                    const cal = (macros.calories / h.recipe.servings) * h.servings
                    const prot = (macros.protein / h.recipe.servings) * h.servings
                    const cost = (macros.cost / h.recipe.servings) * h.servings

                    return (
                      <div key={h.id} className="bg-white rounded-xl border border-border p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg shrink-0">
                          {h.mealType === 'breakfast' ? '🌅' : h.mealType === 'lunch' ? '☀️' : h.mealType === 'dinner' ? '🌙' : h.mealType === 'post-workout' ? '💪' : '🍎'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{h.recipe.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {CATEGORY_LABELS[h.mealType] ?? h.mealType} · {h.servings} porç. · {Math.round(cal)} kcal · {Math.round(prot)}g prot
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium text-muted-foreground">{formatCurrency(cost)}</p>
                          {h.satisfaction && (
                            <div className="flex items-center gap-0.5 justify-end mt-1">
                              {Array.from({ length: h.satisfaction }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
