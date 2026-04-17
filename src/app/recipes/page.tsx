import { prisma } from '@/lib/prisma'
import { formatCurrency, calculateRecipeMacros, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Heart, Star, Clock, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { RecipesFilter } from '@/components/recipes/RecipesFilter'

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: { category?: string; favorite?: string; search?: string; rating?: string }
}) {
  const where: Record<string, unknown> = {}
  if (searchParams.category) where.category = searchParams.category
  if (searchParams.favorite === 'true') where.isFavorite = true
  if (searchParams.rating) where.rating = { gte: parseInt(searchParams.rating) }
  if (searchParams.search) where.name = { contains: searchParams.search }

  const recipes = await prisma.recipe.findMany({
    where,
    include: { ingredients: { include: { ingredient: true } } },
    orderBy: [{ isFavorite: 'desc' }, { createdAt: 'desc' }],
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Receitas</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{recipes.length} receitas guardadas</p>
        </div>
        <Link href="/recipes/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Nova Receita
        </Link>
      </div>

      {/* Filters */}
      <RecipesFilter />

      {/* Grid */}
      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">🍽️</div>
          <h3 className="font-display font-semibold text-lg text-foreground mb-2">Nenhuma receita encontrada</h3>
          <p className="text-muted-foreground text-sm mb-6">Começa por adicionar a tua primeira receita!</p>
          <Link href="/recipes/new" className="btn-primary">
            <Plus className="w-4 h-4" /> Criar primeira receita
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {recipes.map((recipe) => {
            const macros = calculateRecipeMacros(recipe.ingredients)
            const perServing = {
              calories: macros.calories / recipe.servings,
              protein: macros.protein / recipe.servings,
              cost: macros.cost / recipe.servings,
            }
            const tags = recipe.tags ? JSON.parse(recipe.tags) as string[] : []

            return (
              <Link key={recipe.id} href={`/recipes/${recipe.id}`}
                className="bg-white rounded-2xl border border-border p-5 card-hover flex flex-col gap-3 group">
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {recipe.name}
                    </h3>
                    <Badge variant="sage" className="mt-1.5 text-xs">
                      {CATEGORY_LABELS[recipe.category] ?? recipe.category}
                    </Badge>
                  </div>
                  {recipe.isFavorite && (
                    <Heart className="w-4 h-4 text-pink-500 fill-pink-500 shrink-0 mt-0.5" />
                  )}
                </div>

                {/* Description */}
                {recipe.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{recipe.description}</p>
                )}

                {/* Macros */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-amber-50 rounded-xl p-2.5 text-center">
                    <p className="text-xs text-amber-700 font-medium">Kcal</p>
                    <p className="text-sm font-semibold text-amber-800">{Math.round(perServing.calories)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-2.5 text-center">
                    <p className="text-xs text-blue-700 font-medium">Prot</p>
                    <p className="text-sm font-semibold text-blue-800">{Math.round(perServing.protein)}g</p>
                  </div>
                  <div className="bg-sage-50 rounded-xl p-2.5 text-center">
                    <p className="text-xs text-sage-700 font-medium">Custo</p>
                    <p className="text-sm font-semibold text-sage-800">{formatCurrency(perServing.cost)}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {recipe.prepTime && (
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{recipe.prepTime}min</span>
                    )}
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{recipe.servings} porç.</span>
                  </div>
                  {recipe.rating && (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: recipe.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="tag-pill">{tag}</span>
                    ))}
                    {tags.length > 3 && <span className="tag-pill">+{tags.length - 3}</span>}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
