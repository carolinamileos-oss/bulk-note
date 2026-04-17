'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Plus, Loader2 } from 'lucide-react'

interface Ingredient { id: string; name: string }

export function AddSubstitutionDialog({ ingredients }: { ingredients: Ingredient[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [form, setForm] = useState({
    ingredientId: '', substituteId: '', reason: '',
    similarCalories: false, similarProtein: false, similarFunction: false, cheaperOption: false,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.ingredientId || !form.substituteId) {
      toast({ title: 'Seleciona os dois ingredientes', variant: 'destructive' }); return
    }
    if (form.ingredientId === form.substituteId) {
      toast({ title: 'Ingredientes têm de ser diferentes', variant: 'destructive' }); return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/substitutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast({ title: '✅ Substituição adicionada' })
      setOpen(false)
      setForm({ ingredientId: '', substituteId: '', reason: '', similarCalories: false, similarProtein: false, similarFunction: false, cheaperOption: false })
      router.refresh()
    } catch {
      toast({ title: 'Erro ao guardar', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const CheckBox = ({ field, label }: { field: keyof typeof form; label: string }) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        onClick={() => setForm(p => ({ ...p, [field]: !p[field as keyof typeof p] }))}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${form[field as keyof typeof form] ? 'bg-primary border-primary' : 'border-border'}`}
      >
        {form[field as keyof typeof form] && <span className="text-white text-xs leading-none">✓</span>}
      </div>
      <span className="text-sm">{label}</span>
    </label>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="w-4 h-4" /> Nova substituição</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Adicionar substituição</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Ingrediente original</label>
            <Select value={form.ingredientId} onValueChange={v => setForm(p => ({ ...p, ingredientId: v }))}>
              <SelectTrigger><SelectValue placeholder="Seleciona ingrediente..." /></SelectTrigger>
              <SelectContent>{ingredients.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="form-label">Substituto</label>
            <Select value={form.substituteId} onValueChange={v => setForm(p => ({ ...p, substituteId: v }))}>
              <SelectTrigger><SelectValue placeholder="Seleciona substituto..." /></SelectTrigger>
              <SelectContent>{ingredients.filter(i => i.id !== form.ingredientId).map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="form-label">Razão da substituição</label>
            <Input value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Ex: Mais proteico, mais barato..." />
          </div>
          <div className="space-y-2">
            <label className="form-label">Características</label>
            <CheckBox field="similarCalories" label="Calorias semelhantes" />
            <CheckBox field="similarProtein" label="Proteína semelhante" />
            <CheckBox field="similarFunction" label="Função culinária semelhante" />
            <CheckBox field="cheaperOption" label="Opção mais barata" />
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
