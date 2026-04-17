import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const item = await prisma.shoppingListItem.update({
    where: { id: params.id },
    data: { isPurchased: body.isPurchased },
  })
  return NextResponse.json(item)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.shoppingListItem.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
