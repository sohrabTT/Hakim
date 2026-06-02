import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const chat = await prisma.chatSession.findFirst({
    where: { id, userId: session.id },
  })
  if (!chat) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(chat)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const body = await request.json()
  const chat = await prisma.chatSession.updateMany({
    where: { id, userId: session.id },
    data: {
      title: body.title,
      messages: body.messages ? JSON.stringify(body.messages) : undefined,
    },
  })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  await prisma.chatSession.deleteMany({
    where: { id, userId: session.id },
  })
  return NextResponse.json({ success: true })
}
