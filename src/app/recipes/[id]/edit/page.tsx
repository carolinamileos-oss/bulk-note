import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { RecipeForm } from '@/components/recipes/RecipeForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function EditRecipePage({ params }: { params: { id: string } }) {
  const [recipe, ingredients] = await Promise.all([
    prisma.recipe.findUnique({
      where: { id: params.id },
      include: { ingredients: { include: { ingredient: true } } },
    }),
    prisma.ingredient.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!recipe) notFound()

  return (
    <div className="max-w-3xl space-y-6">
      <Link href={`/recipes/${params.id}`} className="btn-ghost text-sm inline-flex">
        <ArrowLeft className="w-4 h-4" /> Voltar à receita
      </Link>
      <div>
        <h1 className="section-title text-3xl">Editar Receita</h1>
        <p className="text-muted-foreground text-sm mt-1">{recipe.name}</p>
      </div>
      <RecipeForm ingredients={ingredients} recipe={recipe as any} />
    </div>
  )
}
