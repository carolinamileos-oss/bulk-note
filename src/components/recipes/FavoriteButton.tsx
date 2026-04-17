'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

export function FavoriteButton({ recipeId, isFavorite }: { recipeId: string; isFavorite: boolean }) {
  const [fav, setFav] = useState(isFavorite)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    try {
      await fetch(`/api/recipes/${recipeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !fav }),
      })
      setFav(!fav)
      toast({ title: fav ? 'Removido dos favoritos' : '❤️ Adicionado aos favoritos' })
      router.refresh()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle} disabled={loading}
      className={fav ? 'text-pink-500 border-pink-200 bg-pink-50 hover:bg-pink-100' : ''}>
      <Heart className={`w-4 h-4 ${fav ? 'fill-pink-500 text-pink-500' : ''}`} />
    </Button>
  )
}
