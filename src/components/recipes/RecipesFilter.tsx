'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

const CATEGORIES = [
  { value: '', label: 'Todas' },
  { value: 'breakfast', label: 'Pequeno-almoço' },
  { value: 'lunch', label: 'Almoço' },
  { value: 'dinner', label: 'Jantar' },
  { value: 'snack', label: 'Lanche' },
  { value: 'pre-workout', label: 'Pré-treino' },
  { value: 'post-workout', label: 'Pós-treino' },
]

export function RecipesFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/recipes?${params.toString()}`)
  }, [router, searchParams])

  const currentCategory = searchParams.get('category') ?? ''
  const currentFavorite = searchParams.get('favorite') === 'true'
  const currentSearch = searchParams.get('search') ?? ''

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar receitas..."
          className="pl-9"
          defaultValue={currentSearch}
          onChange={(e) => updateParam('search', e.target.value)}
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateParam('category', value)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
              currentCategory === value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-white border border-border text-muted-foreground hover:bg-accent'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Favorite toggle */}
      <button
        onClick={() => updateParam('favorite', currentFavorite ? '' : 'true')}
        className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
          currentFavorite
            ? 'bg-pink-100 text-pink-700 border border-pink-200'
            : 'bg-white border border-border text-muted-foreground hover:bg-accent'
        }`}
      >
        ❤️ Favoritas
      </button>
    </div>
  )
}
