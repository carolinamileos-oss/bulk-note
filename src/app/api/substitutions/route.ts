import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const subs = await prisma.substitution.findMany({
    include: { ingredient: true, substitute: true },
    orderBy: { ingredient: { name: 'asc' } },
  })
  return NextResponse.json(subs)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  try {
    const sub = await prisma.substitution.create({
      data: {
        ingredientId: body.ingredientId,
        substituteId: body.substituteId,
        reason: body.reason || null,
        similarCalories: body.similarCalories ?? false,
        similarProtein: body.similarProtein ?? false,
        similarFunction: body.similarFunction ?? false,
        cheaperOption: body.cheaperOption ?? false,
      },
      include: { ingredient: true, substitute: true },
    })
    return NextResponse.json(sub, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
  await prisma.substitution.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
