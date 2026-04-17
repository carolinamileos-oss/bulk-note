'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  weeklyChart: { day: string; cost: number }[]
  recipeUsage: { name: string; count: number }[]
}

const COLORS = ['#5a8059', '#7ba07b', '#a9c1a9', '#d0ddd0', '#e8eee8']

export function DashboardCharts({ weeklyChart, recipeUsage }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">💰 Gastos dos últimos 7 dias</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyChart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#8a9a8a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8a9a8a' }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
              <Tooltip
                formatter={(value: number) => [`€${value.toFixed(2)}`, 'Gasto']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e8eee8', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '13px' }}
              />
              <Bar dataKey="cost" radius={[6, 6, 0, 0]} fill="#5a8059" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">🍽️ Receitas mais usadas</CardTitle>
        </CardHeader>
        <CardContent>
          {recipeUsage.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Sem dados ainda</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={recipeUsage} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#8a9a8a' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#8a9a8a' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip
                  formatter={(value: number) => [value, 'vezes']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e8eee8', fontSize: '13px' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {recipeUsage.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
