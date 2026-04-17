import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { ShoppingListClient } from '@/components/shopping/ShoppingListClient'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'

export default async function ShoppingPage() {
  const lists = await prisma.shoppingList.findMany({
    include: { items: { orderBy: [{ isPurchased: 'asc' }, { category: 'asc' }, { name: 'asc' }] } },
    orderBy: { createdAt: 'desc' },
  })

  const plans = await prisma.mealPlan.findMany({
    orderBy: { weekStart: 'desc' },
    take: 5,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title">Lista de Compras</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{lists.length} lista(s) guardada(s)</p>
        </div>
        <Link href="/planning" className="btn-secondary text-sm">
          <ShoppingCart className="w-4 h-4" /> Gerar do planeamento
        </Link>
      </div>

      {lists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">🛒</div>
          <h3 className="font-display font-semibold text-lg mb-2">Nenhuma lista ainda</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Vai ao <Link href="/planning" className="text-primary underline">Planeamento</Link> e gera uma lista automaticamente!
          </p>
        </div>
      ) : (
        <ShoppingListClient lists={lists} />
      )}
    </div>
  )
}
