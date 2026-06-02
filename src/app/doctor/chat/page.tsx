'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useUser } from '@/context/user-context'
import { ChatMessage } from '@/components/chat-message'
import { ChatInput } from '@/components/chat-input'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft, 
  Users, 
  MessageSquare, 
  Sparkles, 
  User as UserIcon,
  Search,
  Activity,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTheme } from 'next-themes'

interface Message {
  role: 'user' | 'assistant'
  content: string
  reasoning?: string
  image?: string
  hasImage?: boolean
}

interface Patient {
  id: string
  fullName: string
  nationalId: string
  birthDate: string
  gender: 'male' | 'female' | 'other'
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
}

export default function DoctorChatPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { user, profile, authLoading } = useUser()

  useEffect(() => {
    setMounted(true)
  }, [])
  const router = useRouter()
  const { toast } = useToast()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'doctor')) {
      router.push('/')
    }

    const savedPatients = localStorage.getItem('doctor-patients')
    if (savedPatients) {
      setPatients(JSON.parse(savedPatients))
    }
  }, [user, profile, authLoading, router])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const filteredPatients = patients.filter(p => 
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.nationalId.includes(searchQuery)
  )

  useEffect(() => {
    if (selectedPatient) {
      const savedHistory = localStorage.getItem(`doctor-chat-history-${selectedPatient.id}`)
      if (savedHistory) {
        setMessages(JSON.parse(savedHistory))
      } else {
        setMessages([])
      }
    }
  }, [selectedPatient])

  // Save messages to patient history whenever they change
  useEffect(() => {
    if (selectedPatient && messages.length > 0) {
      localStorage.setItem(`doctor-chat-history-${selectedPatient.id}`, JSON.stringify(messages))
    }
  }, [messages, selectedPatient])

  const handleSendMessage = async (userMessage: string, image?: string) => {
    if (!selectedPatient) return

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage, image },
    ]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      // Create patient context for the prompt
      const patientContext = `
اطلاعات بیمار جهت کانتکست:
نام: ${selectedPatient.fullName}
کد ملی: ${selectedPatient.nationalId}
جنسیت: ${selectedPatient.gender === 'male' ? 'مرد' : 'زن'}
بیماری‌های زمینه‌ای: ${selectedPatient.medicalHistory.underlyingDiseases.join(', ') || 'ندارد'}
سابقه جراحی: ${selectedPatient.medicalHistory.previousSurgeries || 'ندارد'}
حساسیت‌ها: غذایی (${selectedPatient.allergies.foodAllergies || 'ندارد'})، دارویی (${selectedPatient.allergies.drugAllergies || 'ندارد'})
داروهای فعلی: ${selectedPatient.medications.currentMedications || 'ندارد'}
علائم حیاتی اخیر: فشار خون (${selectedPatient.vitalSigns.bloodPressure})، BMI (${selectedPatient.vitalSigns.bmi})
`

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: newMessages,
          userProfile: {
            ...profile,
            role: 'doctor',
            patientContext // Send patient context to API
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''
      let reasoningContent = ''

      if (reader) {
        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.trim()) continue
            try {
              const data = JSON.parse(line)
              if (data.type === 'reasoning') {
                reasoningContent += data.content
              } else if (data.type === 'content') {
                assistantMessage += data.content
              }

              setMessages((prev) => {
                const updated = [...prev]
                const lastMsg = updated[updated.length - 1]
                if (lastMsg?.role === 'assistant') {
                  lastMsg.content = assistantMessage
                  lastMsg.reasoning = reasoningContent
                } else {
                  updated.push({ 
                    role: 'assistant', 
                    content: assistantMessage,
                    reasoning: reasoningContent 
                  })
                }
                return updated
              })
            } catch (e) {
              console.error('Failed to parse chunk:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat Error:', error)
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'مشکلی در دریافت پاسخ پیش آمد.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || !user || profile?.role !== 'doctor') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white dark:bg-[#0a0a0a] overflow-hidden" dir="rtl">
      {/* Patients Sidebar */}
      <aside className="w-80 border-l border-slate-200 dark:border-white/5 flex flex-col bg-slate-50/50 dark:bg-[#0c0c0c]/50 backdrop-blur-xl">
        <div className="p-6 border-b border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()} 
              className="rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">مشاوره هوشمند</h1>
          </div>
          <div className="relative group">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-green-500 transition-colors" />
            <Input 
              placeholder="جستجوی بیمار..." 
              className="pr-10 h-11 rounded-xl border-none bg-white dark:bg-slate-800 shadow-sm focus-visible:ring-1 focus-visible:ring-green-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {filteredPatients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => {
                  setSelectedPatient(patient)
                  setMessages([]) // Clear chat when patient changes
                }}
                className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 text-right ${
                  selectedPatient?.id === patient.id
                    ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
                    : 'hover:bg-white dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                  selectedPatient?.id === patient.id ? 'bg-white/20' : 'bg-green-100 dark:bg-green-900/30 text-green-600'
                }`}>
                  {patient.fullName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{patient.fullName}</p>
                  <p className={`text-xs ${selectedPatient?.id === patient.id ? 'text-white/70' : 'text-slate-400'}`}>
                    کد ملی: {patient.nationalId}
                  </p>
                </div>
                <ChevronRight className={`h-5 w-5 ${selectedPatient?.id === patient.id ? 'text-white' : 'text-slate-300'}`} />
              </button>
            ))}
            {filteredPatients.length === 0 && (
              <div className="text-center py-10">
                <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">بیماری یافت نشد</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-white dark:bg-[#0a0a0a]">
        {/* Chat Header */}
        <header className="h-20 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-8 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            {selectedPatient ? (
              <>
                <div className="h-10 w-10 rounded-xl bg-green-500 flex items-center justify-center text-white">
                  <UserIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">گفتگو درباره: {selectedPatient.fullName}</h2>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-slate-500 font-medium">آماده مشاوره تخصصی</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 text-slate-400">
                <MessageSquare className="h-6 w-6" />
                <p className="font-medium">لطفاً یک بیمار را برای شروع گفتگو انتخاب کنید</p>
              </div>
            )}
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
            <Badge variant="secondary" className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-none px-4 py-1.5 rounded-full font-bold flex gap-2 items-center">
              <Sparkles className="h-3.5 w-3.5" />
              حکیم هوشمند
            </Badge>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {messages.length === 0 && selectedPatient && (
              <div className="text-center py-20 space-y-6">
                <div className="h-20 w-20 bg-green-50 dark:bg-green-900/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-green-600">
                  <Activity className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">تحلیل هوشمند پرونده</h3>
                <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                  من به تمامی اطلاعات پرونده <span className="text-green-600 font-bold">{selectedPatient.fullName}</span> دسترسی دارم. 
                  می‌توانید درباره وضعیت سلامتی، تداخلات دارویی یا رژیم غذایی او از من بپرسید.
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <ChatMessage 
                key={index}
                role={message.role}
                content={message.content}
                reasoning={message.reasoning}
                image={message.image}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-8 border-t border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md">
          <div className="max-w-4xl mx-auto">
            <ChatInput 
              onSubmit={handleSendMessage}
              isLoading={isLoading || !selectedPatient}
            />
            {!selectedPatient && (
              <p className="text-center text-xs text-slate-400 mt-4">برای فعال شدن چت، ابتدا یک بیمار را از لیست سمت راست انتخاب کنید.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
