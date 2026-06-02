'use client'

import React, { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, ClipboardList, Activity, User, HeartPulse, Pill, AlertTriangle, Target, HelpCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

interface SurgeryDietFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  initialData?: any
  isLoading?: boolean
}

export function SurgeryDietForm({ isOpen, onClose, onSubmit, initialData, isLoading = false }: SurgeryDietFormProps) {
  const [step, setStep] = useState(1)
  const [isProcessingStep, setIsProcessingStep] = useState(false)
  const [formData, setFormData] = useState({
    // Section 1: Surgery Specifics
    surgeryType: '',
    surgeryDate: '',
    daysUntilSurgery: '',
    postOpDaysRequested: '14',
    surgeryMethod: '',
    
    // Section 2: Basic Info (Pre-filled)
    age: '',
    gender: '',
    height: '',
    weight: '',
    bmi: '',
    
    // Section 3: Medical History (Pre-filled)
    underlyingDiseases: '',
    anemiaHistory: '',
    digestiveIssues: '',
    
    // Section 4: Medications (Pre-filled)
    currentMeds: '',
    supplements: '',
    
    // Section 5: Allergies (Pre-filled)
    foodAllergies: '',
    medAllergies: '',
    
    // Section 6: Lifestyle (Pre-filled)
    mealFrequency: '',
    fluidIntake: '',
    proteinIntake: '',
    fruitVegIntake: '',
    smokingAlcohol: '',
    activityLevel: '',
    
    // Section 7: 10 Supplemental Questions (New)
    q1_weightChanges: '',
    q2_chewingAbility: '',
    q3_bowelHabits: '',
    q4_sleepQuality: '',
    q5_stressLevel: '',
    q6_cookingSupport: '',
    q7_budget: '',
    q8_previousDiets: '',
    q9_cravingsAversions: '',
    q10_activityDetails: '',

    // Section 8: Goal
    mainGoal: '',
    dietVariety: 'different'
  })

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        age: initialData.age || '',
        gender: initialData.gender || '',
        height: initialData.vitalSigns?.height || '',
        weight: initialData.vitalSigns?.weight || '',
        bmi: initialData.vitalSigns?.bmi || '',
        underlyingDiseases: initialData.medicalHistory?.underlyingDiseases?.join(', ') || '',
        currentMeds: initialData.medications?.currentMedications || '',
        supplements: initialData.medications?.supplements || '',
        foodAllergies: initialData.allergies?.foodAllergies || '',
        medAllergies: initialData.allergies?.drugAllergies || '',
        smokingAlcohol: initialData.lifestyle?.smokingAlcohol || '',
        activityLevel: initialData.lifestyle?.activityLevel || '',
      }))
    }
  }, [initialData])

  if (!isOpen) return null

  const steps = [
    { title: 'اطلاعات پایه بیمار', icon: User },
    { title: 'سوابق پزشکی', icon: HeartPulse },
    { title: 'داروها و مکمل‌ها', icon: Pill },
    { title: 'حساسیت‌ها', icon: AlertTriangle },
    { title: 'سبک زندگی', icon: Activity },
    { title: 'اطلاعات عمل جراحی', icon: ClipboardList },
    { title: 'سوالات تکمیلی (۱۰ مورد)', icon: HelpCircle },
    { title: 'تنظیمات نهایی', icon: Target }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNext = () => {
    if (step < steps.length) {
      setIsProcessingStep(true)
      setTimeout(() => {
        setStep(step + 1)
        setIsProcessingStep(false)
      }, 400) // Small delay for UX "thinking" feel
    }
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    // onClose() - We don't close it here, the parent will close it when loading is done
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-left-4">
            <div className="space-y-2">
              <Label>سن</Label>
              <Input name="age" type="number" value={formData.age} onChange={handleInputChange} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>جنسیت</Label>
              <Select onValueChange={(v) => handleSelectChange('gender', v)} value={formData.gender}>
                <SelectTrigger className="h-12 w-full">
                  <SelectValue placeholder="انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">مرد</SelectItem>
                  <SelectItem value="female">زن</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>قد (cm)</Label>
              <Input name="height" type="number" value={formData.height} onChange={handleInputChange} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>وزن (kg)</Label>
              <Input name="weight" type="number" value={formData.weight} onChange={handleInputChange} className="h-12" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>شاخص توده بدنی (BMI)</Label>
              <Input name="bmi" value={formData.bmi} onChange={handleInputChange} className="h-12 bg-slate-50" readOnly />
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
            <div className="space-y-2">
              <Label>بیماری‌های زمینه‌ای</Label>
              <Textarea name="underlyingDiseases" value={formData.underlyingDiseases} onChange={handleInputChange} className="min-h-[100px]" placeholder="دیابت، فشار خون، بیماری‌های قلبی..." />
            </div>
            <div className="space-y-2">
              <Label>سابقه کم‌خونی</Label>
              <Input name="anemiaHistory" value={formData.anemiaHistory} onChange={handleInputChange} className="h-12" placeholder="نوع و شدت کم‌خونی..." />
            </div>
            <div className="space-y-2">
              <Label>مشکلات گوارشی</Label>
              <Textarea name="digestiveIssues" value={formData.digestiveIssues} onChange={handleInputChange} className="min-h-[100px]" placeholder="رفلاکس، یبوست، نفخ شدید..." />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
            <div className="space-y-2">
              <Label>داروهای مصرفی فعلی</Label>
              <Textarea name="currentMeds" value={formData.currentMeds} onChange={handleInputChange} className="min-h-[120px]" placeholder="لیست داروها و دوز مصرفی..." />
            </div>
            <div className="space-y-2">
              <Label>مکمل‌های غذایی</Label>
              <Textarea name="supplements" value={formData.supplements} onChange={handleInputChange} className="min-h-[120px]" placeholder="ویتامین‌ها، آهن، کلسیم..." />
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
            <div className="space-y-2">
              <Label>حساسیت‌های غذایی</Label>
              <Textarea name="foodAllergies" value={formData.foodAllergies} onChange={handleInputChange} className="min-h-[120px]" placeholder="گلوتن، لاکتوز، آجیل..." />
            </div>
            <div className="space-y-2">
              <Label>حساسیت‌های دارویی</Label>
              <Textarea name="medAllergies" value={formData.medAllergies} onChange={handleInputChange} className="min-h-[120px]" placeholder="پنی‌سیلین، آسپرین..." />
            </div>
          </div>
        )
      case 5:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-left-4">
            <div className="space-y-2">
              <Label>تعداد وعده‌های غذایی</Label>
              <Input name="mealFrequency" value={formData.mealFrequency} onChange={handleInputChange} className="h-12" placeholder="مثال: ۳ وعده اصلی + ۲ میان‌وعده" />
            </div>
            <div className="space-y-2">
              <Label>مصرف مایعات (لیوان در روز)</Label>
              <Input name="fluidIntake" value={formData.fluidIntake} onChange={handleInputChange} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>مصرف پروتئین</Label>
              <Select onValueChange={(v) => handleSelectChange('proteinIntake', v)} value={formData.proteinIntake}>
                <SelectTrigger className="h-12 w-full">
                  <SelectValue placeholder="انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">کم</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="high">زیاد</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>سطح فعالیت بدنی</Label>
              <Select onValueChange={(v) => handleSelectChange('activityLevel', v)} value={formData.activityLevel}>
                <SelectTrigger className="h-12 w-full">
                  <SelectValue placeholder="انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">کم‌تحرک</SelectItem>
                  <SelectItem value="light">سبک</SelectItem>
                  <SelectItem value="moderate">متوسط</SelectItem>
                  <SelectItem value="active">فعال</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      case 6:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 p-4 rounded-xl mb-6">
              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 font-bold mb-2">
                <AlertTriangle className="h-5 w-5" />
                <span>توجه مهم</span>
              </div>
              <p className="text-sm text-yellow-600 dark:text-yellow-500 leading-relaxed">
                این فرم جهت تولید رژیم غذایی دقیق قبل و بعد از عمل جراحی طراحی شده است. لطفاً اطلاعات مربوط به زمان‌بندی عمل را با دقت وارد کنید تا هوش مصنوعی بتواند مراحل رژیم (مایعات شفاف، کامل، پوره و سفره) را به درستی تنظیم کند.
              </p>
            </div>
            <div className="space-y-2">
              <Label>نوع عمل جراحی</Label>
              <Input name="surgeryType" value={formData.surgeryType} onChange={handleInputChange} placeholder="مثال: بای‌پس معده، اسلیو، کیسه صفرا..." className="h-12" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تعداد روز باقی‌مانده تا عمل</Label>
                <Input name="daysUntilSurgery" type="number" value={formData.daysUntilSurgery} onChange={handleInputChange} placeholder="مثال: 5" className="h-12" />
              </div>
              <div className="space-y-2">
                <Label>تعداد روز درخواستی برای بعد از عمل</Label>
                <Input name="postOpDaysRequested" type="number" value={formData.postOpDaysRequested} onChange={handleInputChange} placeholder="مثال: 14" className="h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>روش جراحی</Label>
              <Select onValueChange={(v) => handleSelectChange('surgeryMethod', v)} value={formData.surgeryMethod}>
                <SelectTrigger className="h-12 w-full">
                  <SelectValue placeholder="انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">جراحی باز</SelectItem>
                  <SelectItem value="laparoscopy">لاپاراسکوپی</SelectItem>
                  <SelectItem value="robotic">رباتیک</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      case 7:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl mb-4">
              <p className="text-sm text-blue-700 dark:text-blue-400 font-bold">
                ۱۰ سوال تکمیلی برای هوش مصنوعی جهت بهینه‌سازی دقیق رژیم
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">۱. تغییرات وزن اخیر</Label>
                <Input name="q1_weightChanges" value={formData.q1_weightChanges} onChange={handleInputChange} placeholder="کاهش/افزایش در ۶ ماه گذشته؟" className="h-10 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">۲. وضعیت جویدن و بلع</Label>
                <Input name="q2_chewingAbility" value={formData.q2_chewingAbility} onChange={handleInputChange} placeholder="مشکل دندان یا بلع دارید؟" className="h-10 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">۳. عادات اجابت مزاج</Label>
                <Input name="q3_bowelHabits" value={formData.q3_bowelHabits} onChange={handleInputChange} placeholder="یبوست یا اسهال مکرر؟" className="h-10 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">۴. کیفیت خواب</Label>
                <Input name="q4_sleepQuality" value={formData.q4_sleepQuality} onChange={handleInputChange} placeholder="ساعات خواب و کیفیت؟" className="h-10 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">۵. سطح استرس</Label>
                <Select onValueChange={(v) => handleSelectChange('q5_stressLevel', v)} value={formData.q5_stressLevel}>
                  <SelectTrigger className="h-10 text-sm w-full">
                    <SelectValue placeholder="انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">کم</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="high">زیاد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">۶. چه کسی آشپزی می‌کند؟</Label>
                <Input name="q6_cookingSupport" value={formData.q6_cookingSupport} onChange={handleInputChange} placeholder="خودم، همسر، والدین..." className="h-10 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">۷. بودجه تغذیه</Label>
                <Select onValueChange={(v) => handleSelectChange('q7_budget', v)} value={formData.q7_budget}>
                  <SelectTrigger className="h-10 text-sm w-full">
                    <SelectValue placeholder="انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">اقتصادی</SelectItem>
                    <SelectItem value="standard">معمول</SelectItem>
                    <SelectItem value="premium">آزاد (هر چه لازم باشد)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">۸. تجربه رژیم‌های قبلی</Label>
                <Input name="q8_previousDiets" value={formData.q8_previousDiets} onChange={handleInputChange} placeholder="موفق/ناموفق؟ چرا؟" className="h-10 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">۹. ویارها یا تنفر غذایی خاص</Label>
                <Input name="q9_cravingsAversions" value={formData.q9_cravingsAversions} onChange={handleInputChange} placeholder="غذایی که اصلا نمی‌خورید؟" className="h-10 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">۱۰. جزئیات فعالیت بدنی</Label>
                <Input name="q10_activityDetails" value={formData.q10_activityDetails} onChange={handleInputChange} placeholder="نوع ورزش و مدت زمان؟" className="h-10 text-sm" />
              </div>
            </div>
          </div>
        )
      case 8:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
            <div className="space-y-2">
              <Label>هدف اصلی از رژیم</Label>
              <Textarea 
                name="mainGoal" 
                value={formData.mainGoal} 
                onChange={handleInputChange} 
                placeholder="مثال: بهبودی سریع زخم، جلوگیری از تحلیل عضله، کاهش وزن..." 
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label>تنوع برنامه غذایی</Label>
              <Select onValueChange={(v) => handleSelectChange('dietVariety', v)} value={formData.dietVariety}>
                <SelectTrigger className="h-12 w-full">
                  <SelectValue placeholder="انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="different">هر روز متفاوت باشد (تنوع بالا)</SelectItem>
                  <SelectItem value="repeating">برنامه چرخشی (تکرار برخی وعده‌ها)</SelectItem>
                  <SelectItem value="simple">ساده و کم‌هزینه</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const CurrentIcon = steps[step - 1].icon

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" dir="rtl">
      <div className="bg-white dark:bg-[#0f0f0f] w-full max-w-2xl rounded-[2rem] shadow-2xl border border-slate-200 dark:border-[#1a1a1a] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-[#1a1a1a] flex items-center justify-between bg-slate-50/50 dark:bg-[#0f0f0f]">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/20 rounded-xl sm:rounded-2xl shadow-inner">
              <CurrentIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{steps[step - 1].title}</h2>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400 font-medium mt-1">گام {step} از {steps.length} • تکمیل اطلاعات جهت هوش مصنوعی</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-[#1a1a1a] rounded-full transition-colors">
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-100 dark:bg-[#1a1a1a] flex" dir="ltr">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 h-full transition-all duration-500 ${
                i + 1 <= step ? 'bg-green-500' : ''
              } ${i + 1 === step ? 'opacity-100' : 'opacity-30'}`} 
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-8 flex-1 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1">
              {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="mt-6 sm:mt-8 flex items-center justify-between gap-3 sm:gap-4 pt-4 border-t border-slate-100 dark:border-[#1a1a1a]">
              <Button
                type="button"
                variant="ghost"
                onClick={handlePrev}
                disabled={step === 1}
                className="flex-1 rounded-xl sm:rounded-2xl h-12 sm:h-14 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1a1a1a] text-base sm:text-lg font-bold"
              >
                <ChevronRight className="ml-1 sm:ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                مرحله قبل
              </Button>
              {step < steps.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isProcessingStep}
                  className="flex-[2] rounded-xl sm:rounded-2xl h-12 sm:h-14 bg-green-600 hover:bg-green-700 text-white text-base sm:text-lg font-bold shadow-lg shadow-green-500/20"
                >
                  {isProcessingStep ? (
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <>
                      مرحله بعد
                      <ChevronLeft className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] rounded-xl sm:rounded-2xl h-12 sm:h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-base sm:text-lg font-black shadow-xl shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Activity className="ml-1 sm:ml-2 w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      در حال تولید...
                    </>
                  ) : (
                    <>
                      <FileText className="ml-1 sm:ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                      تولید رژیم هوشمند
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}