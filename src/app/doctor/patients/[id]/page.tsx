'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@/context/user-context'
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  Activity,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  Pill,
  AlertTriangle,
  History,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DietPlan } from '@/components/diet-plan'
import { SurgeryGuideSection } from '@/components/surgery-guide-section'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useToast } from '@/hooks/use-toast'
import { SurgeryDietForm } from '@/components/surgery-diet-form'
import { generateDietPlanAI } from '@/lib/diet-service'

interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

interface SurgeryGuide {
  id: string
  date: string
  surgeryType: string
  preOpChecklist: ChecklistItem[]
  postOpChecklist: ChecklistItem[]
}

interface Patient {
  id: string
  fullName: string
  nationalId: string
  birthDate: string
  gender: 'male' | 'female' | 'other'
  phoneNumber: string
  addressCity: string
  age?: number
  medicalHistory: {
    underlyingDiseases: string[]
    previousSurgeries: string
    hospitalizationHistory: string
    infectiousDiseaseHistory: string
  }
  allergies: {
    drugAllergies: string
    foodAllergies: string
  }
  medications: {
    currentMedications: string
    supplements: string
  }
  vitalSigns: {
    bloodPressure: string
    weight: string
    height: string
    bmi: string
  }
  lifestyle: {
    smokingAlcohol: string
    activityLevel: string
  }
  dietHistory?: { date: string, plan: any }[]
  surgeryGuides?: SurgeryGuide[]
  createdAt: string
}

// Helper for age calculation
const calculateAge = (birthDate?: string) => {
  if (!birthDate) return '-'
  try {
    // Check if it's a Jalali year (e.g., 1370/01/01 or just 1370)
    if (birthDate.includes('/') || (parseInt(birthDate) && parseInt(birthDate) > 1300 && parseInt(birthDate) < 1500)) {
      const year = parseInt(birthDate.split('/')[0])
      return 1405 - year // Current Jalali year based on 2026
    }
    // Assume Gregorian
    const year = new Date(birthDate).getFullYear()
    return 2026 - year
  } catch (e) {
    return '-'
  }
}

export default function PatientFilePage() {
  const params = useParams()
  const router = useRouter()
  const { user, authLoading } = useUser()
  const { toast } = useToast()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Diet state
  const [dietFormOpen, setDietFormOpen] = useState(false)
  const [isGeneratingDiet, setIsGeneratingDiet] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
      return
    }

    const savedPatients = localStorage.getItem('doctor-patients')
    if (savedPatients) {
      const patients = JSON.parse(savedPatients)
      const foundPatient = patients.find((p: any) => p.id === params.id)
      if (foundPatient) {
        setPatient(foundPatient)
      } else {
        router.push('/doctor/patients')
      }
    }
    setLoading(false)
  }, [params.id, user, authLoading, router])

  const savePatientData = (updatedPatient: Patient) => {
    setPatient(updatedPatient)
    const savedPatients = localStorage.getItem('doctor-patients')
    if (savedPatients) {
      const patients = JSON.parse(savedPatients)
      const updatedPatients = patients.map((p: any) => p.id === patient?.id ? updatedPatient : p)
      localStorage.setItem('doctor-patients', JSON.stringify(updatedPatients))
    }
  }

  const handleSaveGuide = (updatedGuide: SurgeryGuide) => {
    if (!patient) return
    const existingIndex = (patient.surgeryGuides || []).findIndex(g => g.id === updatedGuide.id)
    let updatedGuides = existingIndex > -1 
      ? (patient.surgeryGuides || []).map((g, i) => i === existingIndex ? updatedGuide : g)
      : [...(patient.surgeryGuides || []), updatedGuide]
    savePatientData({ ...patient, surgeryGuides: updatedGuides })
  }

  const handleDietSubmit = async (data: any) => {
    if (!patient) return
    setIsGeneratingDiet(true)
    try {
      const generatedPlan = await generateDietPlanAI(data)
      const updatedPatient = { 
        ...patient, 
        dietHistory: [...(patient.dietHistory || []), { date: new Date().toISOString(), plan: generatedPlan }] 
      }
      savePatientData(updatedPatient)
      setDietFormOpen(false)
      toast({ title: 'رژیم غذایی تولید شد', description: 'برنامه غذایی جدید در تاریخچه ذخیره شد.' })
    } catch (error) {
      toast({ variant: 'destructive', title: 'خطا', description: 'مشکلی در تولید رژیم پیش آمد.' })
    } finally {
      setIsGeneratingDiet(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!patient) return null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-[#111] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                پرونده الکترونیک
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {patient.fullName}
                </Badge>
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-1">ID: {patient.nationalId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="h-4 w-4" />
            <span>تاریخ ثبت: {new Date(patient.createdAt).toLocaleDateString('fa-IR')}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Patient Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-3xl border-none shadow-sm bg-white dark:bg-[#151515]">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                <User className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm text-slate-500">اطلاعات شخصی</p>
                <p className="font-bold text-lg">
                  {patient.age || calculateAge(patient.birthDate)} ساله، {patient.gender === 'male' ? 'مرد' : 'زن'}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <MapPin className="h-3 w-3" />
                  {patient.addressCity}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm bg-white dark:bg-[#151515]">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                <Activity className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm text-slate-500">وضعیت جسمانی</p>
                <div className="flex gap-4 mt-1">
                  <div>
                    <span className="text-xs text-slate-400">BMI</span>
                    <p className="font-bold">{patient.vitalSigns.bmi || '-'}</p>
                  </div>
                  <div className="w-px h-8 bg-slate-100 dark:bg-slate-800" />
                  <div>
                    <span className="text-xs text-slate-400">وزن</span>
                    <p className="font-bold">{patient.vitalSigns.weight || '-'} kg</p>
                  </div>
                  <div className="w-px h-8 bg-slate-100 dark:bg-slate-800" />
                  <div>
                    <span className="text-xs text-slate-400">قد</span>
                    <p className="font-bold">{patient.vitalSigns.height || '-'} cm</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm bg-white dark:bg-[#151515]">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                <Phone className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm text-slate-500">تماس</p>
                <p className="font-bold text-lg dir-ltr text-right">{patient.phoneNumber}</p>
                <p className="text-xs text-slate-400 mt-1">شماره همراه</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="diet-history" className="w-full">
          <TabsList className="w-full justify-start bg-transparent border-b border-slate-200 dark:border-slate-800 rounded-none p-0 h-auto gap-8">
            <TabsTrigger 
              value="diet-history" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none py-4 px-2 text-base"
            >
              تاریخچه رژیم‌ها
            </TabsTrigger>
            <TabsTrigger 
              value="medical-history" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none py-4 px-2 text-base"
            >
              سوابق پزشکی
            </TabsTrigger>
            <TabsTrigger 
              value="meds" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none py-4 px-2 text-base"
            >
              داروها و حساسیت‌ها
            </TabsTrigger>
            <TabsTrigger 
              value="surgery-guide" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none py-4 px-2 text-base"
            >
              Pre-op/Post-op
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diet-history" className="mt-8 space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <History className="h-6 w-6 text-green-600" />
                سوابق رژیم‌های غذایی
              </h2>
              <Button 
                onClick={() => setDietFormOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white rounded-2xl h-12 px-6 shadow-lg shadow-green-500/20 gap-2"
              >
                <Plus className="h-5 w-5" />
                تولید رژیم جدید
              </Button>
            </div>

            {patient.dietHistory && patient.dietHistory.length > 0 ? (
              patient.dietHistory.slice().reverse().map((history, index) => (
                <Card key={index} className="rounded-3xl border-none shadow-sm bg-white dark:bg-[#151515] overflow-hidden">
                  <Collapsible>
                    <CollapsibleTrigger className="w-full">
                      <div className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div className="text-right">
                            <h3 className="font-bold text-lg">برنامه رژیم غذایی هوشمند</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                              <Clock className="h-3 w-3" />
                              {new Date(history.date).toLocaleDateString('fa-IR')} - ساعت {new Date(history.date).toLocaleTimeString('fa-IR')}
                            </div>
                          </div>
                        </div>
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800">
                        {history.plan.postOp && (
                          <div className="mt-6">
                            <Badge variant="outline" className="mb-4">رژیم بعد از عمل</Badge>
                            <DietPlan data={history.plan.postOp} patientName={patient.fullName} type="postOp" />
                          </div>
                        )}
                        {history.plan.preOp && (
                          <div className="mt-8 pt-8 border-t border-dashed border-slate-200 dark:border-slate-800">
                            <Badge variant="outline" className="mb-4">رژیم قبل از عمل</Badge>
                            <DietPlan data={history.plan.preOp} patientName={patient.fullName} type="preOp" />
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 bg-white dark:bg-[#151515] rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <History className="h-10 w-10" />
                </div>
                <p className="text-slate-500 text-lg font-medium">هنوز هیچ رژیم غذایی برای این بیمار ثبت نشده است.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="medical-history" className="mt-8">
            <Card className="rounded-3xl border-none shadow-sm bg-white dark:bg-[#151515]">
              <CardHeader>
                <CardTitle>سوابق پزشکی</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-500 mb-3">بیماری‌های زمینه‌ای</h4>
                  <div className="flex flex-wrap gap-2">
                    {patient.medicalHistory.underlyingDiseases.length > 0 ? (
                      patient.medicalHistory.underlyingDiseases.map(d => (
                        <Badge key={d} variant="secondary" className="px-3 py-1.5">{d}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">موردی ثبت نشده</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                    <h4 className="text-sm font-bold text-slate-500 mb-2">سوابق جراحی</h4>
                    <p className="text-sm leading-relaxed">{patient.medicalHistory.previousSurgeries || 'موردی ثبت نشده'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                    <h4 className="text-sm font-bold text-slate-500 mb-2">سوابق بستری</h4>
                    <p className="text-sm leading-relaxed">{patient.medicalHistory.hospitalizationHistory || 'موردی ثبت نشده'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meds" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-3xl border-none shadow-sm bg-white dark:bg-[#151515]">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
                    <Pill className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">داروها و مکمل‌ها</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 mb-2">داروهای فعلی</h4>
                    <p className="text-sm bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl min-h-[80px]">
                      {patient.medications.currentMedications || 'موردی ثبت نشده'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 mb-2">مکمل‌ها</h4>
                    <p className="text-sm bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl min-h-[80px]">
                      {patient.medications.supplements || 'موردی ثبت نشده'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-none shadow-sm bg-white dark:bg-[#151515]">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">حساسیت‌ها</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 mb-2">حساسیت دارویی</h4>
                    <p className="text-sm bg-red-50/50 dark:bg-red-900/10 p-4 rounded-2xl min-h-[80px] text-red-800 dark:text-red-300">
                      {patient.allergies.drugAllergies || 'موردی ثبت نشده'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 mb-2">حساسیت غذایی</h4>
                    <p className="text-sm bg-red-50/50 dark:bg-red-900/10 p-4 rounded-2xl min-h-[80px] text-red-800 dark:text-red-300">
                      {patient.allergies.foodAllergies || 'موردی ثبت نشده'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="surgery-guide" className="mt-8">
            <SurgeryGuideSection 
              patient={patient} 
              existingGuides={patient.surgeryGuides || []} 
              onSave={handleSaveGuide}
            />
          </TabsContent>
        </Tabs>
      </main>

      <SurgeryDietForm 
        isOpen={dietFormOpen} 
        onClose={() => setDietFormOpen(false)} 
        onSubmit={handleDietSubmit}
        initialData={patient}
        isLoading={isGeneratingDiet}
      />
    </div>
  )
}
