import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatCurrency, calculateRecipeMacros, CATEGORY_LABELS, OPINION_LABELS } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Heart, Star, Clock, Users, Edit, CheckCircle2, XCircle } from 'lucide-react'
import { DeleteRecipeButton } from '@/components/recipes/DeleteRecipeButton'
import { FavoriteButton } from '@/components/recipes/FavoriteButton'

export default async function RecipeDetailPage({ params }: { params: { id: string } }) {
  const recipe = await prisma.recipe.findUnique({
    where: { id: params.id },
    include: {
      ingredients: { include: { ingredient: true } },
      mealHistory: { orderBy: { date: 'desc' }, take: 10 },
    },
  })

  if (!recipe) notFound()

  const macros = calculateRecipeMacros(recipe.ingredients)
  const perServing = {
    calories: macros.calories / recipe.servings,
    protein: macros.protein / recipe.servings,
    carbs: macros.carbs / recipe.servings,
    fat: macros.fat / recipe.servings,
    cost: macros.cost / recipe.servings,
  }
  const tags = recipe.tags ? JSON.parse(recipe.tags) as string[] : []
  const totalUses = recipe.mealHistory.length

  // Get substitutions for ingredients
  const ingredientIds = recipe.ingredients.map(i => i.ingredientId)
  const substitutions = await prisma.substitution.findMany({
    where: { ingredientId: { in: ingredientIds } },
    include: { ingredient: true, substitute: true },
  })

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + Actions */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/recipes" className="btn-ghost text-sm">
          <ArrowLeft className="w-4 h-4" /> Receitas
        </Link>
        <div className="flex items-center gap-2">
          <FavoriteButton recipeId={recipe.id} isFavorite={recipe.isFavorite} />
          <Link href={`/recipes/${recipe.id}/edit`} className="btn-secondary text-sm">
            <Edit className="w-4 h-4" /> Editar
          </Link>
          <DeleteRecipeButton recipeId={recipe.id} recipeName={recipe.name} />
        </div>
      </div>

      {/* Title */}
      <div>
        <div className="flex items-center gap-3 flex-wrap mb-2">
          <Badge variant="sage">{CATEGORY_LABELS[recipe.category] ?? recipe.category}</Badge>
          {recipe.isFavorite && <Badge variant="pink" className="bg-pink-100 text-pink-700">❤️ Favorita</Badge>}
          {recipe.rating && (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < recipe.rating! ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} />
              ))}
            </div>
          )}
        </div>
        <h1 className="section-title text-3xl">{recipe.name}</h1>
        {recipe.description && <p className="text-muted-foreground mt-2">{recipe.description}</p>}

        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          {recipe.prepTime && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{recipe.prepTime} min</span>}
          <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{recipe.servings} porções</span>
          <span>📊 {totalUses} vezes consumida</span>
        </div>
      </div>

      {/* Macros Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Calorias/porção', value: `${Math.round(perServing.calories)} kcal`, color: 'bg-amber-50 text-amber-800 border-amber-200' },
          { label: 'Proteína/porção', value: `${Math.round(perServing.protein)}g`, color: 'bg-blue-50 text-blue-800 border-blue-200' },
          { label: 'Hidratos/porção', value: `${Math.round(perServing.carbs)}g`, color: 'bg-orange-50 text-orange-800 border-orange-200' },
          { label: 'Gordura/porção', value: `${Math.round(perServing.fat)}g`, color: 'bg-purple-50 text-purple-800 border-purple-200' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-2xl border p-4 text-center ${color}`}>
            <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
            <p className="text-xl font-display font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingredients */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">🥗 Ingredientes</CardTitle>
            <p className="text-xs text-muted-foreground">Custo total: <span className="font-semibold text-foreground">{formatCurrency(macros.cost)}</span> · Por porção: <span className="font-semibold text-foreground">{formatCurrency(perServing.cost)}</span></p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recipe.ingredients.map((ri) => {
                const factor = (ri.unit === 'g' || ri.unit === 'ml') ? ri.quantity / 100 : ri.quantity
                const cal = ri.ingredient.calories * factor
                const prot = ri.ingredient.protein * factor
                const cost = ri.ingredient.costPer * ri.quantity
                return (
                  <div key={ri.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{ri.ingredient.name}</p>
                      <p className="text-xs text-muted-foreground">{ri.quantity} {ri.unit} · {Math.round(cal)} kcal · {Math.round(prot)}g prot</p>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">{formatCurrency(cost)}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Prep Method */}
        {recipe.prepMethod && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">👨‍🍳 Modo de Preparo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recipe.prepMethod.split('\n').filter(Boolean).map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-foreground leading-relaxed">{step.replace(/^\d+\.\s*/, '')}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Personal Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">📝 Notas Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recipe.opinion && (
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Opinião</p>
                <p className="text-sm font-medium">{OPINION_LABELS[recipe.opinion] ?? recipe.opinion}</p>
              </div>
            )}
            {recipe.bestTime && (
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Melhor horário</p>
                <p className="text-sm font-medium">⏰ {recipe.bestTime}</p>
              </div>
            )}
            {recipe.wouldRepeat !== null && recipe.wouldRepeat !== undefined && (
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Voltaria a fazer?</p>
                <div className="flex items-center gap-1.5">
                  {recipe.wouldRepeat
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    : <XCircle className="w-4 h-4 text-red-400" />}
                  <p className="text-sm font-medium">{recipe.wouldRepeat ? 'Sim' : 'Não'}</p>
                </div>
              </div>
            )}
            {recipe.worthCost !== null && recipe.worthCost !== undefined && (
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Vale financeiramente?</p>
                <div className="flex items-center gap-1.5">
                  {recipe.worthCost
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    : <XCircle className="w-4 h-4 text-red-400" />}
                  <p className="text-sm font-medium">{recipe.worthCost ? 'Sim' : 'Não'}</p>
                </div>
              </div>
            )}
          </div>
          {recipe.notes && (
            <div className="mt-4 bg-cream-100 rounded-xl p-4 border border-cream-300">
              <p className="text-xs text-muted-foreground mb-1">Observações</p>
              <p className="text-sm text-foreground">{recipe.notes}</p>
            </div>
          )}
          {recipe.wouldChange && (
            <div className="mt-3 bg-amber-50 rounded-xl p-4 border border-amber-200">
              <p className="text-xs text-muted-foreground mb-1">Mudaria alguma coisa?</p>
              <p className="text-sm text-foreground">{recipe.wouldChange}</p>
            </div>
          )}
          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag: string) => <span key={tag} className="tag-pill">{tag}</span>)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Substitutions */}
      {substitutions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">🔄 Substituições sugeridas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {substitutions.map((sub) => (
                <div key={sub.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{sub.ingredient.name} → <span className="text-primary">{sub.substitute.name}</span></p>
                    {sub.reason && <p className="text-xs text-muted-foreground mt-0.5">{sub.reason}</p>}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {sub.similarProtein && <span className="tag-pill">Similar em proteína</span>}
                      {sub.similarCalories && <span className="tag-pill">Similar em calorias</span>}
                      {sub.cheaperOption && <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-medium">Mais barato</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {recipe.mealHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">📅 Histórico recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recipe.mealHistory.slice(0, 5).map((h) => (
                <div key={h.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{new Date(h.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="text-xs text-muted-foreground">{h.servings} porção(ões) · {h.mealType}</p>
                  </div>
                  {h.satisfaction && (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: h.satisfaction }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
