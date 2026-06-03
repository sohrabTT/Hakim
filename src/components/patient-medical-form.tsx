'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useUser } from '@/context/user-context'
import { Heart, ChevronLeft, ChevronRight, Scale, Ruler, Droplets, Stethoscope, Pill, AlertTriangle, Cog, Activity, User as UserIcon } from 'lucide-react'

interface PatientMedicalFormProps {
  onComplete: () => void
}

const steps = [
  { key: 'basic', icon: UserIcon, title: 'اطلاعات پایه', subtitle: 'جنسیت، وزن، قد و گروه خونی خود را وارد کنید' },
  { key: 'diseases', icon: Stethoscope, title: 'سابقه پزشکی', subtitle: 'بیماری‌های زمینه‌ای و سابقه جراحی' },
  { key: 'allergies', icon: AlertTriangle, title: 'حساسیت‌ها', subtitle: 'حساسیت‌های دارویی و غذایی' },
  { key: 'medications', icon: Pill, title: 'داروها', subtitle: 'داروها و مکمل‌های مصرفی فعلی' },
  { key: 'lifestyle', icon: Activity, title: 'سبک زندگی', subtitle: 'مصرف دخانیات و سطح فعالیت بدنی' },
]

export function PatientMedicalForm({ onComplete }: PatientMedicalFormProps) {
  const { profile, setProfile } = useUser()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    gender: profile?.gender || '',
    weight: profile?.weight || '',
    height: profile?.height || '',
    bloodType: profile?.bloodType || '',
    underlyingDiseases: profile?.underlyingDiseases || '',
    previousSurgeries: profile?.previousSurgeries || '',
    drugAllergies: profile?.drugAllergies || '',
    foodAllergies: profile?.foodAllergies || '',
    currentMedications: profile?.currentMedications || '',
    smokingAlcohol: profile?.smokingAlcohol || '',
    activityLevel: profile?.activityLevel || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {}
    const key = steps[currentStep].key

    if (key === 'basic') {
      if (!formData.gender) newErrors.gender = 'جنسیت را انتخاب کنید'
      if (!formData.weight) newErrors.weight = 'وزن الزامی است'
      if (!formData.height) newErrors.height = 'قد الزامی است'
      if (!formData.bloodType) newErrors.bloodType = 'وضعیت گروه خونی را مشخص کنید'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    if (!validateStep()) return

    setIsSaving(true)
    try {
      await setProfile({
        ...profile!,
        ...formData,
      } as any)
    } catch (e) {
      console.error('Failed to save:', e)
    }
    setIsSaving(false)

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const currentStepConfig = steps[currentStep]
  const StepIcon = currentStepConfig.icon

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white dark:bg-[#030712] transition-colors duration-500 font-sans" dir="rtl">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      <div className="relative z-10 w-full max-w-[480px] px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="relative inline-block group mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-20 dark:opacity-25 transition duration-1000" />
            <div className="relative flex items-center justify-center w-14 h-14 bg-white dark:bg-[#0f172a] rounded-2xl border border-black/5 dark:border-white/5 shadow-xl">
              <Heart className="w-7 h-7 text-emerald-500 dark:text-emerald-400 fill-emerald-500/10 dark:fill-emerald-400/10" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <StepIcon className="w-5 h-5 text-emerald-500" />
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {currentStepConfig.title}
            </h2>
          </div>
          <p className="text-slate-500 dark:text-gray-400 font-medium">
            {currentStepConfig.subtitle}
          </p>

          {/* Progress */}
          <div className="mt-6 flex gap-2 justify-center px-12">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index <= currentStep
                    ? 'bg-emerald-500 w-full shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                    : 'bg-slate-200 dark:bg-gray-800 w-4'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="relative group animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150">
          <div className="absolute -inset-[1px] bg-gradient-to-b from-black/5 dark:from-white/20 to-transparent rounded-[2.5rem] opacity-20 pointer-events-none" />
          <div className="relative bg-white/70 dark:bg-[#0f172a]/80 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
            
            <div className="min-h-[260px]">
              {/* Step 1: Basic Info */}
              {currentStep === 0 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    {['male', 'female'].map((g) => (
                      <button
                        key={g}
                        onClick={() => updateField('gender', g)}
                        className={`p-4 rounded-2xl border-2 transition-all duration-300 font-bold text-lg ${
                          formData.gender === g
                            ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
                            : 'border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 text-slate-500 dark:text-gray-400'
                        }`}
                      >
                        {g === 'male' ? 'مرد' : 'زن'}
                      </button>
                    ))}
                  </div>
                  {errors.gender && <p className="text-red-500 text-[10px] font-bold pr-2">{errors.gender}</p>}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 dark:text-gray-500">
                          <Scale className="w-4 h-4" />
                        </div>
                        <Input
                          type="text"
                          placeholder="وزن (کیلوگرم)"
                          value={formData.weight}
                          onChange={(e) => updateField('weight', e.target.value)}
                          className="bg-black/5 dark:bg-[#030712]/50 border-black/5 dark:border-white/5 h-12 pr-11 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600"
                        />
                      </div>
                      {errors.weight && <p className="text-red-500 text-[10px] font-bold mt-1 pr-2">{errors.weight}</p>}
                    </div>
                    <div>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 dark:text-gray-500">
                          <Ruler className="w-4 h-4" />
                        </div>
                        <Input
                          type="text"
                          placeholder="قد (سانتی‌متر)"
                          value={formData.height}
                          onChange={(e) => updateField('height', e.target.value)}
                          className="bg-black/5 dark:bg-[#030712]/50 border-black/5 dark:border-white/5 h-12 pr-11 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600"
                        />
                      </div>
                      {errors.height && <p className="text-red-500 text-[10px] font-bold mt-1 pr-2">{errors.height}</p>}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 dark:text-gray-500">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <select
                      value={formData.bloodType}
                      onChange={(e) => updateField('bloodType', e.target.value)}
                      className="w-full bg-black/5 dark:bg-[#030712]/50 border border-black/5 dark:border-white/5 h-12 pr-11 rounded-2xl text-slate-900 dark:text-white appearance-none cursor-pointer text-right px-4"
                    >
                      <option value="" disabled>گروه خونی</option>
                      <option value="unknown">نمی‌دانم</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  {errors.bloodType && <p className="text-red-500 text-[10px] font-bold mt-1 pr-2">{errors.bloodType}</p>}
                </div>
              )}

              {/* Step 2: Medical History */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-bold text-slate-600 dark:text-gray-400 mb-2 block pr-1">بیماری‌های زمینه‌ای</label>
                    <textarea
                      placeholder="مثلاً: دیابت، فشار خون، تیروئید، ..."
                      value={formData.underlyingDiseases}
                      onChange={(e) => updateField('underlyingDiseases', e.target.value)}
                      rows={3}
                      className="w-full bg-black/5 dark:bg-[#030712]/50 border border-black/5 dark:border-white/5 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600 dark:text-gray-400 mb-2 block pr-1">سابقه جراحی</label>
                    <textarea
                      placeholder="در صورت وجود، نوع و تاریخ جراحی را ذکر کنید"
                      value={formData.previousSurgeries}
                      onChange={(e) => updateField('previousSurgeries', e.target.value)}
                      rows={3}
                      className="w-full bg-black/5 dark:bg-[#030712]/50 border border-black/5 dark:border-white/5 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Allergies */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-bold text-slate-600 dark:text-gray-400 mb-2 block pr-1">حساسیت دارویی</label>
                    <textarea
                      placeholder="مثلاً: پنی‌سیلین، کدئین، ..."
                      value={formData.drugAllergies}
                      onChange={(e) => updateField('drugAllergies', e.target.value)}
                      rows={3}
                      className="w-full bg-black/5 dark:bg-[#030712]/50 border border-black/5 dark:border-white/5 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600 dark:text-gray-400 mb-2 block pr-1">حساسیت غذایی</label>
                    <textarea
                      placeholder="مثلاً: بادام زمینی، گلوتن، لاکتوز، ..."
                      value={formData.foodAllergies}
                      onChange={(e) => updateField('foodAllergies', e.target.value)}
                      rows={3}
                      className="w-full bg-black/5 dark:bg-[#030712]/50 border border-black/5 dark:border-white/5 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Medications */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-bold text-slate-600 dark:text-gray-400 mb-2 block pr-1">داروهای مصرفی فعلی</label>
                    <textarea
                      placeholder="نام داروها، دوز و تعداد دفعات مصرف را ذکر کنید"
                      value={formData.currentMedications}
                      onChange={(e) => updateField('currentMedications', e.target.value)}
                      rows={4}
                      className="w-full bg-black/5 dark:bg-[#030712]/50 border border-black/5 dark:border-white/5 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Lifestyle */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-bold text-slate-600 dark:text-gray-400 mb-2 block pr-1">مصرف دخانیات و الکل</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['هرگز', 'گاهی', 'مصرف دارم'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => updateField('smokingAlcohol', opt)}
                          className={`p-3 rounded-2xl border-2 transition-all duration-300 text-sm font-bold ${
                            formData.smokingAlcohol === opt
                              ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
                              : 'border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 text-slate-500 dark:text-gray-400'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-600 dark:text-gray-400 mb-2 block pr-1">سطح فعالیت بدنی</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { value: 'کم', label: 'کم (بدون ورزش)', icon: '🪑' },
                        { value: 'متوسط', label: 'متوسط (۲-۳ بار در هفته)', icon: '🚶' },
                        { value: 'زیاد', label: 'زیاد (روزانه)', icon: '🏃' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateField('activityLevel', opt.value)}
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 text-right ${
                            formData.activityLevel === opt.value
                              ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
                              : 'border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 text-slate-500 dark:text-gray-400'
                          }`}
                        >
                          <span className="text-xl">{opt.icon}</span>
                          <span className="font-bold text-sm">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="mt-8 space-y-3">
              <Button
                onClick={handleNext}
                disabled={isSaving}
                className="relative overflow-hidden w-full h-14 bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-[#030712] text-lg font-bold rounded-2xl shadow-[0_20px_40px_-12px_rgba(16,185,129,0.3)] transition-all duration-500"
              >
                <span className="flex items-center justify-center gap-2">
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 dark:border-[#030712]/30 border-t-white dark:border-t-[#030712] rounded-full animate-spin" />
                  ) : currentStep === steps.length - 1 ? (
                    <>تکمیل اطلاعات پزشکی <ChevronLeft className="w-5 h-5" /></>
                  ) : (
                    <>تأیید و ادامه <ChevronLeft className="w-5 h-5" /></>
                  )}
                </span>
              </Button>

              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="w-full py-2 text-sm font-bold text-slate-400 dark:text-gray-500 hover:text-emerald-500 transition-colors flex items-center justify-center gap-1"
                >
                  <ChevronRight className="w-4 h-4" />
                  مرحله قبل
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center animate-in fade-in duration-1000 delay-500 opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-600">
            اطلاعات شما نزد حکیم محفوظ است
          </p>
        </div>
      </div>
    </div>
  )
}