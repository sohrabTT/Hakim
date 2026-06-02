'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useUser } from '@/context/user-context'
import { Heart } from 'lucide-react'

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
        title: isLogin ? 'ورود موفقیت‌آمیز' : 'ثبت‌نام موفقیت‌آمیز',
        description: data.message,
      })

      await refreshUser()
      router.push('/')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) return null

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {isLogin ? 'ورود به حساب کاربری' : 'ساخت حساب کاربری جدید'}
          </h1>
          <p className="mt-2 text-slate-500 dark:text-gray-400">
            {isLogin ? 'برای استفاده از دستیار سلامتی وارد شوید.' : 'به انجمن سلامتی ما بپیوندید.'}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-[#0f0f0f] p-8 rounded-2xl border border-slate-200 dark:border-[#1a1a1a] shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-gray-300">نام کاربری</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="نام کاربری خود را وارد کنید"
                className="bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-[#1a1a1a] h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-gray-300">رمز عبور</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-[#1a1a1a] h-11"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold h-11 mt-6"
              disabled={isLoading}
            >
              {isLoading ? 'در حال پردازش...' : (isLogin ? 'ورود' : 'ثبت‌نام')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500 dark:text-gray-400">
            {isLogin ? 'هنوز حساب ندارید؟' : 'قبلاً ثبت‌نام کرده‌اید؟'}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="mr-2 text-green-500 hover:underline font-medium"
            >
              {isLogin ? 'ثبت‌نام کنید' : 'وارد شوید'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
