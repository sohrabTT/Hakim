'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/user-context'
import { useTheme } from 'next-themes'
import { PatientMedicalForm } from '@/components/patient-medical-form'
import { ArrowRight, User, Scale, Ruler, Droplets, Stethoscope, Pill, AlertTriangle, Activity, Sun, Moon, LogOut, Heart, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react'

const bloodTypeLabels: Record<string, string> = {
  'A+': 'A+', 'A-': 'A-', 'B+': 'B+', 'B-': 'B-',
  'AB+': 'AB+', 'AB-': 'AB-', 'O+': 'O+', 'O-': 'O-',
  'unknown': 'نامشخص',
}

export default function ProfilePage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { user, profile, isMedicalComplete, logout, authLoading } = useUser()
  const [editing, setEditing] = useState(false)
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#030712] flex items-center justify-center">
        <div className="animate-pulse w-8 h-8 bg-emerald-500/20 rounded-full" />
      </div>
    )
  }

  if (!user) return null

  if (editing) {
    return <PatientMedicalForm onComplete={() => setEditing(false)} />
  }

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-[#030712] transition-colors duration-500 font-sans" dir="rtl">
      {/* Background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-black/5 dark:border-[#1a1a1a]">
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors font-bold text-sm">
          <ChevronRight className="w-5 h-5" />
          بازگشت به چت
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-emerald-500">
            {!mounted ? <div className="w-5 h-5" /> : (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
          </button>
          <button onClick={logout} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-slate-400 hover:text-red-500">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 pb-24">
        {/* Profile Header */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="relative inline-block group mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-20 dark:opacity-25" />
            <div className="relative flex items-center justify-center w-16 h-16 bg-white dark:bg-[#0f172a] rounded-2xl border border-black/5 dark:border-white/5 shadow-xl">
              <Heart className="w-8 h-8 text-emerald-500 dark:text-emerald-400 fill-emerald-500/10" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
            {profile?.firstName} {profile?.lastName}
          </h1>
          <p className="text-slate-500 dark:text-gray-400 font-medium">{profile?.role === 'doctor' ? 'پزشک' : 'بیمار'}</p>
        </div>

        {/* Info Cards */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150">
          {/* Personal Info */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-b from-black/5 dark:from-white/20 to-transparent rounded-[2rem] opacity-20 pointer-events-none" />
            <div className="relative bg-white/70 dark:bg-[#0f172a]/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-black/5 dark:border-white/5">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-500" />
                اطلاعات شخصی
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="سن" value={profile?.age ? `${profile.age} سال` : '—'} />
                <InfoItem label="موقعیت" value={profile?.location || '—'} />
                <InfoItem label="شماره تماس" value={profile?.phone || '—'} />
                <InfoItem label="زبان" value={profile?.language === 'fa' ? 'فارسی' : profile?.language === 'ar' ? 'العربية' : 'English'} />
              </div>
            </div>
          </div>

          {/* Medical Info */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-b from-black/5 dark:from-white/20 to-transparent rounded-[2rem] opacity-20 pointer-events-none" />
            <div className="relative bg-white/70 dark:bg-[#0f172a]/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-black/5 dark:border-white/5">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-500" />
                اطلاعات پزشکی
              </h2>
              {isMedicalComplete ? (
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge icon={User} label={profile?.gender === 'male' ? 'مرد' : profile?.gender === 'female' ? 'زن' : '—'} />
                    <Badge icon={Scale} label={profile?.weight ? `${profile.weight} کیلوگرم` : '—'} />
                    <Badge icon={Ruler} label={profile?.height ? `${profile.height} سانتی‌متر` : '—'} />
                    <Badge icon={Droplets} label={bloodTypeLabels[profile?.bloodType || ''] || '—'} />
                  </div>
                  <div className="space-y-3 mt-2">
                    <MedicalRow icon={Stethoscope} title="بیماری‌های زمینه‌ای" value={profile?.underlyingDiseases || '—'} />
                    <MedicalRow icon={AlertTriangle} title="حساسیت دارویی" value={profile?.drugAllergies || '—'} />
                    <MedicalRow icon={AlertTriangle} title="حساسیت غذایی" value={profile?.foodAllergies || '—'} />
                    <MedicalRow icon={Pill} title="داروهای مصرفی" value={profile?.currentMedications || '—'} />
                    <MedicalRow icon={Activity} title="سابقه جراحی" value={profile?.previousSurgeries || '—'} />
                    <div className="flex items-center gap-2 flex-wrap mt-3">
                      <Badge icon={ShieldCheck} label={profile?.smokingAlcohol ? `مصرف: ${profile.smokingAlcohol}` : '—'} />
                      <Badge icon={Sparkles} label={profile?.activityLevel ? `فعالیت: ${profile.activityLevel}` : '—'} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-400 dark:text-gray-500 mb-4 font-medium">اطلاعات پزشکی شما ثبت نشده است</p>
                  <button onClick={() => setEditing(true)} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-colors">
                    تکمیل اطلاعات پزشکی
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Button */}
        {isMedicalComplete && (
          <div className="mt-8 text-center animate-in fade-in duration-1000 delay-500">
            <button onClick={() => setEditing(true)} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-[0_20px_40px_-12px_rgba(16,185,129,0.3)] transition-all duration-300">
              ویرایش اطلاعات پزشکی
            </button>
          </div>
        )}

        <div className="mt-8 text-center opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-600">
            اطلاعات شما نزد حکیم محفوظ است
          </p>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500">{label}</p>
      <p className="font-bold text-slate-800 dark:text-gray-200">{value}</p>
    </div>
  )
}

function Badge({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#030712] rounded-xl border border-black/5 dark:border-white/5 text-xs font-bold text-slate-600 dark:text-gray-300">
      <Icon className="w-3 h-3 text-emerald-500" />
      {label}
    </span>
  )
}

function MedicalRow({ icon: Icon, title, value }: { icon: any; title: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-[#030712]/50 rounded-2xl">
      <div className="p-2 bg-white dark:bg-[#0f172a] rounded-xl border border-black/5 dark:border-white/5 shrink-0">
        <Icon className="w-4 h-4 text-emerald-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500">{title}</p>
        <p className="text-sm font-medium text-slate-700 dark:text-gray-300 break-words">{value}</p>
      </div>
    </div>
  )
}
