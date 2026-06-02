'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useUser } from '@/context/user-context'
import { Heart, User, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { refreshUser, user, authLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'خطایی رخ داد')
      }

      toast({
        title: isLogin ? 'خوش آمدید' : 'تبریک می‌گوییم',
        description: isLogin ? 'دسترسی شما با موفقیت تایید شد.' : 'حساب کاربری شما با موفقیت ایجاد شد.',
      })

      await refreshUser()
      router.push('/')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطا در عملیات',
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) return null

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white dark:bg-[#030712] transition-colors duration-500 font-sans" dir="rtl">
      {/* Background Animation Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] dark:opacity-[0.1]">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[440px] px-6">
        {/* Logo/Brand Section */}
        <div className="flex flex-col items-center mb-10 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-20 dark:opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
            <div className="relative flex items-center justify-center w-20 h-20 bg-white dark:bg-[#0f172a] rounded-2xl border border-black/5 dark:border-white/5 shadow-xl dark:shadow-2xl">
              <Heart className="w-10 h-10 text-emerald-500 dark:text-emerald-400 fill-emerald-500/10 dark:fill-emerald-400/10" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
              حکیم <Sparkles className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            </h1>
            <p className="text-slate-500 dark:text-gray-400 text-lg font-medium">
              {isLogin ? 'هوش مصنوعی سلامت و درمان' : 'شروع یک تجربه جدید در سلامت'}
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="relative group animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150">
          <div className="absolute -inset-[1px] bg-gradient-to-b from-black/5 dark:from-white/20 to-transparent rounded-[2rem] opacity-20 pointer-events-none" />
          <div className="relative bg-white/70 dark:bg-[#0f172a]/80 backdrop-blur-2xl p-10 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div className="relative group/input">
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 dark:text-gray-500 group-focus-within/input:text-emerald-500 dark:group-focus-within/input:text-emerald-400 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="نام کاربری"
                    className="w-full bg-white/50 dark:bg-[#030712]/50 border-black/5 dark:border-white/5 h-14 pr-12 text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 rounded-2xl focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all duration-300"
                    required
                  />
                </div>

                <div className="relative group/input">
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 dark:text-gray-500 group-focus-within/input:text-emerald-500 dark:group-focus-within/input:text-emerald-400 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="رمز عبور"
                    className="w-full bg-white/50 dark:bg-[#030712]/50 border-black/5 dark:border-white/5 h-14 pr-12 text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 rounded-2xl focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-slate-500 dark:text-gray-500 font-medium">امنیت تایید شده</span>
                </div>
                {isLogin && (
                  <button type="button" className="text-xs text-emerald-600 dark:text-emerald-400/70 hover:text-emerald-500 transition-colors font-medium">
                    فراموشی رمز عبور؟
                  </button>
                )}
              </div>

              <Button 
                type="submit" 
                className="relative overflow-hidden w-full h-14 bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-[#030712] text-lg font-bold rounded-2xl shadow-[0_20px_40px_-12px_rgba(16,185,129,0.3)] hover:shadow-[0_20px_40px_-12px_rgba(16,185,129,0.4)] transition-all duration-500 group"
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 dark:border-[#030712]/30 border-t-white dark:border-t-[#030712] rounded-full animate-spin" />
                      در حال پردازش...
                    </span>
                  ) : (
                    <>
                      {isLogin ? 'ورود به پنل' : 'ساخت حساب'}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
                    </>
                  )}
                </span>
              </Button>
            </form>

            <div className="mt-10 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/5 dark:border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/90 dark:bg-[#0f172a] px-3 text-slate-400 dark:text-gray-500 font-bold tracking-wider">یا</span>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="group relative inline-flex items-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span>{isLogin ? 'هنوز حساب ندارید؟' : 'قبلاً ثبت‌نام کرده‌اید؟'}</span>
                <span className="text-emerald-600 dark:text-emerald-400 group-hover:underline font-bold">
                  {isLogin ? 'ساخت حساب جدید' : 'وارد شوید'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 flex items-center justify-center gap-6 text-slate-400 dark:text-gray-600 animate-in fade-in duration-1000 delay-500">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3 text-emerald-500/50" />
            تایید شده توسط hakim-ai
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-gray-800" />
          <div className="text-[10px] font-bold uppercase tracking-widest">
            نسخه ۲.۰.۴
          </div>
        </div>
      </div>
    </div>
  )
}

