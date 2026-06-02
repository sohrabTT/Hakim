import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const chats = await prisma.chatSession.findMany({
    where: { userId: session.id },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json(chats)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const chat = await prisma.chatSession.create({
    data: {
      userId: session.id,
      title: body.title || 'گفتگوی جدید',
      patientId: body.patientId,
      messages: JSON.stringify(body.messages || []),
    },
  })
  return NextResponse.json(chat)
}
