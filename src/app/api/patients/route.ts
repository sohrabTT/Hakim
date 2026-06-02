import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const patients = await prisma.patient.findMany({
    where: { doctorId: session.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(patients)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const patient = await prisma.patient.create({
    data: {
      doctorId: session.id,
      fullName: body.fullName,
      nationalId: body.nationalId,
      birthDate: body.birthDate,
      gender: body.gender || 'male',
      phoneNumber: body.phoneNumber,
      addressCity: body.addressCity,
      medicalHistoryUnderlyingDiseases: JSON.stringify(body.medicalHistory?.underlyingDiseases || []),
      medicalHistoryPreviousSurgeries: body.medicalHistory?.previousSurgeries,
      medicalHistoryHospitalization: body.medicalHistory?.hospitalizationHistory,
      medicalHistoryInfectiousDisease: body.medicalHistory?.infectiousDiseaseHistory,
      drugAllergies: body.allergies?.drugAllergies,
      foodAllergies: body.allergies?.foodAllergies,
      currentMedications: body.medications?.currentMedications,
      supplements: body.medications?.supplements,
      bloodPressure: body.vitalSigns?.bloodPressure,
      weight: body.vitalSigns?.weight,
      height: body.vitalSigns?.height,
      bmi: body.vitalSigns?.bmi,
      smokingAlcohol: body.lifestyle?.smokingAlcohol,
      activityLevel: body.lifestyle?.activityLevel,
      files: body.files ? JSON.stringify(body.files) : undefined,
    },
  })
  return NextResponse.json(patient)
}
