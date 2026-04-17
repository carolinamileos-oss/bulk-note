import { prisma } from '@/lib/prisma'
import { RecipeForm } from '@/components/recipes/RecipeForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewRecipePage() {
  const ingredients = await prisma.ingredient.findMany({ orderBy: { name: 'asc' } })
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/recipes" className="btn-ghost text-sm"><ArrowLeft className="w-4 h-4" /> Receitas</Link>
      </div>
      <div>
        <h1 className="section-title text-3xl">Nova Receita</h1>
        <p className="text-muted-foreground text-sm mt-1">Preenche os detalhes da tua receita</p>
      </div>
      <RecipeForm ingredients={ingredients} />
    </div>
  )
}
