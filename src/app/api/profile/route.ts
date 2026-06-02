import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.profile.findUnique({
    where: { userId: session.id },
  })
  return NextResponse.json(profile || {})
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const profile = await prisma.profile.upsert({
    where: { userId: session.id },
    update: {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      age: body.age ? parseInt(body.age) : undefined,
      location: body.location,
      language: body.language,
      role: body.role,
      specialization: body.specialization,
      level: body.level,
      department: body.department,
    },
    create: {
      userId: session.id,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      age: body.age ? parseInt(body.age) : undefined,
      location: body.location,
      language: body.language || 'fa',
      role: body.role || 'patient',
      specialization: body.specialization,
      level: body.level,
      department: body.department,
    },
  })
  return NextResponse.json(profile)
}
