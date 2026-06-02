'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useUser } from '@/context/user-context'
import { useRouter } from 'next/navigation'
import {
  Activity,
  ArrowLeft,
  Mic,
  MicOff,
  Languages,
  Copy,
  Trash2,
  Volume2,
  Check,
  Loader2,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'

export default function TranslatorPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { user, profile, authLoading } = useUser()

  useEffect(() => {
    setMounted(true)
  }, [])
  const router = useRouter()
  const { toast } = useToast()
  
  const [isRecording, setIsRecording] = useState(false)
  const [sourceLang, setSourceLang] = useState<'fa' | 'en' | 'ar'>('fa')
  const [targetLang, setTargetLang] = useState<'fa' | 'en' | 'ar'>('en')
  const [transcript, setTranscript] = useState('')
  const [translation, setTranslation] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // Speech Recognition setup
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'doctor')) {
      router.push('/')
    }
  }, [user, profile, authLoading, router])

  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      
      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        setTranscript(prev => prev + finalTranscript)
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
        toast({
          variant: 'destructive',
          title: 'خطا در ضبط صدا',
          description: 'لطفاً دسترسی میکروفون را بررسی کنید.',
        })
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [toast])

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = sourceLang === 'fa' ? 'fa-IR' : sourceLang === 'ar' ? 'ar-SA' : 'en-US'
    }
  }, [sourceLang])

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false) // Force state to false
    } else {
      setTranscript('')
      setTranslation('')
      try {
        recognitionRef.current?.start()
        setIsRecording(true)
      } catch (e) {
        console.error('Failed to start recording:', e)
      }
    }
  }

  const handleTranslate = async () => {
    if (!transcript.trim()) return
    setIsTranslating(true)
    setTranslation('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Translate the following medical conversation from ${sourceLang} to ${targetLang}. 
              Maintain medical accuracy and professional tone.
              Original Text: ${transcript}`,
            },
          ],
          isTranslationMode: true,
        }),
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          setTranslation((prev) => prev + chunk)
        }
      }
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'خطا در ترجمه',
        description: 'متأسفانه مشکلی در سیستم ترجمه پیش آمده است.',
      })
    } finally {
      setIsTranslating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translation)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
    toast({
      title: 'کپی شد',
      description: 'ترجمه با موفقیت در حافظه کپی شد.',
    })
  }

  if (authLoading || !user || profile?.role !== 'doctor') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center">
      {/* Header */}
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
                  <Languages className="h-6 w-6 stroke-[1.5]" />
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
              <Sparkles className="h-3.5 w-3.5" />
              نسخه صوتی فعال
            </div>
          </div>
        </div>
      </header>

      <main className="w-full max-w-4xl p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-2 py-4">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">مترجم صوتی و متنی حکیم</h1>
          <p className="text-slate-500">گفتگوهای پزشکی خود را به صورت زنده ترجمه کنید</p>
        </div>

        {/* Control Card */}
        <Card className="border-none shadow-none bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl overflow-hidden">
          <CardContent className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="flex-1 w-full space-y-3">
                <Label className="text-slate-500 text-xs font-bold uppercase tracking-wider mr-1">زبان مبدأ (شما)</Label>
                <Select value={sourceLang} onValueChange={(v: any) => setSourceLang(v)}>
                  <SelectTrigger className="h-14 rounded-2xl border-none bg-white dark:bg-slate-800 shadow-none text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="fa">فارسی</SelectItem>
                    <SelectItem value="en">انگلیسی</SelectItem>
                    <SelectItem value="ar">عربی</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600">
                <ArrowLeft className="h-6 w-6 rotate-180 md:rotate-0" />
              </div>

              <div className="flex-1 w-full space-y-3">
                <Label className="text-slate-500 text-xs font-bold uppercase tracking-wider mr-1">زبان مقصد (بیمار)</Label>
                <Select value={targetLang} onValueChange={(v: any) => setTargetLang(v)}>
                  <SelectTrigger className="h-14 rounded-2xl border-none bg-white dark:bg-slate-800 shadow-none text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="fa">فارسی</SelectItem>
                    <SelectItem value="en">انگلیسی</SelectItem>
                    <SelectItem value="ar">عربی</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Microphone Section */}
            <div className="flex flex-col items-center justify-center py-10 space-y-6">
              <div className="relative">
                {isRecording && (
                  <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
                )}
                <Button
                  onClick={toggleRecording}
                  className={`h-24 w-24 rounded-full shadow-none transition-all duration-500 hover:scale-110 active:scale-95 ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isRecording ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
                </Button>
              </div>
              <div className="text-center space-y-1">
                <p className={`text-xl font-bold ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-700 dark:text-slate-300'}`}>
                  {isRecording ? 'در حال شنیدن...' : 'برای شروع صحبت کلیک کنید'}
                </p>
                <p className="text-sm text-slate-400">سیستم به صورت خودکار صوت را به متن تبدیل می‌کند</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Transcript */}
          <Card className="rounded-3xl border-slate-100 dark:border-slate-800 shadow-none overflow-hidden flex flex-col min-h-[300px]">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/30 p-5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-slate-400" />
                <CardTitle className="text-lg">متن شناسایی شده</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setTranscript('')}
                className="text-slate-400 hover:text-red-500"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col space-y-4">
              <div className="flex-1 text-lg leading-relaxed text-slate-700 dark:text-slate-300 overflow-y-auto">
                {transcript || (
                  <span className="text-slate-300 italic">هنوز صحبتی ثبت نشده است...</span>
                )}
              </div>
              <Button 
                onClick={handleTranslate}
                disabled={!transcript || isTranslating}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2 shadow-none"
              >
                {isTranslating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                ترجمه تخصصی با هوش مصنوعی
              </Button>
            </CardContent>
          </Card>

          {/* Translation Result */}
          <Card className="rounded-3xl border-green-100 dark:border-green-900/20 shadow-none overflow-hidden flex flex-col min-h-[300px] bg-green-50/20 dark:bg-green-900/5">
            <CardHeader className="bg-green-50/50 dark:bg-green-900/20 p-5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg text-green-700 dark:text-green-400">ترجمه نهایی</CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-green-600 hover:bg-green-100">
                  <Volume2 className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={copyToClipboard} className="text-green-600 hover:bg-green-100">
                  {isCopied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-1">
              <div className="text-xl font-medium leading-relaxed text-green-900 dark:text-green-100 overflow-y-auto">
                {isTranslating ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4 py-10">
                    <Loader2 className="h-10 w-10 animate-spin text-green-500" />
                    <p className="text-green-600 text-sm animate-pulse">در حال تحلیل و ترجمه تخصصی...</p>
                  </div>
                ) : translation || (
                  <span className="text-green-200 italic">نتیجه ترجمه در اینجا نمایش داده می‌شود...</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}