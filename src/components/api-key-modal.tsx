'use client'

import React, { useState, useEffect } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'

interface ApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (apiKey: string) => void
}

export function ApiKeyModal({ isOpen, onClose, onSave }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const savedKey = localStorage.getItem('openrouter-api-key')
    if (savedKey) {
      setApiKey(savedKey)
    }
  }, [isOpen])

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('لطفاً کلید API را وارد کنید')
      return
    }
    localStorage.setItem('openrouter-api-key', apiKey)
    onSave(apiKey)
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-green-100">
          <h2 className="text-xl font-bold text-slate-900">
            کلید OpenRouter API
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            برای استفاده از ویژگی‌های بهتر، کلید API خود را از{' '}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 font-medium hover:underline"
            >
              OpenRouter
            </a>{' '}
            دریافت کنید.
          </p>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-900">
              کلید API
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value)
                  setError('')
                }}
                placeholder="sk-or-xxxxx..."
                className="w-full px-4 py-3 border border-green-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3 text-slate-500 hover:text-slate-700 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {error && (
              <p className="text-sm text-red-500 font-medium">{error}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-green-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-green-200 text-green-600 rounded-xl hover:bg-green-50 transition-colors font-medium"
          >
            انصراف
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
          >
            ذخیره
          </button>
        </div>
      </div>
    </div>
  )
}
