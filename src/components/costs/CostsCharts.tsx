'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  costByCategory: { name: string; avg: number }[]
  topCostRecipes: { name: string; cost: number }[]
}

const COLORS = ['#5a8059', '#7ba07b', '#a9c1a9', '#d0ddd0', '#eecf87', '#e6b85e']

export function CostsCharts({ costByCategory, topCostRecipes }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Custo médio por categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={costByCategory} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8a9a8a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8a9a8a' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} />
              <Tooltip
                formatter={(v: number) => [`€${v.toFixed(2)}`, 'Custo médio/porção']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e8eee8', fontSize: '12px' }}
              />
              <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                {costByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Receitas mais caras por porção</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topCostRecipes} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: '#8a9a8a' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#8a9a8a' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip
                formatter={(v: number) => [`€${v.toFixed(2)}`, 'Custo/porção']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e8eee8', fontSize: '12px' }}
              />
              <Bar dataKey="cost" radius={[0, 6, 6, 0]}>
                {topCostRecipes.map((_, i) => <Cell key={i} fill={i === 0 ? '#e6b85e' : '#a9c1a9'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
