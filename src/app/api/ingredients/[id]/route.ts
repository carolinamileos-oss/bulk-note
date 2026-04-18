export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  try {
    const ingredient = await prisma.ingredient.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(ingredient)
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Já existe um ingrediente com esse nome' }, { status: 400 })
    }
    if (e.code === 'P2025') {
      return NextResponse.json({ error: 'Ingrediente não encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erro ao atualizar ingrediente' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const usageCount = await prisma.recipeIngredient.count({
    where: { ingredientId: params.id },
  })

  if (usageCount > 0) {
    return NextResponse.json(
      { error: `Este ingrediente está a ser usado em ${usageCount} receita(s) e não pode ser apagado.` },
      { status: 409 }
    )
  }

  try {
    await prisma.ingredient.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    if (e.code === 'P2025') {
      return NextResponse.json({ error: 'Ingrediente não encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erro ao apagar ingrediente' }, { status: 500 })
  }
}
