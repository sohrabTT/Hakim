import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get('patientId')

  if (!patientId) return NextResponse.json({ error: 'patientId required' }, { status: 400 })

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, doctorId: session.id },
  })
  if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const guides = await prisma.surgeryGuide.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(guides)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const guide = await prisma.surgeryGuide.create({
    data: {
      patientId: body.patientId,
      surgeryType: body.surgeryType,
      preOp: JSON.stringify(body.preOp || []),
      postOp: JSON.stringify(body.postOp || []),
    },
  })
  return NextResponse.json(guide)
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const guide = await prisma.surgeryGuide.updateMany({
    where: { id: body.id },
    data: {
      surgeryType: body.surgeryType,
      preOp: body.preOp ? JSON.stringify(body.preOp) : undefined,
      postOp: body.postOp ? JSON.stringify(body.postOp) : undefined,
    },
  })
  return NextResponse.json({ success: true })
}
