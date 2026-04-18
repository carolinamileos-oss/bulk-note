export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const ingredients = await prisma.ingredient.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(ingredients)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  try {
    const ingredient = await prisma.ingredient.create({ data: body })
    return NextResponse.json(ingredient, { status: 201 })
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Ingrediente já existe' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
