'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@/context/user-context'
import { useRouter } from 'next/navigation'
import {
  Users,
  Plus,
  Search,
  Phone,
  MapPin,
  User,
  Trash2,
  Eye,
  ArrowLeft,
  Activity,
  Sun,
  Moon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SurgeryDietForm } from '@/components/surgery-diet-form'
import { generateDietPlanAI } from '@/lib/diet-service'
import { DietPlan } from '@/components/diet-plan'
import { useTheme } from 'next-themes'

interface Patient {
  id: string
  fullName: string
  nationalId: string
  birthDate?: string
  gender: string
  phoneNumber?: string
  addressCity?: string
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
  files: string[]
  dietHistory?: { date: string, plan: any }[]
  createdAt: string
}

const UNDERLYING_DISEASES = [
  { id: 'diabetes', label: 'دیابت' },
  { id: 'hypertension', label: 'فشار خون' },
  { id: 'heart', label: 'قلبی' },
  { id: 'kidney', label: 'کلیوی' },
  { id: 'liver', label: 'کبدی' },
  { id: 'thyroid', label: 'تیروئید' },
]

export default function PatientsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { user, profile, authLoading } = useUser()

  useEffect(() => {
    setMounted(true)
  }, [])
  const router = useRouter()
  const { toast } = useToast()
  
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)
  const [dietFormOpen, setDietFormOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [dietResult, setDietResult] = useState<{ preOp: any, postOp: any } | null>(null)
  const [dietResultOpen, setDietResultOpen] = useState(false)
  const [isGeneratingDiet, setIsGeneratingDiet] = useState(false)

  const [formData, setFormData] = useState<Partial<Patient>>({
    gender: 'male',
    medicalHistory: {
      underlyingDiseases: [],
      previousSurgeries: '',
      hospitalizationHistory: '',
      infectiousDiseaseHistory: '',
    },
    allergies: {
      drugAllergies: '',
      foodAllergies: '',
    },
    medications: {
      currentMedications: '',
      supplements: '',
    },
    vitalSigns: {
      bloodPressure: '',
      weight: '',
      height: '',
      bmi: '',
    },
    lifestyle: {
      smokingAlcohol: '',
      activityLevel: '',
    },
    files: []
  })

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'doctor')) {
      router.push('/')
    }
    loadPatients()
  }, [user, profile, authLoading, router])

  const loadPatients = async () => {
    try {
      const res = await fetch('/api/patients')
      if (res.ok) {
        const data = await res.json()
        const mapped = data.map((p: any) => ({
          id: p.id,
          fullName: p.fullName,
          nationalId: p.nationalId,
          birthDate: p.birthDate,
          gender: p.gender,
          phoneNumber: p.phoneNumber,
          addressCity: p.addressCity,
          medicalHistory: {
            underlyingDiseases: JSON.parse(p.medicalHistoryUnderlyingDiseases || '[]'),
            previousSurgeries: p.medicalHistoryPreviousSurgeries || '',
            hospitalizationHistory: p.medicalHistoryHospitalization || '',
            infectiousDiseaseHistory: p.medicalHistoryInfectiousDisease || '',
          },
          allergies: {
            drugAllergies: p.drugAllergies || '',
            foodAllergies: p.foodAllergies || '',
          },
          medications: {
            currentMedications: p.currentMedications || '',
            supplements: p.supplements || '',
          },
          vitalSigns: {
            bloodPressure: p.bloodPressure || '',
            weight: p.weight || '',
            height: p.height || '',
            bmi: p.bmi || '',
          },
          lifestyle: {
            smokingAlcohol: p.smokingAlcohol || '',
            activityLevel: p.activityLevel || '',
          },
          files: p.files ? JSON.parse(p.files) : [],
          createdAt: p.createdAt,
        }))
        setPatients(mapped)
      }
    } catch (error) {
      console.error('Failed to load patients:', error)
    }
  }

  const calculateBMI = (weight: string, height: string) => {
    const w = parseFloat(weight)
    const h = parseFloat(height) / 100
    if (w > 0 && h > 0) {
      return (w / (h * h)).toFixed(1)
    }
    return ''
  }

  useEffect(() => {
    if (formData.vitalSigns?.weight && formData.vitalSigns?.height) {
      const bmi = calculateBMI(formData.vitalSigns.weight, formData.vitalSigns.height)
      setFormData(prev => ({
        ...prev,
        vitalSigns: {
          ...prev.vitalSigns!,
          bmi
        }
      }))
    }
  }, [formData.vitalSigns?.weight, formData.vitalSigns?.height])

  const handleAddPatient = async () => {
    if (!formData.fullName || !formData.nationalId) {
      toast({
        variant: 'destructive',
        title: 'خطا در ثبت',
        description: 'نام و کد ملی بیمار الزامی است.',
      })
      return
    }

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        toast({
          title: 'بیمار اضافه شد',
          description: `پرونده بیمار ${formData.fullName} با موفقیت ایجاد شد.`,
        })
        setIsAddPatientOpen(false)
        setFormData({
          gender: 'male',
          medicalHistory: {
            underlyingDiseases: [],
            previousSurgeries: '',
            hospitalizationHistory: '',
            infectiousDiseaseHistory: '',
          },
          allergies: {
            drugAllergies: '',
            foodAllergies: '',
          },
          medications: {
            currentMedications: '',
            supplements: '',
          },
          vitalSigns: {
            bloodPressure: '',
            weight: '',
            height: '',
            bmi: '',
          },
          lifestyle: {
            smokingAlcohol: '',
            activityLevel: '',
          },
          files: []
        })
        loadPatients()
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'مشکلی در ثبت بیمار پیش آمد.',
      })
    }
  }

  const handleDeletePatient = async (id: string) => {
    try {
      await fetch(`/api/patients/${id}`, { method: 'DELETE' })
      toast({
        title: 'بیمار حذف شد',
        description: 'پرونده بیمار با موفقیت حذف شد.',
      })
      loadPatients()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'مشکلی در حذف بیمار پیش آمد.',
      })
    }
  }

  const handleOpenDietForm = (patient: Patient) => {
    setSelectedPatient(patient)
    setDietFormOpen(true)
  }

  const handleDietSubmit = async (data: any) => {
    setIsGeneratingDiet(true)
    toast({
      title: 'شروع تحلیل هوشمند',
      description: 'هوش مصنوعی در حال تحلیل اطلاعات و تولید برنامه غذایی است...',
    })
    try {
      const generatedPlan = await generateDietPlanAI(data)
      setDietResult(generatedPlan)
      setDietFormOpen(false)
      setDietResultOpen(true)

      if (selectedPatient) {
        await fetch('/api/diet-plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: selectedPatient.id,
            title: `رژیم غذایی ${selectedPatient.fullName}`,
            data: generatedPlan,
          }),
        })
        toast({
          title: 'رژیم غذایی تولید شد',
          description: 'برنامه غذایی با موفقیت ایجاد و در سوابق بیمار ذخیره شد.',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطا در تولید رژیم',
        description: 'متاسفانه مشکلی در ارتباط با هوش مصنوعی پیش آمده است.',
      })
    } finally {
      setIsGeneratingDiet(false)
    }
  }

  const filteredPatients = patients.filter(p => 
    (p.fullName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (p.nationalId || '').includes(searchQuery)
  )

  if (authLoading || !user || profile?.role !== 'doctor') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center">
      <header className="w-full bg-white/80 dark:bg-[#0c0c0c]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()} 
              className="rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-green-500/10">
                  <Users className="h-6 w-6 stroke-[1.5]" />
                </div>
                <span className="absolute top-2 -left-12 font-nastaliq text-2xl text-slate-900 dark:text-white drop-shadow-sm">حکیم</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              {!mounted ? (
                <div className="h-5 w-5" />
              ) : theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-500" />
              ) : (
                <Moon className="h-5 w-5 text-blue-600" />
              )}
            </Button>
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-xs font-bold border border-green-100 dark:border-green-900/30">
              <Activity className="h-3.5 w-3.5" />
              {patients.length} بیمار فعال
            </div>
          </div>
        </div>
      </header>

      <main className="w-full max-w-6xl p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-slate-50/50 dark:bg-slate-900/30 p-6 rounded-3xl">
          <div className="relative flex-1 w-full group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-green-500 transition-colors" />
            <Input 
              placeholder="جستجوی نام بیمار یا کد ملی..." 
              className="pr-12 h-14 text-lg rounded-2xl border-none bg-white dark:bg-slate-800 focus-visible:ring-green-500 transition-all shadow-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white gap-2 h-14 px-8 text-lg rounded-2xl shadow-none transition-all hover:scale-105 active:scale-95">
                <Plus className="h-6 w-6" />
                افزودن بیمار جدید
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">ایجاد پرونده الکترونیک بیمار</DialogTitle>
                <DialogDescription>
                  اطلاعات بیمار را با دقت وارد کنید.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-8 py-4">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <TabsTrigger value="basic" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-600">پایه</TabsTrigger>
                    <TabsTrigger value="medical" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-600">پزشکی</TabsTrigger>
                    <TabsTrigger value="allergies" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-600">حساسیت</TabsTrigger>
                    <TabsTrigger value="meds" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-600">داروها</TabsTrigger>
                    <TabsTrigger value="vitals" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-600">علائم</TabsTrigger>
                    <TabsTrigger value="lifestyle" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-600">سبک</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">نام و نام خانوادگی</Label>
                        <Input id="fullName" placeholder="مثلاً: علی رضایی" value={formData.fullName || ''} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nationalId">کد ملی</Label>
                        <Input id="nationalId" placeholder="10 رقم" value={formData.nationalId || ''} onChange={(e) => setFormData({...formData, nationalId: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">تاریخ تولد</Label>
                        <Input id="birthDate" type="text" placeholder="1370/01/01" value={formData.birthDate || ''} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">جنسیت</Label>
                        <Select value={formData.gender} onValueChange={(v: any) => setFormData({...formData, gender: v})}>
                          <SelectTrigger className="h-12 rounded-xl w-full">
                            <SelectValue placeholder="انتخاب کنید" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="male">مرد</SelectItem>
                            <SelectItem value="female">زن</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">شماره تماس</Label>
                        <Input id="phone" placeholder="0912..." value={formData.phoneNumber || ''} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">آدرس (شهر)</Label>
                        <Input id="city" placeholder="نام شهر" value={formData.addressCity || ''} onChange={(e) => setFormData({...formData, addressCity: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="medical" className="space-y-6">
                    <div className="space-y-4">
                      <Label className="text-lg font-bold">بیماری‌های زمینه‌ای</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl">
                        {UNDERLYING_DISEASES.map((disease) => (
                          <div key={disease.id} className="flex items-center space-x-3 space-x-reverse group">
                            <Checkbox 
                              id={disease.id} 
                              className="h-6 w-6 rounded-lg data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                              checked={formData.medicalHistory?.underlyingDiseases.includes(disease.id)}
                              onCheckedChange={(checked) => {
                                const current = formData.medicalHistory?.underlyingDiseases || []
                                const updated = checked 
                                  ? [...current, disease.id]
                                  : current.filter(id => id !== disease.id)
                                setFormData({
                                  ...formData, 
                                  medicalHistory: { ...formData.medicalHistory!, underlyingDiseases: updated }
                                })
                              }}
                            />
                            <Label htmlFor={disease.id} className="cursor-pointer text-base group-hover:text-green-600 transition-colors">{disease.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <Textarea id="surgeries" placeholder="سابقه جراحی‌های قبلی..." value={formData.medicalHistory?.previousSurgeries || ''} onChange={(e) => setFormData({...formData, medicalHistory: {...formData.medicalHistory!, previousSurgeries: e.target.value}})} className="rounded-2xl min-h-[100px] p-4" />
                      <Textarea id="hospitalization" placeholder="سابقه بستری..." value={formData.medicalHistory?.hospitalizationHistory || ''} onChange={(e) => setFormData({...formData, medicalHistory: {...formData.medicalHistory!, hospitalizationHistory: e.target.value}})} className="rounded-2xl min-h-[100px] p-4" />
                    </div>
                  </TabsContent>

                  <TabsContent value="allergies" className="space-y-4">
                    <Label className="text-lg font-bold">حساسیت‌ها</Label>
                    <Textarea placeholder="حساسیت‌های دارویی..." value={formData.allergies?.drugAllergies || ''} onChange={(e) => setFormData({...formData, allergies: {...formData.allergies!, drugAllergies: e.target.value}})} className="rounded-2xl min-h-[120px] p-4" />
                    <Textarea placeholder="حساسیت‌های غذایی..." value={formData.allergies?.foodAllergies || ''} onChange={(e) => setFormData({...formData, allergies: {...formData.allergies!, foodAllergies: e.target.value}})} className="rounded-2xl min-h-[120px] p-4" />
                  </TabsContent>

                  <TabsContent value="meds" className="space-y-4">
                    <Label className="text-lg font-bold">داروها</Label>
                    <Textarea placeholder="لیست داروهای مصرفی فعلی..." value={formData.medications?.currentMedications || ''} onChange={(e) => setFormData({...formData, medications: {...formData.medications!, currentMedications: e.target.value}})} className="rounded-2xl min-h-[120px] p-4" />
                    <Input placeholder="مکمل‌های ویتامینی..." value={formData.medications?.supplements || ''} onChange={(e) => setFormData({...formData, medications: {...formData.medications!, supplements: e.target.value}})} className="h-14 rounded-xl px-4" />
                  </TabsContent>

                  <TabsContent value="vitals" className="space-y-4">
                    <Label className="text-lg font-bold">علائم حیاتی</Label>
                    <div className="grid grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl">
                      <div className="space-y-2">
                        <Label>فشار خون</Label>
                        <Input placeholder="مثلاً 120/80" value={formData.vitalSigns?.bloodPressure || ''} onChange={(e) => setFormData({...formData, vitalSigns: {...formData.vitalSigns!, bloodPressure: e.target.value}})} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label>وزن (کیلوگرم)</Label>
                        <Input type="number" placeholder="75" value={formData.vitalSigns?.weight || ''} onChange={(e) => setFormData({...formData, vitalSigns: {...formData.vitalSigns!, weight: e.target.value}})} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label>قد (سانتی‌متر)</Label>
                        <Input type="number" placeholder="180" value={formData.vitalSigns?.height || ''} onChange={(e) => setFormData({...formData, vitalSigns: {...formData.vitalSigns!, height: e.target.value}})} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label>شاخص توده بدنی (BMI)</Label>
                        <div className="h-12 px-4 rounded-xl bg-white dark:bg-slate-800 flex items-center font-bold text-green-600 border border-green-100 dark:border-green-900/20">
                          {formData.vitalSigns?.bmi || '---'}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="lifestyle" className="space-y-4">
                    <Label className="text-lg font-bold">سبک زندگی</Label>
                    <Input placeholder="مصرف سیگار یا الکل..." value={formData.lifestyle?.smokingAlcohol || ''} onChange={(e) => setFormData({...formData, lifestyle: {...formData.lifestyle!, smokingAlcohol: e.target.value}})} className="h-14 rounded-xl px-4" />
                    <Select value={formData.lifestyle?.activityLevel} onValueChange={(v) => setFormData({...formData, lifestyle: {...formData.lifestyle!, activityLevel: v}})}>
                      <SelectTrigger className="h-14 rounded-xl px-4">
                        <SelectValue placeholder="سطح فعالیت بدنی" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="sedentary">کم (بدون تحرک)</SelectItem>
                        <SelectItem value="moderate">متوسط (3 روز در هفته)</SelectItem>
                        <SelectItem value="active">زیاد (هر روز)</SelectItem>
                      </SelectContent>
                    </Select>
                  </TabsContent>
                </Tabs>
              </div>
              
              <DialogFooter className="gap-3">
                <Button variant="outline" onClick={() => setIsAddPatientOpen(false)} className="rounded-2xl h-14 px-8 text-lg">انصراف</Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white px-12 rounded-2xl h-14 text-lg shadow-none" onClick={handleAddPatient}>ثبت و ایجاد پرونده</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <Card key={patient.id} className="bg-white dark:bg-[#111] border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-[2rem] overflow-hidden group border-none shadow-none">
                <CardHeader className="p-8 pb-4 flex flex-row items-start justify-between bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-[1.25rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-green-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <User className="h-10 w-10" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black">{patient.fullName}</CardTitle>
                      <CardDescription className="font-mono text-base">{patient.nationalId}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 gap-4 text-base">
                    <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Phone className="h-5 w-5" />
                      </div>
                      <span className="font-bold">{patient.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <span className="truncate">{patient.addressCity}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {patient.medicalHistory.underlyingDiseases.length > 0 ? (
                      patient.medicalHistory.underlyingDiseases.map(d => (
                        <Badge key={d} variant="secondary" className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-none rounded-xl px-4 py-2 font-bold">
                          {UNDERLYING_DISEASES.find(disease => disease.id === d)?.label}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400 italic">بدون بیماری زمینه‌ای ثبت شده</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <Button 
                      className="w-full gap-2 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-500/20 transition-all"
                      onClick={() => handleOpenDietForm(patient)}
                    >
                      <span>ساخت رژیم غذایی هوشمند</span>
                    </Button>
                    
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 gap-2 h-14 rounded-2xl border-slate-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all font-bold" onClick={() => router.push(`/doctor/patients/${patient.id}`)}>
                        <Eye className="h-5 w-5" />
                        پرونده
                      </Button>
                      <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all" onClick={() => handleDeletePatient(patient.id)}>
                        <Trash2 className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-slate-400 space-y-8 bg-slate-50/50 dark:bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="h-32 w-32 rounded-full bg-white dark:bg-slate-800 shadow-none flex items-center justify-center">
                <Users className="h-16 w-16 opacity-20" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-black text-3xl text-slate-700 dark:text-slate-300">لیست بیماران خالی است</p>
                <p className="text-xl opacity-60">اولین پرونده بیمار خود را ایجاد کنید.</p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white gap-3 h-16 px-10 text-xl rounded-[1.5rem] shadow-none active:scale-95 transition-all" onClick={() => setIsAddPatientOpen(true)}>
                <Plus className="h-8 w-8" />
                افزودن اولین بیمار
              </Button>
            </div>
          )}
        </div>
      </main>

      <SurgeryDietForm 
        isOpen={dietFormOpen} 
        onClose={() => setDietFormOpen(false)} 
        onSubmit={handleDietSubmit}
        initialData={selectedPatient}
        isLoading={isGeneratingDiet}
      />

      <Dialog open={dietResultOpen} onOpenChange={setDietResultOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Activity className="text-green-600" />
              رژیم غذایی هوشمند - {selectedPatient?.fullName}
            </DialogTitle>
            <DialogDescription>
              برنامه غذایی تولید شده بر اساس تحلیل هوشمند وضعیت بیمار
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="postOp" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
              <TabsTrigger value="postOp" className="rounded-lg h-10">بعد از عمل</TabsTrigger>
              <TabsTrigger value="preOp" className="rounded-lg h-10" disabled={!dietResult?.preOp}>قبل از عمل</TabsTrigger>
            </TabsList>
            
            <TabsContent value="postOp">
              {dietResult?.postOp ? (
                <DietPlan data={dietResult.postOp} patientName={selectedPatient?.fullName} type="postOp" />
              ) : (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl">
                  <p className="text-slate-500">برنامه غذایی برای بعد از عمل تولید نشده است.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="preOp">
              {dietResult?.preOp ? (
                <DietPlan data={dietResult.preOp} patientName={selectedPatient?.fullName} type="preOp" />
              ) : (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl">
                  <p className="text-slate-500">برنامه غذایی برای قبل از عمل نیاز نیست یا موجود نمی‌باشد.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button onClick={() => setDietResultOpen(false)} className="rounded-xl h-12 px-8">بستن</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
