import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get('patientId')

  const where: any = {}
  if (patientId) {
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, doctorId: session.id },
    })
    if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    where.patientId = patientId
  }

  const plans = await prisma.dietPlan.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(plans)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const plan = await prisma.dietPlan.create({
    data: {
      patientId: body.patientId,
      title: body.title,
      data: JSON.stringify(body.data),
      type: body.type || 'postOp',
    },
  })
  return NextResponse.json(plan)
}
