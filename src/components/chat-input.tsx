'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader, Sparkles, Search, Paperclip, ArrowUp, X, Mic, MicOff, Languages } from 'lucide-react'

interface ChatInputProps {
  onSubmit: (message: string, image?: string) => void
  isLoading: boolean
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = 'fa-IR'

      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }
        
        if (finalTranscript) {
          setInput(prev => prev + (prev ? ' ' : '') + finalTranscript)
        }
      }

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }

      recognitionInstance.onend = () => {
        setIsRecording(false)
      }

      setRecognition(recognitionInstance)
    }
  }, [])

  const toggleRecording = () => {
    if (!recognition) {
      alert('مرورگر شما از قابلیت تبدیل صوت به متن پشتیبانی نمی‌کند.')
      return
    }

    if (isRecording) {
      recognition.stop()
      setIsRecording(false)
    } else {
      try {
        recognition.start()
        setIsRecording(true)
      } catch (err) {
        console.error('Start recognition failed:', err)
      }
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((input.trim() || image) && !isLoading) {
      onSubmit(input, image || undefined)
      setInput('')
      setImage(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      handleSubmit(e as any)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full bg-slate-50 dark:bg-[#0f0f0f] rounded-[24px] border transition-all duration-300 shadow-2xl overflow-hidden ${
          'border-slate-200 dark:border-[#1a1a1a] focus-within:border-green-500/50'
      }`}
    >
      {image && (
        <div className="px-4 pt-4 flex gap-2">
          <div className="relative group">
            <img src={image} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-white/10 shadow-sm" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-slate-800 dark:bg-slate-700 hover:bg-red-500 text-white rounded-full p-1.5 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
      <div className="px-4 pt-4">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="سوال خود را بپرسید یا تصویر آزمایش را آپلود کنید..."
          disabled={isLoading}
          rows={1}
          className="w-full bg-transparent resize-none focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-gray-200 text-base leading-relaxed placeholder-slate-400 dark:placeholder-gray-600 custom-scrollbar text-center"
          style={{ minHeight: '44px', maxHeight: '200px', fontFamily: "var(--font-sans), var(--font-emoji)" }}
        />
      </div>

      <div className="flex items-center justify-between px-3 pb-3">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all duration-200 text-slate-500 dark:text-gray-400 group"
            title="آپلود تصویر آزمایش"
          >
            <Paperclip className="w-5 h-5 group-hover:text-green-500 transition-colors" />
          </button>

          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2 rounded-xl transition-all duration-300 group relative ${
              isRecording 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-500' 
                : 'hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400'
            }`}
            title={isRecording ? 'توقف ضبط' : 'تبدیل گفتار به متن'}
          >
            {isRecording ? (
              <>
                <MicOff className="w-5 h-5 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              </>
            ) : (
              <Mic className="w-5 h-5 group-hover:text-green-500 transition-colors" />
            )}
          </button>

        </div>

        <button
          type="submit"
          disabled={isLoading || (!input.trim() && !image)}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${
            input.trim() || image
              ? 'bg-green-500 text-white dark:text-black hover:scale-105 active:scale-95 shadow-lg shadow-green-500/20' 
              : 'bg-slate-200 dark:bg-[#1a1a1a] text-slate-400 dark:text-gray-600 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <Loader className="w-5 h-5 animate-spin text-green-500" />
          ) : (
            <ArrowUp className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  )
}
