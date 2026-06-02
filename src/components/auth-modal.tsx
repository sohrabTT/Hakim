'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useUser } from '@/context/user-context'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { refreshUser, user } = useUser()

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

      if (refreshUser) {
        await refreshUser()
      }
      
      onClose()
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[425px] bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-[#1a1a1a]" 
        dir="rtl"
        showCloseButton={!!user}
        onPointerDownOutside={(e) => !user && e.preventDefault()}
        onEscapeKeyDown={(e) => !user && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white text-center">
            {isLogin ? 'ورود به حساب کاربری' : 'ساخت حساب کاربری جدید'}
          </DialogTitle>
          <DialogDescription className="text-center text-slate-500 dark:text-gray-400">
            {isLogin ? 'برای ادامه گفتگو وارد شوید.' : 'نام کاربری و رمز عبور خود را انتخاب کنید.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-gray-300">نام کاربری</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="bg-slate-50 dark:bg-[#0f0f0f] border-slate-200 dark:border-[#1a1a1a]"
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
              className="bg-slate-50 dark:bg-[#0f0f0f] border-slate-200 dark:border-[#1a1a1a]"
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold h-11"
            disabled={isLoading}
          >
            {isLoading ? 'در حال پردازش...' : (isLogin ? 'ورود' : 'ثبت‌نام')}
          </Button>
        </form>
        <div className="text-center text-sm text-slate-500 dark:text-gray-400">
          {isLogin ? 'هنوز حساب ندارید؟' : 'قبلاً ثبت‌نام کرده‌اید؟'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="mr-2 text-green-500 hover:underline font-medium"
          >
            {isLogin ? 'ثبت‌نام کنید' : 'وارد شوید'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
