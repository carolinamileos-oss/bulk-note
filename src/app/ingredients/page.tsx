import { prisma } from '@/lib/prisma'
import { IngredientsClient } from '@/components/ingredients/IngredientsClient'

export default async function IngredientsPage() {
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { recipeIngredients: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Ingredientes</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {ingredients.length} ingredientes na base de dados
        </p>
      </div>
      <IngredientsClient initialIngredients={ingredients} />
    </div>
  )
}
