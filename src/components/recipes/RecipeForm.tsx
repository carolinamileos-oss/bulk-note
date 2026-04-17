'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import { Plus, Trash2, Loader2 } from 'lucide-react'

const CATEGORIES = [
  { value: 'breakfast', label: 'Pequeno-almoço' },
  { value: 'lunch', label: 'Almoço' },
  { value: 'dinner', label: 'Jantar' },
  { value: 'snack', label: 'Lanche' },
  { value: 'pre-workout', label: 'Pré-treino' },
  { value: 'post-workout', label: 'Pós-treino' },
]

const UNITS = ['g', 'kg', 'ml', 'l', 'unidade', 'fatia', 'colher', 'copo', 'pitada']

interface Ingredient { id: string; name: string; calories: number; protein: number; carbs: number; fat: number; costPer: number; unit: string }
interface RecipeIngredientRow { ingredientId: string; quantity: number; unit: string }

interface Props {
  ingredients: Ingredient[]
  recipe?: {
    id: string; name: string; category: string; description?: string | null; prepMethod?: string | null
    servings: number; prepTime?: number | null; isFavorite: boolean; rating?: number | null; opinion?: string | null
    notes?: string | null; wouldChange?: string | null; bestTime?: string | null; wouldRepeat?: boolean | null
    worthCost?: boolean | null; tags?: string | null
    ingredients: { ingredientId: string; quantity: number; unit: string }[]
  }
}

export function RecipeForm({ ingredients, recipe }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(recipe?.name ?? '')
  const [category, setCategory] = useState(recipe?.category ?? 'lunch')
  const [description, setDescription] = useState(recipe?.description ?? '')
  const [prepMethod, setPrepMethod] = useState(recipe?.prepMethod ?? '')
  const [servings, setServings] = useState(recipe?.servings ?? 1)
  const [prepTime, setPrepTime] = useState(recipe?.prepTime ?? '')
  const [isFavorite, setIsFavorite] = useState(recipe?.isFavorite ?? false)
  const [rating, setRating] = useState(recipe?.rating ?? 0)
  const [opinion, setOpinion] = useState(recipe?.opinion ?? '')
  const [notes, setNotes] = useState(recipe?.notes ?? '')
  const [wouldChange, setWouldChange] = useState(recipe?.wouldChange ?? '')
  const [bestTime, setBestTime] = useState(recipe?.bestTime ?? '')
  const [wouldRepeat, setWouldRepeat] = useState<boolean | null>(recipe?.wouldRepeat ?? null)
  const [worthCost, setWorthCost] = useState<boolean | null>(recipe?.worthCost ?? null)
  const [tags, setTags] = useState(recipe?.tags ? JSON.parse(recipe.tags).join(', ') : '')
  const [rows, setRows] = useState<RecipeIngredientRow[]>(
    recipe?.ingredients ?? [{ ingredientId: '', quantity: 100, unit: 'g' }]
  )
  const [newIngredient, setNewIngredient] = useState({ name: '', category: '', unit: 'g', calories: '', protein: '', carbs: '', fat: '', costPer: '' })
  const [showNewIng, setShowNewIng] = useState(false)

  // Computed macros
  const macros = rows.reduce((acc, row) => {
    const ing = ingredients.find(i => i.id === row.ingredientId)
    if (!ing) return acc
    const factor = (row.unit === 'g' || row.unit === 'ml') ? row.quantity / 100 : row.quantity
    return {
      calories: acc.calories + ing.calories * factor,
      protein: acc.protein + ing.protein * factor,
      carbs: acc.carbs + ing.carbs * factor,
      fat: acc.fat + ing.fat * factor,
      cost: acc.cost + ing.costPer * row.quantity,
    }
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, cost: 0 })

  const perServing = servings > 0 ? {
    calories: macros.calories / servings,
    protein: macros.protein / servings,
    carbs: macros.carbs / servings,
    fat: macros.fat / servings,
    cost: macros.cost / servings,
  } : macros

  async function handleSaveNewIngredient() {
    try {
      const res = await fetch('/api/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newIngredient, calories: +newIngredient.calories, protein: +newIngredient.protein, carbs: +newIngredient.carbs, fat: +newIngredient.fat, costPer: +newIngredient.costPer }),
      })
      if (!res.ok) throw new Error()
      const created = await res.json()
      ingredients.push(created)
      setRows(prev => prev.map((r, i) => i === prev.length - 1 ? { ...r, ingredientId: created.id } : r))
      setShowNewIng(false)
      setNewIngredient({ name: '', category: '', unit: 'g', calories: '', protein: '', carbs: '', fat: '', costPer: '' })
      toast({ title: '✅ Ingrediente criado', variant: 'success' as any })
    } catch {
      toast({ title: 'Erro ao criar ingrediente', variant: 'destructive' })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { toast({ title: 'Nome obrigatório', variant: 'destructive' }); return }
    if (rows.some(r => !r.ingredientId)) { toast({ title: 'Seleciona todos os ingredientes', variant: 'destructive' }); return }

    setLoading(true)
    const payload = {
      name, category, description, prepMethod, servings: +servings, prepTime: prepTime ? +prepTime : null,
      isFavorite, rating: rating || null, opinion: opinion || null, notes: notes || null,
      wouldChange: wouldChange || null, bestTime: bestTime || null, wouldRepeat, worthCost,
      tags: tags ? JSON.stringify(tags.split(',').map((t: string) => t.trim()).filter(Boolean)) : null,
      ingredients: rows.filter(r => r.ingredientId),
    }

    try {
      const url = recipe ? `/api/recipes/${recipe.id}` : '/api/recipes'
      const method = recipe ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error()
      const data = await res.json()
      toast({ title: recipe ? '✅ Receita atualizada' : '✅ Receita criada', variant: 'success' as any })
      router.push(`/recipes/${data.id}`)
      router.refresh()
    } catch {
      toast({ title: 'Erro ao guardar receita', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg">Informação básica</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="form-label">Nome da receita *</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Overnight Oats Proteica" required />
          </div>
          <div>
            <label className="form-label">Categoria</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="form-label">Porções</label>
            <Input type="number" min="1" value={servings} onChange={e => setServings(+e.target.value)} />
          </div>
          <div>
            <label className="form-label">Tempo de preparo (min)</label>
            <Input type="number" min="0" value={prepTime} onChange={e => setPrepTime(e.target.value)} placeholder="Ex: 15" />
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Descrição</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descreve brevemente esta receita..." rows={2} />
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg">Ingredientes</h2>

        {/* Live macros preview */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-muted rounded-xl text-sm">
          {[
            { label: 'Total kcal', value: Math.round(macros.calories) },
            { label: 'Total prot', value: `${Math.round(macros.protein)}g` },
            { label: 'Total HC', value: `${Math.round(macros.carbs)}g` },
            { label: 'Total gord', value: `${Math.round(macros.fat)}g` },
            { label: 'Custo total', value: formatCurrency(macros.cost) },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {rows.map((row, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <Select value={row.ingredientId} onValueChange={v => setRows(prev => prev.map((r, i) => i === idx ? { ...r, ingredientId: v } : r))}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Seleciona ingrediente..." />
                </SelectTrigger>
                <SelectContent>
                  {ingredients.map(ing => <SelectItem key={ing.id} value={ing.id}>{ing.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="number" min="0" step="0.1" value={row.quantity} onChange={e => setRows(prev => prev.map((r, i) => i === idx ? { ...r, quantity: +e.target.value } : r))} className="w-24" />
              <Select value={row.unit} onValueChange={v => setRows(prev => prev.map((r, i) => i === idx ? { ...r, unit: v } : r))}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
              <Button type="button" variant="ghost" size="icon" onClick={() => setRows(prev => prev.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-destructive shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setRows(prev => [...prev, { ingredientId: '', quantity: 100, unit: 'g' }])}>
            <Plus className="w-4 h-4" /> Adicionar ingrediente
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewIng(!showNewIng)}>
            + Criar novo ingrediente
          </Button>
        </div>

        {showNewIng && (
          <div className="border border-border rounded-xl p-4 space-y-3 bg-muted/40">
            <p className="text-sm font-medium">Novo ingrediente</p>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Nome" value={newIngredient.name} onChange={e => setNewIngredient(p => ({ ...p, name: e.target.value }))} />
              <Input placeholder="Categoria (ex: proteínas)" value={newIngredient.category} onChange={e => setNewIngredient(p => ({ ...p, category: e.target.value }))} />
              <Input placeholder="Calorias /100g" type="number" value={newIngredient.calories} onChange={e => setNewIngredient(p => ({ ...p, calories: e.target.value }))} />
              <Input placeholder="Proteína /100g" type="number" value={newIngredient.protein} onChange={e => setNewIngredient(p => ({ ...p, protein: e.target.value }))} />
              <Input placeholder="Hidratos /100g" type="number" value={newIngredient.carbs} onChange={e => setNewIngredient(p => ({ ...p, carbs: e.target.value }))} />
              <Input placeholder="Gordura /100g" type="number" value={newIngredient.fat} onChange={e => setNewIngredient(p => ({ ...p, fat: e.target.value }))} />
              <Input placeholder="Custo por g/unidade (€)" type="number" step="0.001" value={newIngredient.costPer} onChange={e => setNewIngredient(p => ({ ...p, costPer: e.target.value }))} />
              <Select value={newIngredient.unit} onValueChange={v => setNewIngredient(p => ({ ...p, unit: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={handleSaveNewIngredient}>Guardar ingrediente</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewIng(false)}>Cancelar</Button>
            </div>
          </div>
        )}
      </div>

      {/* Prep method */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg">Modo de Preparo</h2>
        <Textarea value={prepMethod} onChange={e => setPrepMethod(e.target.value)} placeholder="1. Primeiro passo&#10;2. Segundo passo&#10;3. ..." rows={6} />
      </div>

      {/* Personal Notes */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg">Avaliação & Notas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Rating */}
          <div>
            <label className="form-label">Avaliação (1-5)</label>
            <div className="flex gap-1 mt-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setRating(n === rating ? 0 : n)}
                  className={`text-2xl transition-transform hover:scale-110 ${n <= rating ? 'opacity-100' : 'opacity-25'}`}>⭐</button>
              ))}
            </div>
          </div>
          {/* Opinion */}
          <div>
            <label className="form-label">Opinião geral</label>
            <Select value={opinion} onValueChange={setOpinion}>
              <SelectTrigger><SelectValue placeholder="Como foi?" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="loved">❤️ Adorei</SelectItem>
                <SelectItem value="liked">👍 Gostei</SelectItem>
                <SelectItem value="neutral">😐 Mais ou menos</SelectItem>
                <SelectItem value="disliked">👎 Não gostei</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="form-label">Melhor horário</label>
            <Input value={bestTime} onChange={e => setBestTime(e.target.value)} placeholder="Ex: Pequeno-almoço, Pós-treino..." />
          </div>
          <div>
            <label className="form-label">Tags (separadas por vírgula)</label>
            <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="rápido, barato, proteico..." />
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Observações pessoais</label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="O que achaste desta receita?" rows={3} />
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Mudaria alguma coisa?</label>
            <Input value={wouldChange} onChange={e => setWouldChange(e.target.value)} placeholder="Ex: Adicionar mais proteína, menos sal..." />
          </div>

          {/* Booleans */}
          <div className="flex flex-col gap-3">
            <label className="form-label">Voltaria a fazer?</label>
            <div className="flex gap-2">
              {[{ v: true, l: '✅ Sim' }, { v: false, l: '❌ Não' }].map(({ v, l }) => (
                <button key={l} type="button" onClick={() => setWouldRepeat(wouldRepeat === v ? null : v)}
                  className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${wouldRepeat === v ? 'bg-primary text-primary-foreground border-primary' : 'bg-white border-border text-muted-foreground hover:bg-accent'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <label className="form-label">Vale a pena financeiramente?</label>
            <div className="flex gap-2">
              {[{ v: true, l: '💰 Sim' }, { v: false, l: '💸 Não' }].map(({ v, l }) => (
                <button key={l} type="button" onClick={() => setWorthCost(worthCost === v ? null : v)}
                  className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${worthCost === v ? 'bg-primary text-primary-foreground border-primary' : 'bg-white border-border text-muted-foreground hover:bg-accent'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2 flex items-center gap-3">
            <button type="button" onClick={() => setIsFavorite(!isFavorite)}
              className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${isFavorite ? 'bg-pink-500 border-pink-500' : 'border-border'}`}>
              {isFavorite && <span className="text-white text-xs">✓</span>}
            </button>
            <label className="text-sm font-medium cursor-pointer" onClick={() => setIsFavorite(!isFavorite)}>Marcar como favorita ❤️</label>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" disabled={loading} className="min-w-32">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> A guardar...</> : recipe ? 'Guardar alterações' : 'Criar receita'}
        </Button>
      </div>
    </form>
  )
}
