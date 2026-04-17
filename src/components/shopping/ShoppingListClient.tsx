'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react'

interface ShoppingItem {
  id: string; name: string; quantity: number; unit: string; estimatedCost: number
  isPurchased: boolean; category: string | null; usedInCount: number
}

interface ShoppingList {
  id: string; name: string; createdAt: Date
  items: ShoppingItem[]
}

export function ShoppingListClient({ lists }: { lists: ShoppingList[] }) {
  const router = useRouter()
  const [activeList, setActiveList] = useState(lists[0]?.id ?? null)
  const [toggledItems, setToggledItems] = useState<Record<string, boolean>>({})
  const [groupByCategory, setGroupByCategory] = useState(true)

  const currentList = lists.find(l => l.id === activeList)
  if (!currentList) return null

  async function toggleItem(item: ShoppingItem) {
    const newVal = !((toggledItems[item.id] !== undefined) ? toggledItems[item.id] : item.isPurchased)
    setToggledItems(prev => ({ ...prev, [item.id]: newVal }))
    try {
      await fetch(`/api/shopping-list/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPurchased: newVal }),
      })
    } catch {
      setToggledItems(prev => ({ ...prev, [item.id]: !newVal }))
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  function getItemState(item: ShoppingItem) {
    return toggledItems[item.id] !== undefined ? toggledItems[item.id] : item.isPurchased
  }

  const items = currentList.items
  const totalCost = items.reduce((acc, i) => acc + i.estimatedCost, 0)
  const purchasedCost = items.filter(i => getItemState(i)).reduce((acc, i) => acc + i.estimatedCost, 0)
  const purchasedCount = items.filter(i => getItemState(i)).length

  // Group by category
  const grouped: Record<string, ShoppingItem[]> = {}
  for (const item of items) {
    const cat = item.category ?? 'Outros'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  }

  const categoryEmojis: Record<string, string> = {
    proteins: '🥩', dairy: '🥛', fruits: '🍌', vegetables: '🥦',
    grains: '🌾', fats: '🫒', supplements: '💊', nuts: '🥜',
    sweeteners: '🍯', sauces: '🥫', other: '📦', Outros: '📦',
  }

  return (
    <div className="space-y-4">
      {/* List selector if multiple */}
      {lists.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {lists.map(list => (
            <button key={list.id} onClick={() => setActiveList(list.id)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${activeList === list.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-white border-border text-muted-foreground hover:bg-accent'}`}>
              {list.name}
            </button>
          ))}
        </div>
      )}

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display font-semibold">{currentList.name}</h2>
            <p className="text-sm text-muted-foreground">{purchasedCount} de {items.length} itens comprados</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-primary">{formatCurrency(purchasedCost)}</p>
            <p className="text-xs text-muted-foreground">de {formatCurrency(totalCost)}</p>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${items.length > 0 ? (purchasedCount / items.length) * 100 : 0}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-4">
          <button onClick={() => setGroupByCategory(!groupByCategory)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            {groupByCategory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {groupByCategory ? 'Vista simples' : 'Agrupar por categoria'}
          </button>
        </div>
      </div>

      {/* Items */}
      {groupByCategory ? (
        <div className="space-y-4">
          {Object.entries(grouped).map(([category, catItems]) => {
            const allDone = catItems.every(i => getItemState(i))
            return (
              <div key={category} className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className={`px-5 py-3 border-b border-border flex items-center gap-2 ${allDone ? 'bg-muted' : ''}`}>
                  <span>{categoryEmojis[category] ?? '📦'}</span>
                  <h3 className="font-semibold text-sm capitalize">{category}</h3>
                  <span className="text-xs text-muted-foreground ml-auto">{catItems.filter(i => getItemState(i)).length}/{catItems.length}</span>
                </div>
                <div className="divide-y divide-border">
                  {catItems.map(item => (
                    <ShoppingItemRow key={item.id} item={item} isPurchased={getItemState(item)} onToggle={() => toggleItem(item)} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {items.map(item => (
              <ShoppingItemRow key={item.id} item={item} isPurchased={getItemState(item)} onToggle={() => toggleItem(item)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ShoppingItemRow({ item, isPurchased, onToggle }: { item: ShoppingItem; isPurchased: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-muted/50 transition-colors group ${isPurchased ? 'opacity-60' : ''}`}
    >
      <div className={`shrink-0 transition-colors ${isPurchased ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`}>
        {isPurchased ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isPurchased ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {item.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {Math.round(item.quantity * 10) / 10} {item.unit}
          {item.usedInCount > 1 && ` · usado em ${item.usedInCount} receitas`}
        </p>
      </div>
      <p className="text-sm font-medium text-muted-foreground shrink-0">{formatCurrency(item.estimatedCost)}</p>
    </button>
  )
}
