import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddSubstitutionDialog } from '@/components/substitutions/AddSubstitutionDialog'
import { Shuffle, ArrowRight } from 'lucide-react'

export default async function SubstitutionsPage() {
  const substitutions = await prisma.substitution.findMany({
    include: { ingredient: true, substitute: true },
    orderBy: { ingredient: { name: 'asc' } },
  })

  const ingredients = await prisma.ingredient.findMany({ orderBy: { name: 'asc' } })

  // Group by ingredient
  const grouped: Record<string, typeof substitutions> = {}
  for (const sub of substitutions) {
    const key = sub.ingredient.name
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(sub)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title">Substituições de Ingredientes</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{substitutions.length} substituições cadastradas</p>
        </div>
        <AddSubstitutionDialog ingredients={ingredients} />
      </div>

      {substitutions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">🔄</div>
          <h3 className="font-display font-semibold text-lg mb-2">Nenhuma substituição ainda</h3>
          <p className="text-muted-foreground text-sm mb-6">Cadastra alternativas para os teus ingredientes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(grouped).map(([ingredientName, subs]) => (
            <Card key={ingredientName} className="card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">
                    <Shuffle className="w-3.5 h-3.5" />
                  </span>
                  {ingredientName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {subs.map((sub) => (
                    <div key={sub.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted">
                      <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{sub.substitute.name}</p>
                        {sub.reason && <p className="text-xs text-muted-foreground mt-0.5">{sub.reason}</p>}

                        {/* Nutrient comparison */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-2 text-xs text-muted-foreground">
                          <span>{ingredientName}: {sub.ingredient.calories} kcal / {sub.ingredient.protein}g prot</span>
                          <span>{sub.substitute.name}: {sub.substitute.calories} kcal / {sub.substitute.protein}g prot</span>
                        </div>

                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {sub.similarCalories && <span className="tag-pill">≈ calorias</span>}
                          {sub.similarProtein && <span className="tag-pill">≈ proteína</span>}
                          {sub.similarFunction && <span className="tag-pill">≈ função culinária</span>}
                          {sub.cheaperOption && (
                            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
                              💰 Mais barato
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* All ingredients overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">📦 Todos os ingredientes cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Ingrediente', 'Categoria', 'Kcal/100g', 'Prot/100g', 'HC/100g', 'Gord/100g', 'Custo/unid'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ing) => (
                  <tr key={ing.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-foreground">{ing.name}</td>
                    <td className="py-2.5 px-3 text-muted-foreground capitalize">{ing.category ?? '—'}</td>
                    <td className="py-2.5 px-3 text-amber-700">{ing.calories}</td>
                    <td className="py-2.5 px-3 text-blue-700">{ing.protein}g</td>
                    <td className="py-2.5 px-3 text-orange-700">{ing.carbs}g</td>
                    <td className="py-2.5 px-3 text-purple-700">{ing.fat}g</td>
                    <td className="py-2.5 px-3 text-muted-foreground">€{ing.costPer.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
