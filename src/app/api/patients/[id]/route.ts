import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const patient = await prisma.patient.findFirst({
    where: { id, doctorId: session.id },
    include: { dietPlans: { orderBy: { createdAt: 'desc' } }, surgeryGuides: { orderBy: { createdAt: 'desc' } } },
  })
  if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(patient)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const body = await request.json()
  const patient = await prisma.patient.updateMany({
    where: { id, doctorId: session.id },
    data: {
      fullName: body.fullName,
      nationalId: body.nationalId,
      birthDate: body.birthDate,
      gender: body.gender,
      phoneNumber: body.phoneNumber,
      addressCity: body.addressCity,
      medicalHistoryUnderlyingDiseases: body.medicalHistoryUnderlyingDiseases,
      medicalHistoryPreviousSurgeries: body.medicalHistoryPreviousSurgeries,
      medicalHistoryHospitalization: body.medicalHistoryHospitalization,
      medicalHistoryInfectiousDisease: body.medicalHistoryInfectiousDisease,
      drugAllergies: body.drugAllergies,
      foodAllergies: body.foodAllergies,
      currentMedications: body.currentMedications,
      supplements: body.supplements,
      bloodPressure: body.bloodPressure,
      weight: body.weight,
      height: body.height,
      bmi: body.bmi,
      smokingAlcohol: body.smokingAlcohol,
      activityLevel: body.activityLevel,
    },
  })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  await prisma.patient.deleteMany({
    where: { id, doctorId: session.id },
  })
  return NextResponse.json({ success: true })
}
