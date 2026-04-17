'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'

const UNITS = ['g', 'ml', 'unidade', 'fatia', 'colher', 'copo']

const CATEGORIES = [
  { value: '_none', label: 'Sem categoria' },
  { value: 'proteínas', label: 'Proteínas' },
  { value: 'lacticínios', label: 'Lacticínios' },
  { value: 'cereais', label: 'Cereais' },
  { value: 'frutas', label: 'Frutas' },
  { value: 'vegetais', label: 'Vegetais' },
  { value: 'gorduras', label: 'Gorduras' },
  { value: 'frutos secos', label: 'Frutos secos' },
  { value: 'suplementos', label: 'Suplementos' },
  { value: 'outros', label: 'Outros' },
]

type Ingredient = {
  id: string
  name: string
  category: string | null
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  costPer: number
  _count: { recipeIngredients: number }
}

const emptyForm = {
  name: '', category: '_none', unit: 'g',
  calories: '', protein: '', carbs: '', fat: '', costPer: '',
}

export function IngredientsClient({ initialIngredients }: { initialIngredients: Ingredient[] }) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Ingredient | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return ingredients
    const q = search.toLowerCase()
    return ingredients.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.category ?? '').toLowerCase().includes(q)
    )
  }, [ingredients, search])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(ing: Ingredient) {
    setEditing(ing)
    setForm({
      name: ing.name,
      category: ing.category ?? '_none',
      unit: ing.unit,
      calories: String(ing.calories),
      protein: String(ing.protein),
      carbs: String(ing.carbs),
      fat: String(ing.fat),
      costPer: String(ing.costPer),
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast({ title: 'Nome obrigatório', variant: 'destructive' })
      return
    }
    setLoading(true)
    const payload = {
      name: form.name.trim(),
      category: form.category === '_none' ? null : form.category || null,
      unit: form.unit,
      calories: parseFloat(form.calories) || 0,
      protein: parseFloat(form.protein) || 0,
      carbs: parseFloat(form.carbs) || 0,
      fat: parseFloat(form.fat) || 0,
      costPer: parseFloat(form.costPer) || 0,
    }
    try {
      if (editing) {
        const res = await fetch(`/api/ingredients/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ?? 'Erro ao atualizar')
        }
        const updated = await res.json()
        setIngredients(prev =>
          prev.map(i => i.id === editing.id ? { ...updated, _count: i._count } : i)
        )
        toast({ title: '✅ Ingrediente atualizado', variant: 'success' as any })
      } else {
        const res = await fetch('/api/ingredients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ?? 'Erro ao criar')
        }
        const created = await res.json()
        setIngredients(prev =>
          [...prev, { ...created, _count: { recipeIngredients: 0 } }]
            .sort((a, b) => a.name.localeCompare(b.name, 'pt'))
        )
        toast({ title: '✅ Ingrediente criado', variant: 'success' as any })
      }
      setDialogOpen(false)
    } catch (e: any) {
      toast({ title: e.message ?? 'Erro ao guardar', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(ing: Ingredient) {
    if (ing._count.recipeIngredients > 0) {
      toast({
        title: 'Não é possível apagar',
        description: `Este ingrediente está a ser usado em ${ing._count.recipeIngredients} receita(s).`,
        variant: 'destructive',
      })
      return
    }
    if (!confirm(`Tens a certeza que queres apagar "${ing.name}"?`)) return
    setDeletingId(ing.id)
    try {
      const res = await fetch(`/api/ingredients/${ing.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erro ao apagar')
      }
      setIngredients(prev => prev.filter(i => i.id !== ing.id))
      toast({ title: '✅ Ingrediente apagado', variant: 'success' as any })
    } catch (e: any) {
      toast({ title: e.message ?? 'Erro ao apagar', variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Pesquisar por nome ou categoria..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" /> Novo ingrediente
        </Button>
      </div>

      {/* Stats summary */}
      {ingredients.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: ingredients.length, suffix: 'ingredientes' },
            { label: 'Usados em receitas', value: ingredients.filter(i => i._count.recipeIngredients > 0).length, suffix: 'ingredientes' },
            { label: 'Sem categoria', value: ingredients.filter(i => !i.category).length, suffix: 'ingredientes' },
            { label: 'Resultados', value: filtered.length, suffix: 'encontrados' },
          ].map(({ label, value, suffix }) => (
            <div key={label} className="bg-white rounded-2xl border border-border p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-display font-semibold text-foreground mt-0.5">{value}</p>
              <p className="text-xs text-muted-foreground">{suffix}</p>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">🥗</div>
          <h3 className="font-display font-semibold text-lg text-foreground mb-2">
            {search ? 'Nenhum ingrediente encontrado' : 'Sem ingredientes'}
          </h3>
          {!search && (
            <>
              <p className="text-muted-foreground text-sm mb-6">Adiciona o teu primeiro ingrediente!</p>
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4" /> Adicionar ingrediente
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              {/* Table header */}
              <div className="grid gap-3 px-5 py-3 bg-muted/40 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide"
                style={{ gridTemplateColumns: '1fr 90px 72px 72px 72px 76px 72px 72px' }}>
                <span>Ingrediente</span>
                <span className="text-right">Calorias</span>
                <span className="text-right">Proteína</span>
                <span className="text-right">Hidratos</span>
                <span className="text-right">Gordura</span>
                <span className="text-right">Custo/un.</span>
                <span className="text-center">Receitas</span>
                <span />
              </div>

              {/* Rows */}
              <div className="divide-y divide-border">
                {filtered.map(ing => (
                  <div
                    key={ing.id}
                    className="grid gap-3 px-5 py-3.5 items-center hover:bg-muted/20 transition-colors"
                    style={{ gridTemplateColumns: '1fr 90px 72px 72px 72px 76px 72px 72px' }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{ing.name}</p>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">
                        {ing.category ?? <span className="italic">sem categoria</span>}
                        {' · '}{ing.unit}
                      </p>
                    </div>
                    <p className="text-sm text-right text-amber-700 font-medium">
                      {Math.round(ing.calories)} <span className="text-xs font-normal text-muted-foreground">kcal</span>
                    </p>
                    <p className="text-sm text-right text-blue-700">{Math.round(ing.protein)}g</p>
                    <p className="text-sm text-right text-orange-700">{Math.round(ing.carbs)}g</p>
                    <p className="text-sm text-right text-purple-700">{Math.round(ing.fat)}g</p>
                    <p className="text-sm text-right text-muted-foreground">{formatCurrency(ing.costPer)}</p>
                    <div className="text-center">
                      {ing._count.recipeIngredients > 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sage-100 text-sage-800 text-xs font-semibold">
                          {ing._count.recipeIngredients}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(ing)}
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(ing)}
                        disabled={deletingId === ing.id}
                        title={ing._count.recipeIngredients > 0 ? 'Em uso em receitas' : 'Apagar'}
                      >
                        {deletingId === ing.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={open => { if (!loading) setDialogOpen(open) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar ingrediente' : 'Novo ingrediente'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Nome + Categoria + Unidade */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="form-label">Nome *</label>
                <Input
                  placeholder="Ex: Peito de frango"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  autoFocus
                />
              </div>
              <div>
                <label className="form-label">Categoria</label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="form-label">Unidade base</label>
                <Select value={form.unit} onValueChange={v => setForm(p => ({ ...p, unit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Macros */}
            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Valores nutricionais (por 100g ou por unidade)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Calorias (kcal)</label>
                  <Input
                    type="number" min="0" step="0.1" placeholder="0"
                    value={form.calories}
                    onChange={e => setForm(p => ({ ...p, calories: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">Proteína (g)</label>
                  <Input
                    type="number" min="0" step="0.1" placeholder="0"
                    value={form.protein}
                    onChange={e => setForm(p => ({ ...p, protein: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">Hidratos (g)</label>
                  <Input
                    type="number" min="0" step="0.1" placeholder="0"
                    value={form.carbs}
                    onChange={e => setForm(p => ({ ...p, carbs: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">Gordura (g)</label>
                  <Input
                    type="number" min="0" step="0.1" placeholder="0"
                    value={form.fat}
                    onChange={e => setForm(p => ({ ...p, fat: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Custo */}
            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Custo</p>
              <div>
                <label className="form-label">Custo por g / unidade (€)</label>
                <Input
                  type="number" min="0" step="0.001" placeholder="0.000"
                  value={form.costPer}
                  onChange={e => setForm(p => ({ ...p, costPer: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ex: frango a 8€/kg → 0.008 por grama
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading} className="min-w-36">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> A guardar...</>
                : editing ? 'Guardar alterações' : 'Criar ingrediente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
