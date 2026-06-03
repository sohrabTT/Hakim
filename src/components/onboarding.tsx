'use client'

import React, { useState } from 'react'
import { useUser } from '@/context/user-context'
import { t, type Language } from '@/lib/i18n'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Heart, ChevronRight, ChevronLeft, User, Stethoscope, Users } from 'lucide-react'

interface OnboardingData {
  firstName: string
  lastName: string
  phone: string
  age: string
  location: string
  language: Language
  role: 'doctor' | 'patient' | 'caregiver'
  specialization: string
  level: 'specialist' | 'subspecialist' | 'general'
  department: string
}

interface OnboardingProps {
  onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { setProfile, setLanguage } = useUser()
  const [currentStep, setCurrentStep] = useState(0)
  const [language, setLanguageState] = useState<Language>('en')
  const [data, setData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    phone: '',
    age: '',
    location: '',
    language: 'en',
    role: 'patient',
    specialization: '',
    level: 'specialist',
    department: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const toEnglishDigits = (str: string) => {
    const persianMap: Record<string, string> = {
      '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
      '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    }
    const arabicMap: Record<string, string> = {
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
    }
    return str.split('').map(c => persianMap[c] || arabicMap[c] || c).join('')
  }

  const baseSteps = [
    { key: 'language', title: 'onboarding.welcome', subtitle: 'onboarding.subtitle' },
    { key: 'role', title: 'onboarding.step0Title', subtitle: 'onboarding.step0Subtitle' },
    { key: 'name', title: 'onboarding.step1Title', subtitle: 'onboarding.step1Subtitle' },
    { key: 'phone', title: 'onboarding.step2Title', subtitle: 'onboarding.step2Subtitle' },
  ]

  const doctorSteps = [
    { key: 'specialization', title: 'onboarding.doctorSpecializationTitle', subtitle: 'onboarding.doctorSpecializationSubtitle' },
    { key: 'level', title: 'onboarding.doctorLevelTitle', subtitle: 'onboarding.doctorLevelSubtitle' },
    { key: 'department', title: 'onboarding.doctorDepartmentTitle', subtitle: 'onboarding.doctorDepartmentSubtitle' },
  ]

  const finalSteps = [
    { key: 'age', title: 'onboarding.step3Title', subtitle: 'onboarding.step3Subtitle' },
    { key: 'location', title: 'onboarding.step4Title', subtitle: 'onboarding.step4Subtitle' },
  ]

  const steps = data.role === 'doctor' 
    ? [...baseSteps, ...doctorSteps, ...finalSteps]
    : [...baseSteps, ...finalSteps]

  const currentStepConfig = steps[currentStep]

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {}
    const currentStepKey = currentStepConfig.key

    if (currentStepKey === 'language') {
      if (!data.language) newErrors.language = 'لطفاً یک زبان انتخاب کنید'
    } else if (currentStepKey === 'role') {
      if (!data.role) newErrors.role = 'لطفاً نقش خود را انتخاب کنید'
    } else if (currentStepKey === 'name') {
      if (!data.firstName.trim()) newErrors.firstName = 'نام الزامی است'
      if (!data.lastName.trim()) newErrors.lastName = 'نام خانوادگی الزامی است'
    } else if (currentStepKey === 'phone') {
      const englishPhone = toEnglishDigits(data.phone)
      const phoneClean = englishPhone.replace(/\D/g, '')
      if (!data.phone.trim()) {
        newErrors.phone = 'شماره تماس الزامی است'
      } else if (phoneClean.length < 10) {
        newErrors.phone = 'شماره تماس معتبر نیست'
      }
    } else if (currentStepKey === 'specialization') {
      if (!data.specialization.trim()) newErrors.specialization = 'حوزه فعالیت الزامی است'
    } else if (currentStepKey === 'department') {
      if (!data.department.trim()) newErrors.department = 'نام بخش الزامی است'
    } else if (currentStepKey === 'age') {
      if (!data.age) {
        newErrors.age = 'سن الزامی است'
      } else {
        const ageNum = parseInt(data.age)
        if (isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
          newErrors.age = 'لطفاً یک سن معتبر وارد کنید'
        }
      }
    } else if (currentStepKey === 'location') {
      if (!data.location.trim()) newErrors.location = 'محل سکونت الزامی است'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateCurrentStep()) return

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleLanguageSelect = (lang: Language) => {
    setLanguageState(lang)
    setData(prev => ({ ...prev, language: lang }))
    setLanguage(lang)
    if (errors.language) {
      setErrors(prev => ({ ...prev, language: '' }))
    }
  }

  const handleRoleSelect = (role: 'doctor' | 'patient') => {
    setData(prev => ({ ...prev, role }))
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: '' }))
    }
  }

  const handleComplete = () => {
    const ageNum = parseInt(data.age)
    setProfile({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      age: ageNum,
      location: data.location,
      language: language,
      role: data.role,
      specialization: data.specialization,
      level: data.level,
      department: data.department,
      createdAt: new Date(),
    })
    setLanguage(language)
    onComplete()
  }

  const handleInputChange = (field: string, value: string) => {
    setData({ ...data, [field]: field === 'phone' ? toEnglishDigits(value) : value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const renderHakimText = () => {
    const text = t(language, 'onboarding.welcome')
    const word = language === 'en' ? 'Hakim' : 'حکیم'
    const parts = text.split(word)
    if (parts.length > 1) {
      return (
        <>
          {parts[0]}
          <span className={`${language === 'fa' || language === 'ar' ? 'noto-nastaliq-urdu-custom' : ''} text-green-600 dark:text-green-400 mx-1`}>{word}</span>
          {parts[1]}
        </>
      )
    }
    return text
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white dark:bg-[#030712] transition-colors duration-500 font-sans" dir="rtl">
      {/* Background Animation Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      <div className="relative z-10 w-full max-w-[480px] px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="relative inline-block group mb-6">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-20 dark:opacity-25 group-hover:opacity-40 transition duration-1000" />
            <div className="relative flex items-center justify-center w-16 h-16 bg-white dark:bg-[#0f172a] rounded-2xl border border-black/5 dark:border-white/5 shadow-xl">
              <Heart className="w-8 h-8 text-emerald-500 dark:text-emerald-400 fill-emerald-500/10 dark:fill-emerald-400/10" />
            </div>
          </div>
          
          {currentStep === 0 ? (
            <>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                {renderHakimText()}
              </h1>
              <p className="text-slate-500 dark:text-gray-400 text-lg font-medium max-w-[320px] mx-auto">
                {t(language, 'onboarding.subtitle')}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
                {t(language, currentStepConfig.title)}
              </h2>
              <p className="text-slate-500 dark:text-gray-400 font-medium">
                {t(language, currentStepConfig.subtitle)}
              </p>
              
              {/* Modern Progress Bar */}
              <div className="mt-8 flex gap-2 justify-center px-12">
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
            </>
          )}
        </div>

        {/* Content Card */}
        <div className="relative group animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150">
          <div className="absolute -inset-[1px] bg-gradient-to-b from-black/5 dark:from-white/20 to-transparent rounded-[2.5rem] opacity-20 pointer-events-none" />
          <div className="relative bg-white/70 dark:bg-[#0f172a]/80 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
            
            <div className="min-h-[220px] flex flex-col justify-center">
              {currentStepConfig.key === 'language' ? (
                /* Language Selection */
                <div className="grid grid-cols-1 gap-3">
                  {(['en', 'fa', 'ar'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageSelect(lang)}
                      className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 text-right overflow-hidden ${
                        language === lang 
                          ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' 
                          : 'border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:border-emerald-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg">
                          {lang === 'en' && 'English'}
                          {lang === 'fa' && 'فارسی'}
                          {lang === 'ar' && 'العربية'}
                        </span>
                        {language === lang && <ChevronRight className="w-5 h-5 animate-in zoom-in duration-300" />}
                      </div>
                    </button>
                  ))}
                </div>
              ) : currentStepConfig.key === 'role' ? (
                /* Role Selection */
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: 'patient', icon: User, label: 'onboarding.patient', disabled: false },
                    { id: 'doctor', icon: Stethoscope, label: 'onboarding.doctor', disabled: false },
                    { id: 'caregiver', icon: Users, label: 'onboarding.caregiver', disabled: true }
                  ].map((roleItem) => (
                    <button
                      key={roleItem.id}
                      disabled={roleItem.disabled}
                      onClick={() => !roleItem.disabled && handleRoleSelect(roleItem.id as any)}
                      className={`relative flex items-center gap-5 p-5 rounded-2xl border-2 transition-all duration-300 ${
                        roleItem.disabled 
                          ? 'opacity-40 cursor-not-allowed border-transparent grayscale'
                          : data.role === roleItem.id
                            ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 scale-[1.02]'
                            : 'border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:border-emerald-500/30'
                      }`}
                    >
                      <div className={`p-3 rounded-xl transition-colors ${
                        data.role === roleItem.id 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                          : 'bg-white dark:bg-[#030712] text-slate-400 border border-black/5 dark:border-white/5'
                      }`}>
                        <roleItem.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 text-right">
                        <p className="font-bold text-lg leading-none">{t(language, roleItem.label)}</p>
                        {roleItem.disabled && (
                          <span className="text-[10px] font-black uppercase tracking-tighter opacity-60 mt-1 block">
                            {t(language, 'onboarding.comingSoon')}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                /* Inputs Step */
                <div className="space-y-4">
                  {currentStepConfig.key === 'name' ? (
                    <>
                      <div className="relative group/input">
                        <Input
                          type="text"
                          placeholder={t(language, 'onboarding.firstName')}
                          value={data.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="w-full bg-black/5 dark:bg-[#030712]/50 border-black/5 dark:border-white/5 h-14 px-6 text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 rounded-2xl focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all duration-300"
                        />
                        {errors.firstName && <p className="text-red-500 text-[10px] font-bold mt-1 pr-2">{errors.firstName}</p>}
                      </div>
                      <div className="relative group/input">
                        <Input
                          type="text"
                          placeholder={t(language, 'onboarding.lastName')}
                          value={data.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="w-full bg-black/5 dark:bg-[#030712]/50 border-black/5 dark:border-white/5 h-14 px-6 text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 rounded-2xl focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all duration-300"
                        />
                        {errors.lastName && <p className="text-red-500 text-[10px] font-bold mt-1 pr-2">{errors.lastName}</p>}
                      </div>
                    </>
                  ) : currentStepConfig.key === 'level' ? (
                    <div className="grid grid-cols-1 gap-3">
                      {(['general', 'specialist', 'subspecialist'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setData(prev => ({ ...prev, level: lvl }))}
                          className={`p-5 rounded-2xl border-2 transition-all duration-300 text-right font-bold text-lg ${
                            data.level === lvl 
                              ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' 
                              : 'border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 text-slate-500 dark:text-gray-400'
                          }`}
                        >
                          {lvl === 'general' && (language === 'fa' ? 'پزشک عمومی' : 'General Practitioner')}
                          {lvl === 'specialist' && (language === 'fa' ? 'متخصص' : 'Specialist')}
                          {lvl === 'subspecialist' && (language === 'fa' ? 'فوق تخصص' : 'Subspecialist')}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="relative group/input">
                      <Input
                        type={currentStepConfig.key === 'age' ? 'number' : 'text'}
                        placeholder={t(language, `onboarding.${currentStepConfig.key}`)}
                        value={(data as any)[currentStepConfig.key]}
                        onChange={(e) => handleInputChange(currentStepConfig.key, e.target.value)}
                        className="w-full bg-black/5 dark:bg-[#030712]/50 border-black/5 dark:border-white/5 h-14 px-6 text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 rounded-2xl focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all duration-300"
                      />
                      {errors[currentStepConfig.key] && (
                        <p className="text-red-500 text-[10px] font-bold mt-1 pr-2">{errors[currentStepConfig.key]}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-10 space-y-4">
              <Button
                onClick={currentStep === 0 ? () => setCurrentStep(1) : handleNext}
                className="relative overflow-hidden w-full h-14 bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-[#030712] text-lg font-bold rounded-2xl shadow-[0_20px_40px_-12px_rgba(16,185,129,0.3)] transition-all duration-500 group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {currentStep === 0 ? t(language, 'onboarding.getStarted') : (
                    currentStep === steps.length - 1 ? t(language, 'onboarding.finish') : t(language, 'onboarding.next')
                  )}
                  {language === 'fa' || language === 'ar' ? <ChevronLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> : <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </span>
              </Button>

              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="w-full py-2 text-sm font-bold text-slate-400 dark:text-gray-500 hover:text-emerald-500 transition-colors flex items-center justify-center gap-1"
                >
                  {language === 'fa' || language === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  {t(language, 'onboarding.previous')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Brand Link */}
        <div className="mt-10 text-center animate-in fade-in duration-1000 delay-500 opacity-40">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-600">
            Powered by Hakim Health AI Systems
          </p>
        </div>
      </div>
    </div>
  )
}
