'use client'

import React, { useState } from 'react'
import { Trash2, Plus, MoreHorizontal, MessageSquare, User } from 'lucide-react'

interface ChatSession {
  id: string
  title: string
  date: Date
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
}

interface ChatHistoryProps {
  isOpen: boolean
  sessions: ChatSession[]
  onSelectSession: (sessionId: string) => void
  onNewChat: () => void
  onDeleteSession: (sessionId: string) => void
  currentSessionId?: string
}

export function ChatHistory({
  isOpen,
  sessions,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  currentSessionId,
}: ChatHistoryProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const groupedSessions = sessions.reduce(
    (acc, session) => {
      const date = new Date(session.date)
      const today = new Date()
      const diffTime = Math.abs(today.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      let group = 'قدیمی'
      if (diffDays <= 1) group = 'امروز'
      else if (diffDays <= 2) group = 'دیروز'
      else if (diffDays <= 7) group = '۷ روز اخیر'
      else if (diffDays <= 30) group = '۳۰ روز اخیر'

      if (!acc[group]) acc[group] = []
      acc[group].push(session)
      return acc
    },
    {} as Record<string, ChatSession[]>
  )

  const groupOrder = ['امروز', 'دیروز', '۷ روز اخیر', '۳۰ روز اخیر', 'قدیمی']

  return (
    <div
      className={`fixed top-0 right-0 h-screen w-64 bg-slate-50 dark:bg-[#050505] border-l border-slate-200 dark:border-[#1a1a1a] shadow-2xl transform transition-transform duration-300 z-40 flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-transparent border border-slate-200 dark:border-[#1a1a1a] text-slate-900 dark:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#0f0f0f] hover:border-green-500/30 transition-all font-medium text-sm group"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20">
              <Plus className="w-4 h-4 text-green-500" />
            </div>
            <span>گفتگوی جدید</span>
          </div>
          <MessageSquare className="w-4 h-4 text-slate-400 dark:text-gray-600" />
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-6 custom-scrollbar">
        {groupOrder.map((group) => (
          groupedSessions[group] && (
            <div key={group} className="space-y-1">
              <h3 className="text-[11px] font-semibold text-slate-400 dark:text-gray-600 px-3 mb-2 tracking-wider">
                {group}
              </h3>
              <div className="space-y-0.5">
                {groupedSessions[group].map((session) => (
                  <div
                    key={session.id}
                    onMouseEnter={() => setHoveredId(session.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`group relative flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                      currentSessionId === session.id
                        ? 'bg-green-50 dark:bg-[#0f0f0f] text-green-500 border border-green-500/10 shadow-sm'
                        : 'hover:bg-slate-100 dark:hover:bg-[#0a0a0a] text-slate-600 dark:text-gray-500 hover:text-slate-900 dark:hover:text-gray-300'
                    }`}
                  >
                    <button
                      onClick={() => onSelectSession(session.id)}
                      className="flex-1 text-right truncate text-sm"
                    >
                      {session.title}
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {hoveredId === session.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteSession(session.id)
                          }}
                          className="p-1 hover:bg-red-500/20 text-slate-400 dark:text-gray-600 hover:text-red-400 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button className="p-1 text-slate-400 dark:text-gray-700 hover:text-green-500 rounded-md">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-[#1a1a1a] mt-auto">
        <div className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#0a0a0a] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-800 flex items-center justify-center text-black text-xs font-bold">
              S
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-gray-400 group-hover:text-green-500 transition-colors">سهراب</span>
          </div>
          <MoreHorizontal className="w-4 h-4 text-slate-400 dark:text-gray-600" />
        </div>
      </div>
    </div>
  )
}
