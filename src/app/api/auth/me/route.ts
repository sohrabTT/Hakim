import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId as string },
      select: { id: true, username: true },
    })

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
