'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency, calculateRecipeMacros, CATEGORY_LABELS } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { Plus, Trash2, ShoppingCart, Loader2 } from 'lucide-react'

interface Recipe {
  id: string; name: string; category: string; servings: number
  ingredients: { quantity: number; unit: string; ingredient: { calories: number; protein: number; carbs: number; fat: number; costPer: number; unit: string } }[]
}

interface PlanItem {
  id: string; recipeId: string; date: string; mealType: string; servings: number; recipe: Recipe
}

interface DayData {
  date: Date; label: string; items: PlanItem[]; dayCalories: number; dayProtein: number; dayCost: number
}

interface Props {
  days: DayData[]; recipes: Recipe[]; planId: string | null; monday: string; sunday: string
}

const MEAL_TYPES = [
  { value: 'breakfast', label: '🌅 Pequeno-almoço' },
  { value: 'lunch', label: '☀️ Almoço' },
  { value: 'dinner', label: '🌙 Jantar' },
  { value: 'snack', label: '🍎 Lanche' },
  { value: 'pre-workout', label: '⚡ Pré-treino' },
  { value: 'post-workout', label: '💪 Pós-treino' },
]

export function WeeklyPlanner({ days: initialDays, recipes, planId: initialPlanId, monday, sunday }: Props) {
  const router = useRouter()
  const [days, setDays] = useState(initialDays)
  const [planId, setPlanId] = useState(initialPlanId)
  const [addingTo, setAddingTo] = useState<string | null>(null) // dateKey
  const [addForm, setAddForm] = useState({ recipeId: '', mealType: 'lunch', servings: 1 })
  const [loadingGenerate, setLoadingGenerate] = useState(false)

  async function ensurePlan() {
    if (planId) return planId
    const res = await fetch('/api/meal-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Semana Atual', weekStart: monday, weekEnd: sunday }),
    })
    const plan = await res.json()
    setPlanId(plan.id)
    return plan.id
  }

  async function handleAddItem(dateStr: string) {
    if (!addForm.recipeId) { toast({ title: 'Seleciona uma receita', variant: 'destructive' }); return }
    try {
      const pid = await ensurePlan()
      const res = await fetch('/api/meal-plans/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: pid, recipeId: addForm.recipeId, date: dateStr, mealType: addForm.mealType, servings: addForm.servings }),
      })
      if (!res.ok) throw new Error()
      toast({ title: '✅ Refeição adicionada' })
      setAddingTo(null)
      setAddForm({ recipeId: '', mealType: 'lunch', servings: 1 })
      router.refresh()
    } catch {
      toast({ title: 'Erro ao adicionar', variant: 'destructive' })
    }
  }

  async function handleRemoveItem(itemId: string) {
    try {
      await fetch(`/api/meal-plans/items?id=${itemId}`, { method: 'DELETE' })
      toast({ title: 'Refeição removida' })
      router.refresh()
    } catch {
      toast({ title: 'Erro ao remover', variant: 'destructive' })
    }
  }

  async function handleGenerateShopping() {
    if (!planId) { toast({ title: 'Ainda não há plano esta semana', variant: 'destructive' }); return }
    setLoadingGenerate(true)
    try {
      const res = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      if (!res.ok) throw new Error()
      toast({ title: '🛒 Lista de compras gerada!' })
      router.push('/shopping')
    } catch {
      toast({ title: 'Erro ao gerar lista', variant: 'destructive' })
    } finally {
      setLoadingGenerate(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleGenerateShopping} disabled={loadingGenerate || !planId}>
          {loadingGenerate ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
          Gerar lista de compras
        </Button>
      </div>

      {/* Day columns - scrollable on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
        {days.map((day) => {
          const dateKey = day.date.toISOString()
          const isToday = day.date.toDateString() === new Date().toDateString()
          const isAdding = addingTo === dateKey

          return (
            <div key={dateKey} className={`rounded-2xl border p-3 space-y-2 min-h-[200px] ${isToday ? 'border-primary bg-primary/5' : 'border-border bg-white'}`}>
              {/* Day header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>{day.label}</p>
                  <p className="text-sm font-medium text-foreground">{day.date.getDate()}</p>
                </div>
                {day.items.length > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-amber-600 font-medium">{Math.round(day.dayCalories)} kcal</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(day.dayCost)}</p>
                  </div>
                )}
              </div>

              {/* Meal items */}
              <div className="space-y-1.5">
                {day.items.map((item) => {
                  const macros = calculateRecipeMacros(item.recipe.ingredients)
                  const cal = (macros.calories / item.recipe.servings) * item.servings
                  return (
                    <div key={item.id} className="group relative bg-muted rounded-xl p-2">
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground truncate">{item.recipe.name}</p>
                          <p className="text-xs text-muted-foreground">{item.servings} porç. · {Math.round(cal)} kcal</p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Add form */}
              {isAdding ? (
                <div className="space-y-2 pt-1">
                  <Select value={addForm.recipeId} onValueChange={v => setAddForm(p => ({ ...p, recipeId: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Receita..." /></SelectTrigger>
                    <SelectContent>{recipes.map(r => <SelectItem key={r.id} value={r.id} className="text-xs">{r.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={addForm.mealType} onValueChange={v => setAddForm(p => ({ ...p, mealType: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{MEAL_TYPES.map(m => <SelectItem key={m.value} value={m.value} className="text-xs">{m.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <div className="flex gap-1">
                    <Input type="number" min="0.5" step="0.5" value={addForm.servings}
                      onChange={e => setAddForm(p => ({ ...p, servings: +e.target.value }))}
                      className="h-8 text-xs w-16" placeholder="Porç." />
                    <Button size="sm" className="h-8 text-xs flex-1" onClick={() => handleAddItem(dateKey)}>OK</Button>
                    <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setAddingTo(null)}>✕</Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setAddingTo(dateKey); setAddForm({ recipeId: '', mealType: 'lunch', servings: 1 }) }}
                  className="w-full flex items-center justify-center gap-1 py-1.5 rounded-xl border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors text-xs"
                >
                  <Plus className="w-3 h-3" /> Adicionar
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
