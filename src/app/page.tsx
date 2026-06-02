'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useUser } from '@/context/user-context'
import { ChatMessage } from '@/components/chat-message'
import { ChatInput } from '@/components/chat-input'
import { ChatHistory } from '@/components/chat-history'
import { Onboarding } from '@/components/onboarding'
import { SurgeryDietForm } from '@/components/surgery-diet-form'
import { useToast } from '@/hooks/use-toast'
import { Share2, Menu, Sun, Moon, LogOut, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { t } from '@/lib/i18n'

interface Message {
  role: 'user' | 'assistant'
  content: string
  reasoning?: string
  image?: string
  hasImage?: boolean
}

interface ChatSession {
  id: string
  title: string
  date: Date
  messages: Message[]
}

export default function ChatPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { user, profile, isOnboarded, logout, authLoading } = useUser()
  const { toast } = useToast()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])
  const [isLoading, setIsLoading] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>('')
  const [streamingId, setStreamingId] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showSurgeryForm, setShowSurgeryForm] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
      } else if (profile?.role === 'doctor') {
        router.push('/doctor')
      } else if (!isOnboarded) {
        setShowOnboarding(true)
      } else {
        setShowOnboarding(false)
      }
    }
  }, [authLoading, user, isOnboarded, profile, router])

  useEffect(() => {
    loadSessions()
  }, [user])

  const loadSessions = async () => {
    try {
      const res = await fetch('/api/chat-sessions')
      if (res.ok) {
        const data = await res.json()
        setSessions(data.map((s: any) => ({
          id: s.id,
          title: s.title,
          date: new Date(s.updatedAt),
          messages: JSON.parse(s.messages || '[]'),
        })))
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
    }
  }

  const saveSessions = async (updatedSessions: ChatSession[]) => {
    setSessions(updatedSessions)
    for (const session of updatedSessions) {
      await fetch(`/api/chat-sessions/${session.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: session.title,
          messages: session.messages,
        }),
      })
    }
  }

  const handleShare = async () => {
    const url = window.location.origin + (currentSessionId ? `?session=${currentSessionId}` : '')
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: 'لینک کپی شد',
        description: 'لینک این گفتگو در حافظه کپی شد.',
      })
    } catch (err) {
      console.error('Failed to copy: ', err)
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'کپی کردن لینک با خطا مواجه شد.',
      })
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const createNewSession = async () => {
    try {
      const res = await fetch('/api/chat-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'گفتگوی جدید', messages: [] }),
      })
      if (res.ok) {
        const data = await res.json()
        const newSession: ChatSession = {
          id: data.id,
          title: 'گفتگوی جدید',
          date: new Date(data.createdAt),
          messages: [],
        }
        setSessions((prev) => [newSession, ...prev])
        setCurrentSessionId(newSession.id)
        setMessages([])
        setHistoryOpen(false)
      }
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  const loadSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/chat-sessions/${sessionId}`)
      if (res.ok) {
        const data = await res.json()
        const msgs = JSON.parse(data.messages || '[]')
        setCurrentSessionId(sessionId)
        setMessages(msgs)
        setHistoryOpen(false)
      }
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  }

  const deleteSession = async (sessionId: string) => {
    try {
      await fetch(`/api/chat-sessions/${sessionId}`, { method: 'DELETE' })
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      if (currentSessionId === sessionId) {
        if (sessions.length > 1) {
          const nextSession = sessions.find((s) => s.id !== sessionId)
          if (nextSession) loadSession(nextSession.id)
        } else {
          createNewSession()
        }
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  const updateSessionTitle = async (sessionId: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
    )
    await fetch(`/api/chat-sessions/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    })
  }

  const handleSendMessage = async (userMessage: string, image?: string, isTranslationMode: boolean = false) => {
    if (userMessage === 'رژیم غذایی قبل و بعد از عمل') {
      setShowSurgeryForm(true)
      return
    }

    if (!currentSessionId) {
      await createNewSession()
    }

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage, image },
    ]
    setMessages(newMessages)
    setIsLoading(true)
    setStreamingId('assistant')

    if (messages.length === 0 && currentSessionId) {
      updateSessionTitle(
        currentSessionId,
        userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : '')
      )
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: newMessages,
          isTranslationMode,
          userProfile: profile ? {
            firstName: profile.firstName,
            lastName: profile.lastName,
            age: profile.age,
            location: profile.location,
            language: profile.language,
          } : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to get response')
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

      if (currentSessionId) {
        const finalMessages = [
          ...newMessages,
          { role: 'assistant' as const, content: assistantMessage, reasoning: reasoningContent },
        ]
        await fetch(`/api/chat-sessions/${currentSessionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: finalMessages }),
        })
      }
    } catch (error: any) {
      console.error('[v0] Chat Error:', error)
      const errorMessage = error?.message || 'خطایی رخ داد. لطفاً دوباره تلاش کنید.'
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errorMessage,
        },
      ])
    } finally {
      setIsLoading(false)
      setStreamingId(null)
    }
  }

  const handleSurgeryFormSubmit = (data: any) => {
    const formattedData = `
📋 فرم ارزیابی تغذیه جراحی تکمیل شد:

**بخش ۱: اطلاعات عمل**
- نوع عمل: ${data.surgeryType}
- تاریخ عمل: ${data.surgeryDate}
- روش عمل: ${data.surgeryMethod}

**بخش ۲: اطلاعات پایه**
- سن: ${data.age} | جنسیت: ${data.gender}
- قد: ${data.height} سانتی‌متر | وزن: ${data.weight} کیلوگرم

**بخش ۳: سابقه پزشکی**
- بیماری‌های زمینه‌ای: ${data.underlyingDiseases || 'ندارد'}
- سابقه کم‌خونی: ${data.anemiaHistory || 'ندارد'}
- مشکلات گوارشی: ${data.digestiveIssues || 'ندارد'}

**بخش ۴: داروها و مکمل‌ها**
- داروها: ${data.currentMeds || 'ندارد'}
- مکمل‌ها: ${data.supplements || 'ندارد'}

**بخش ۵: حساسیت‌ها**
- غذایی: ${data.foodAllergies || 'ندارد'}
- دارویی: ${data.medAllergies || 'ندارد'}

**بخش ۶: تغذیه و سبک زندگی**
- تعداد وعده‌ها: ${data.mealFrequency}
- مصرف مایعات: ${data.fluidIntake}
- مصرف پروتئین: ${data.proteinIntake}
- میوه و سبزیجات: ${data.fruitVegIntake}
- سیگار/الکل: ${data.smokingAlcohol}
- سطح فعالیت: ${data.activityLevel}

**بخش ۷: هدف و تنظیمات**
- هدف اصلی: ${data.mainGoal}
- مدت زمان رژیم: ${data.dietDuration} روز
- تنوع رژیم: ${data.dietVariety === 'different' ? 'هر روز متفاوت باشد' : 'وعده‌ها تکرار شوند (برای راحتی بیشتر)'}

لطفاً بر اساس این اطلاعات، رژیم غذایی دقیق و شخصی‌سازی شده برای قبل و بعد از عمل من ارائه دهید. توجه داشته باشید که رژیم باید دقیقاً برای ${data.dietDuration} روز تنظیم شود و از نظر تنوع مطابق با خواسته من باشد.
    `
    handleSendMessage(formattedData)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-slate-500 dark:text-gray-400 font-medium">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />
  }

  return (
    <div className="flex h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white overflow-hidden font-sans" dir="rtl">
      <ChatHistory
        isOpen={historyOpen}
        sessions={sessions}
        onSelectSession={loadSession}
        onNewChat={createNewSession}
        onDeleteSession={deleteSession}
        currentSessionId={currentSessionId}
      />

      <SurgeryDietForm 
        isOpen={showSurgeryForm} 
        onClose={() => setShowSurgeryForm(false)} 
        onSubmit={handleSurgeryFormSubmit} 
      />

      <div className="flex flex-col flex-1 relative overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200 dark:border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            {!historyOpen && (
              <button
                onClick={() => setHistoryOpen(true)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-[#1a1a1a] rounded-lg transition-colors text-gray-400 hover:text-green-500"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 font-medium -translate-x-4">
              <span className="text-green-500 noto-nastaliq-urdu-custom text-base">حکیم</span>
            </div>
          </div>
          
          <h1 className="text-sm font-semibold text-slate-800 dark:text-gray-200 absolute left-1/2 -translate-x-1/2 hidden md:block">
            {(() => {
              const currentSession = sessions.find(s => s.id === currentSessionId);
              if (currentSession && currentSession.title !== 'گفتگوی جدید') {
                return currentSession.title;
              }
              return '';
            })()}
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-[#1a1a1a] rounded-lg transition-colors text-gray-400 hover:text-green-500"
            >
              {!mounted ? <div className="w-5 h-5" /> : (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
            </button>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-slate-100 dark:hover:bg-[#1a1a1a] rounded-lg transition-colors text-gray-400 hover:text-green-500"
              title="اشتراک‌گذاری"
            >
              <Share2 className="w-5 h-5" />
            </button>
            {user && (
              <button
                onClick={logout}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                title="خروج"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-6 custom-scrollbar">
          <div className="max-w-3xl mx-auto w-full">
            {messages.length === 0 ? (
              <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8 animate-fade-in text-center">
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                    چطور می‌توانم کمکتان کنم؟
                  </h2>
                  <p className="text-slate-500 dark:text-gray-400 text-lg max-w-lg mx-auto leading-relaxed">
                    من آماده‌ام تا به سوالات سلامتی، تغذیه و ورزشی شما پاسخ دهم.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mt-8">
                  {[
                    'رژیم غذایی قبل و بعد از عمل',
                    'تغذیه مناسب برای دیابت',
                    'تحلیل جواب آزمایش خون',
                    'راه‌های بهبود کیفیت خواب'
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSendMessage(suggestion)}
                      className="p-4 text-right bg-slate-50 dark:bg-[#0f0f0f] hover:bg-slate-100 dark:hover:bg-[#1a1a1a] border border-slate-200 dark:border-[#1a1a1a] hover:border-green-500/30 rounded-2xl transition-all group shadow-sm"
                    >
                      <span className="text-sm text-slate-700 dark:text-gray-300 group-hover:text-green-500">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8 pb-32">
                {messages.map((message, index) => (
                  <ChatMessage
                      key={index}
                      role={message.role}
                      content={message.content}
                      reasoning={message.reasoning}
                      image={message.image}
                      hasImage={message.hasImage}
                      isStreaming={
                        streamingId === 'assistant' &&
                        index === messages.length - 1 &&
                        message.role === 'assistant'
                      }
                    />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-white dark:from-[#0a0a0a] via-white dark:via-[#0a0a0a] to-transparent z-10">
          <div className="max-w-3xl mx-auto w-full flex flex-col items-center">
            <ChatInput onSubmit={handleSendMessage} isLoading={isLoading} />
            <p className="text-[10px] text-center text-slate-400 dark:text-gray-500 mt-3 tracking-wide">
              حکیم ممکن است اشتباه کند. اطلاعات مهم را بررسی کنید.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
