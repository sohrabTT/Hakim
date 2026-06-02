'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@/context/user-context'
import { useRouter } from 'next/navigation'
import {
  Users,
  Activity,
  LogOut,
  Languages,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Plus,
  ShieldCheck,
  Zap,
  LayoutDashboard,
  Sun,
  Moon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'

export default function HakimDashboard() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { user, profile, logout, authLoading } = useUser()

  useEffect(() => {
    setMounted(true)
  }, [])
  const router = useRouter()
  const { toast } = useToast()
  const [patientCount, setPatientCount] = useState(0)

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'doctor')) {
      router.push('/')
    }

    const savedPatients = localStorage.getItem('doctor-patients')
    if (savedPatients) {
      setPatientCount(JSON.parse(savedPatients).length)
    }
  }, [user, profile, authLoading, router])

  if (authLoading || !user || profile?.role !== 'doctor') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex">
      {/* Vertical Sidebar (Right Side in RTL) */}
      <aside className="w-20 md:w-72 bg-slate-50/50 dark:bg-[#0c0c0c]/50 backdrop-blur-2xl border-l border-slate-200/60 dark:border-white/5 flex flex-col sticky top-0 h-screen z-50">
        <div className="p-4 md:p-6 flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex flex-col items-center md:items-start mb-10 px-2">
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-green-500/20 dark:shadow-none transition-transform hover:scale-105 duration-300">
                <Activity className="h-7 w-7 stroke-[2]" />
              </div>
              <span className="hidden md:block absolute top-3 -left-16 font-nastaliq text-3xl text-slate-900 dark:text-white drop-shadow-sm">حکیم</span>
            </div>
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 space-y-2">
            <div className="px-3 mb-4 hidden md:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">منوی اصلی</p>
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-4 h-14 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 hover:shadow-sm hover:text-green-600 dark:hover:text-green-400 transition-all duration-300 group px-4 relative overflow-hidden"
              onClick={() => router.push('/doctor/patients')}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-green-500 rounded-l-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <Users className="h-5 w-5 stroke-[1.5] text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300" />
              <span className="hidden md:inline font-bold text-sm">بیماران من</span>
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-start gap-4 h-14 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 hover:shadow-sm hover:text-green-600 dark:hover:text-green-400 transition-all duration-300 group px-4 relative overflow-hidden"
              onClick={() => router.push('/doctor/translator')}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-green-500 rounded-l-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <Languages className="h-5 w-5 stroke-[1.5] text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300" />
              <span className="hidden md:inline font-bold text-sm">مترجم همراه</span>
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-start gap-4 h-14 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 hover:shadow-sm hover:text-green-600 dark:hover:text-green-400 transition-all duration-300 group px-4 relative overflow-hidden"
              onClick={() => router.push('/doctor/chat')}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-green-500 rounded-l-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <MessageSquare className="h-5 w-5 stroke-[1.5] text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300" />
              <span className="hidden md:inline font-bold text-sm">مشاوره هوشمند</span>
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-start gap-4 h-14 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 hover:shadow-sm transition-all duration-300 group px-4 relative overflow-hidden"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-green-500 rounded-l-full opacity-0 group-hover:opacity-100 transition-opacity" />
              {!mounted ? (
                <div className="h-5 w-5" />
              ) : theme === 'dark' ? (
                <Sun className="h-5 w-5 stroke-[1.5] text-amber-500 group-hover:rotate-90 transition-transform duration-500" />
              ) : (
                <Moon className="h-5 w-5 stroke-[1.5] text-blue-600 group-hover:-rotate-12 transition-transform duration-500" />
              )}
              <span className="hidden md:inline font-bold text-sm">
                {theme === 'dark' ? 'حالت روز' : 'حالت شب'}
              </span>
            </Button>
          </nav>

          {/* User & Logout Section */}
          <div className="mt-auto pt-6 border-t border-slate-200/60 dark:border-white/5 space-y-4">
            <div className="hidden md:flex items-center gap-3 px-2 py-3 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all duration-300">
              <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 font-bold text-lg">
                {profile?.lastName?.[0] || 'د'}
              </div>
              <div className="flex flex-col items-start min-w-0">
                <p className="text-sm font-black text-slate-900 dark:text-white truncate w-full">دکتر {profile?.lastName}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate w-full">
                  {profile?.specialization}
                </p>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-4 h-14 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 group px-4" 
              onClick={logout}
            >
              <LogOut className="h-5 w-5 stroke-[1.5] group-hover:translate-x-1 transition-transform" />
              <span className="hidden md:inline font-bold text-sm">خروج از حساب</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Hero Section */}
          <section className="relative py-12 overflow-hidden rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-700">
            <div className="absolute -top-12 -right-12 opacity-5 dark:opacity-10 text-green-600">
              <Activity className="h-64 w-64" />
            </div>
            <div className="relative z-10 px-10 md:px-16 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="space-y-6 text-center md:text-right">
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-none rounded-full px-4 py-1">
                  <Zap className="h-3 w-3 ml-2 fill-current" />
                  داشبورد هوشمند
                </Badge>
                <h1 className="text-4xl md:text-6xl font-black leading-tight text-slate-900 dark:text-white">خوش آمدید، <br />دکتر {profile?.lastName}</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-xl font-medium">
                  تمامی ابزارهای مورد نیاز شما برای مدیریت بهتر بیماران در یک نگاه.
                </p>
              </div>
              <div className="flex flex-col gap-4 bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-none min-w-[240px]">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-bold">پرونده‌ها</span>
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <p className="text-4xl font-black text-slate-900 dark:text-white">{patientCount}</p>
              </div>
            </div>
          </section>

          {/* Navigation Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Chatbot Card */}
            <Card 
              className="group cursor-pointer rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-green-200 dark:hover:border-green-900/50 transition-all duration-500 overflow-hidden shadow-none hover:shadow-xl dark:hover:shadow-none"
              onClick={() => router.push('/doctor/chat')}
            >
              <CardContent className="p-10 space-y-8">
                <div className="h-16 w-16 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                  <MessageSquare className="h-8 w-8 stroke-[1.5]" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">مشاوره هوشمند</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed line-clamp-2">
                    تحلیل هوشمند پرونده و مشاوره تخصصی بر اساس داده‌های بیمار.
                  </p>
                </div>
                <Button className="w-full h-14 rounded-xl bg-green-600 hover:bg-green-700 text-white text-lg font-bold gap-3 shadow-lg dark:shadow-none transition-all">
                  شروع مشاوره
                  <ArrowRight className="h-5 w-5 stroke-[1.5]" />
                </Button>
              </CardContent>
            </Card>

            {/* Translator Card */}
            <Card 
              className="group cursor-pointer rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-green-200 dark:hover:border-green-900/50 transition-all duration-500 overflow-hidden shadow-none hover:shadow-xl dark:hover:shadow-none"
              onClick={() => router.push('/doctor/translator')}
            >
              <CardContent className="p-10 space-y-8">
                <div className="h-16 w-16 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                  <Languages className="h-8 w-8 stroke-[1.5]" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">مترجم هوشمند</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed line-clamp-2">
                    ترجمه تخصصی و زنده صوت‌به‌متن برای گفتگوهای پزشکی.
                  </p>
                </div>
                <Button className="w-full h-14 rounded-xl bg-green-600 hover:bg-green-700 text-white text-lg font-bold gap-3 shadow-lg dark:shadow-none transition-all">
                  شروع ترجمه
                  <ArrowRight className="h-5 w-5 stroke-[1.5]" />
                </Button>
              </CardContent>
            </Card>

            {/* Patients Card */}
            <Card 
              className="group cursor-pointer rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-green-200 dark:hover:border-green-900/50 transition-all duration-500 overflow-hidden shadow-none hover:shadow-xl dark:hover:shadow-none"
              onClick={() => router.push('/doctor/patients')}
            >
              <CardContent className="p-10 space-y-8">
                <div className="h-16 w-16 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                  <Users className="h-8 w-8 stroke-[1.5]" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">بیماران من</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed line-clamp-2">
                    مدیریت پرونده‌های الکترونیک و سوابق پزشکی بیماران.
                  </p>
                </div>
                <Button className="w-full h-14 rounded-xl bg-green-600 hover:bg-green-700 text-white text-lg font-bold gap-3 shadow-lg dark:shadow-none transition-all">
                  مشاهده بیماران
                  <ArrowRight className="h-5 w-5 stroke-[1.5]" />
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Footer Info */}
          <footer className="pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 stroke-[1.5]" />
              <span className="text-xs font-medium">امنیت داده‌ها توسط سیستم حکیم تضمین شده است</span>
            </div>
            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
              <span className="text-green-600">Hakim AI v2.0</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}