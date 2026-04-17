'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'

export function DeleteRecipeButton({ recipeId, recipeName }: { recipeId: string; recipeName: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/recipes/${recipeId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao apagar')
      toast({ title: 'Receita apagada', description: `"${recipeName}" foi removida.` })
      router.push('/recipes')
      router.refresh()
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível apagar a receita.', variant: 'destructive' })
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30">
        <Trash2 className="w-4 h-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apagar receita?</DialogTitle>
            <DialogDescription>Tens a certeza que queres apagar "{recipeName}"? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? 'A apagar...' : 'Apagar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
