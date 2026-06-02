'use client'

import React, { useState } from 'react'
import { useUser } from '@/context/user-context'
import { t, type Language } from '@/lib/i18n'
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
      const phoneClean = data.phone.replace(/\D/g, '')
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
    setData({ ...data, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const renderHakimText = () => {
    const text = t(language, 'onboarding.welcome')
    if (language === 'fa' || language === 'ar') {
      const parts = text.split('حکیم')
      if (parts.length > 1) {
        return (
          <>
            {parts[0]}
            <span className="noto-nastaliq-urdu-custom text-green-600 dark:text-green-400 mx-1">حکیم</span>
            {parts[1]}
          </>
        )
      }
    }
    return text
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          {currentStep === 0 ? (
            <>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {renderHakimText()}
              </h1>
              <p className="text-slate-600 dark:text-gray-400 text-lg">
                {t(language, 'onboarding.subtitle')}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {t(language, currentStepConfig.title)}
              </h2>
              <p className="text-slate-600 dark:text-gray-400">
                {t(language, currentStepConfig.subtitle)}
              </p>
              <div className="mt-4 flex gap-2 justify-center">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      index <= currentStep ? 'bg-green-500 w-8' : 'bg-green-200 w-2'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="animate-slide-up">
          {currentStepConfig.key === 'language' ? (
            /* Language Selection */
            <>
              <div className="grid grid-cols-3 gap-3">
                {(['en', 'fa', 'ar'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageSelect(lang)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 font-semibold text-sm ${
                      language === lang 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                        : 'border-slate-200 dark:border-[#1a1a1a] bg-white dark:bg-[#0f0f0f] text-slate-500 dark:text-gray-400'
                    }`}
                  >
                    {lang === 'en' && 'English'}
                    {lang === 'fa' && 'فارسی'}
                    {lang === 'ar' && 'العربية'}
                  </button>
                ))}
              </div>
              {errors.language && (
                <p className="text-red-500 text-sm mt-4 text-center">{errors.language}</p>
              )}
            </>
          ) : currentStepConfig.key === 'role' ? (
            /* Role Selection */
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => handleRoleSelect('patient')}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                    data.role === 'patient'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                      : 'border-slate-200 dark:border-[#1a1a1a] bg-white dark:bg-[#0f0f0f] text-slate-600 dark:text-gray-300'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${data.role === 'patient' ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-[#1a1a1a] text-slate-400'}`}>
                    <User className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{t(language, 'onboarding.patient')}</p>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect('doctor')}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                    data.role === 'doctor'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                      : 'border-slate-200 dark:border-[#1a1a1a] bg-white dark:bg-[#0f0f0f] text-slate-600 dark:text-gray-300'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${data.role === 'doctor' ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-[#1a1a1a] text-slate-400'}`}>
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{t(language, 'onboarding.doctor')}</p>
                  </div>
                </button>

                <div
                  className="flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 dark:border-[#151515] bg-slate-50/50 dark:bg-[#080808] text-slate-400 dark:text-gray-600 cursor-not-allowed relative overflow-hidden opacity-60"
                >
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#1a1a1a]">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="text-right flex-1">
                    <p className="font-bold text-lg">{t(language, 'onboarding.caregiver')}</p>
                  </div>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-[10px] font-bold">
                    {t(language, 'onboarding.comingSoon')}
                  </div>
                </div>
              </div>
              {errors.role && (
                <p className="text-red-500 text-sm mt-4 text-center">{errors.role}</p>
              )}
            </div>
          ) : currentStepConfig.key === 'name' ? (
            /* Name Input */
            <div className="space-y-4">
              <input
                type="text"
                placeholder={t(language, 'onboarding.firstName')}
                value={data.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-green-200 dark:border-[#1a1a1a] bg-white dark:bg-[#0f0f0f] text-slate-900 dark:text-white focus:border-green-500 focus:outline-none transition-colors placeholder-slate-400 dark:placeholder-gray-600"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm">{errors.firstName}</p>
              )}
              <input
                type="text"
                placeholder={t(language, 'onboarding.lastName')}
                value={data.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-green-200 dark:border-[#1a1a1a] bg-white dark:bg-[#0f0f0f] text-slate-900 dark:text-white focus:border-green-500 focus:outline-none transition-colors placeholder-slate-400 dark:placeholder-gray-600"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm">{errors.lastName}</p>
              )}
            </div>
          ) : currentStepConfig.key === 'phone' ? (
            /* Phone Input */
            <div>
              <input
                type="tel"
                placeholder={t(language, 'onboarding.phone')}
                value={data.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-green-200 dark:border-[#1a1a1a] bg-white dark:bg-[#0f0f0f] text-slate-900 dark:text-white focus:border-green-500 focus:outline-none transition-colors placeholder-slate-400 dark:placeholder-gray-600"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-2">{errors.phone}</p>
              )}
            </div>
          ) : currentStepConfig.key === 'specialization' ? (
            /* Specialization Input (Doctor only) */
            <div>
              <input
                type="text"
                placeholder={t(language, 'onboarding.doctorSpecializationTitle')}
                value={data.specialization}
                onChange={(e) => handleInputChange('specialization', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-green-200 dark:border-[#1a1a1a] bg-white dark:bg-[#0f0f0f] text-slate-900 dark:text-white focus:border-green-500 focus:outline-none transition-colors placeholder-slate-400 dark:placeholder-gray-600"
              />
              {errors.specialization && (
                <p className="text-red-500 text-sm mt-2">{errors.specialization}</p>
              )}
            </div>
          ) : currentStepConfig.key === 'level' ? (
            /* Level Selection (Doctor only) */
            <div className="grid grid-cols-1 gap-3">
              {(['general', 'specialist', 'subspecialist'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setData(prev => ({ ...prev, level: lvl }))}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-right font-semibold ${
                    data.level === lvl 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                      : 'border-slate-200 dark:border-[#1a1a1a] bg-white dark:bg-[#0f0f0f] text-slate-500 dark:text-gray-400'
                  }`}
                >
                  {lvl === 'general' && (language === 'fa' ? 'پزشک عمومی' : 'General Practitioner')}
                  {lvl === 'specialist' && (language === 'fa' ? 'متخصص' : 'Specialist')}
                  {lvl === 'subspecialist' && (language === 'fa' ? 'فوق تخصص' : 'Subspecialist')}
                </button>
              ))}
            </div>
          ) : currentStepConfig.key === 'department' ? (
            /* Department Input (Doctor only) */
            <div>
              <input
                type="text"
                placeholder={t(language, 'onboarding.doctorDepartmentTitle')}
                value={data.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-green-200 dark:border-[#1a1a1a] bg-white dark:bg-[#0f0f0f] text-slate-900 dark:text-white focus:border-green-500 focus:outline-none transition-colors placeholder-slate-400 dark:placeholder-gray-600"
              />
              {errors.department && (
                <p className="text-red-500 text-sm mt-2">{errors.department}</p>
              )}
            </div>
          ) : currentStepConfig.key === 'age' ? (
            /* Age Input */
            <div>
              <input
                type="number"
                placeholder={t(language, 'onboarding.age')}
                value={data.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-green-200 dark:border-[#1a1a1a] bg-white dark:bg-[#0f0f0f] text-slate-900 dark:text-white focus:border-green-500 focus:outline-none transition-colors placeholder-slate-400 dark:placeholder-gray-600"
                min="1"
                max="150"
              />
              {errors.age && (
                <p className="text-red-500 text-sm mt-2">{errors.age}</p>
              )}
            </div>
          ) : (
            /* Location Input */
            <div>
              <input
                type="text"
                placeholder={t(language, 'onboarding.location')}
                value={data.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-green-200 dark:border-[#1a1a1a] bg-white dark:bg-[#0f0f0f] text-slate-900 dark:text-white focus:border-green-500 focus:outline-none transition-colors placeholder-slate-400 dark:placeholder-gray-600"
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-2">{errors.location}</p>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep > 0 && (
          <div className="mt-8 flex gap-3 animate-slide-up">
            <button
              onClick={handlePrevious}
              className="flex-1 px-4 py-3 rounded-xl border border-green-200 dark:border-[#1a1a1a] text-green-600 dark:text-green-400 font-semibold hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              {t(language, 'onboarding.previous')}
            </button>
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-3 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 active:scale-95"
            >
              {currentStep === steps.length - 1
                ? t(language, 'onboarding.finish')
                : t(language, 'onboarding.next')}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {currentStep === 0 && (
          <button
            onClick={() => setCurrentStep(1)}
            className="w-full mt-8 px-4 py-3 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors animate-slide-up active:scale-95"
          >
            {t(language, 'onboarding.getStarted')}
          </button>
        )}
      </div>
    </div>
  )
}
