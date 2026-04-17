'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Plus, Loader2 } from 'lucide-react'

interface Recipe { id: string; name: string; category: string }

const MEAL_TYPES = [
  { value: 'breakfast', label: '🌅 Pequeno-almoço' },
  { value: 'lunch', label: '☀️ Almoço' },
  { value: 'dinner', label: '🌙 Jantar' },
  { value: 'snack', label: '🍎 Lanche' },
  { value: 'pre-workout', label: '⚡ Pré-treino' },
  { value: 'post-workout', label: '💪 Pós-treino' },
]

export function AddHistoryDialog({ recipes }: { recipes: Recipe[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    mealType: 'lunch',
    recipeId: '',
    servings: 1,
    satisfaction: 0,
    wouldRepeat: null as boolean | null,
    notes: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.recipeId) { toast({ title: 'Seleciona uma receita', variant: 'destructive' }); return }
    setLoading(true)
    try {
      const res = await fetch('/api/meal-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, date: new Date(form.date).toISOString() }),
      })
      if (!res.ok) throw new Error()
      toast({ title: '✅ Refeição registada!' })
      setOpen(false)
      setForm({ date: new Date().toISOString().slice(0, 10), mealType: 'lunch', recipeId: '', servings: 1, satisfaction: 0, wouldRepeat: null, notes: '' })
      router.refresh()
    } catch {
      toast({ title: 'Erro ao registar', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="w-4 h-4" /> Registar refeição</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registar refeição</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Data</label>
              <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Tipo de refeição</label>
              <Select value={form.mealType} onValueChange={v => setForm(p => ({ ...p, mealType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{MEAL_TYPES.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="form-label">Receita</label>
            <Select value={form.recipeId} onValueChange={v => setForm(p => ({ ...p, recipeId: v }))}>
              <SelectTrigger><SelectValue placeholder="Seleciona receita..." /></SelectTrigger>
              <SelectContent>{recipes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="form-label">Número de porções</label>
            <Input type="number" min="0.5" step="0.5" value={form.servings} onChange={e => setForm(p => ({ ...p, servings: +e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Satisfação (1-5)</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setForm(p => ({ ...p, satisfaction: n === p.satisfaction ? 0 : n }))}
                  className={`text-xl transition-transform hover:scale-110 ${n <= form.satisfaction ? 'opacity-100' : 'opacity-25'}`}>⭐</button>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label">Repetiria?</label>
            <div className="flex gap-2">
              {[{ v: true, l: '✅ Sim' }, { v: false, l: '❌ Não' }].map(({ v, l }) => (
                <button key={l} type="button" onClick={() => setForm(p => ({ ...p, wouldRepeat: p.wouldRepeat === v ? null : v }))}
                  className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${form.wouldRepeat === v ? 'bg-primary text-primary-foreground' : 'bg-white border-border text-muted-foreground'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label">Notas</label>
            <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Como correu?" rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
