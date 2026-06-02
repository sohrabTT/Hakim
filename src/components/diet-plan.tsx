'use client'

import React from 'react'
import { Calendar, Clock, Utensils, Coffee, Sun, Moon, Info, Download, Printer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { generateDietPDF } from '@/lib/pdf-utils'

interface Meal {
  name: string
  time?: string
  content: string
}

interface DayPlan {
  day: string
  meals: Meal[]
  notes?: string
}

interface DietPlanProps {
  data: {
    title?: string
    description?: string
    days: DayPlan[]
    generalNotes?: string
  }
  patientName?: string
  type?: 'preOp' | 'postOp'
}

const MealIcon = ({ name }: { name: string }) => {
  const n = name.toLowerCase()
  if (n.includes('صبحانه')) return <Coffee className="w-4 h-4 text-orange-400" />
  if (n.includes('ناهار')) return <Sun className="w-4 h-4 text-yellow-500" />
  if (n.includes('شام')) return <Moon className="w-4 h-4 text-blue-400" />
  if (n.includes('میان')) return <Clock className="w-4 h-4 text-green-400" />
  return <Utensils className="w-4 h-4 text-slate-400" />
}

export function DietPlan({ data, patientName = 'بیمار', type = 'postOp' }: DietPlanProps) {
  if (!data || !data.days || data.days.length === 0) return null

  const handleDownloadPDF = async () => {
    await generateDietPDF(patientName, data, type)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="w-full space-y-6 my-6 animate-in fade-in duration-500" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 no-print">
        <div className="flex flex-col gap-2 border-r-4 border-green-500 pr-4 py-1 bg-green-50/30 dark:bg-green-900/10 rounded-l-xl flex-1 w-full">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">
            {data.title || 'برنامه رژیم غذایی شخصی‌سازی شده'}
          </h2>
          {data.description && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
              {data.description}
            </p>
          )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrint}
            className="rounded-xl gap-2 border-slate-200 dark:border-slate-800 flex-1 sm:flex-none"
          >
            <Printer className="w-4 h-4" />
            چاپ
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleDownloadPDF}
            className="rounded-xl gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 flex-1 sm:flex-none"
          >
            <Download className="w-4 h-4" />
            دریافت PDF
          </Button>
        </div>
      </div>

      <div id={`diet-plan-${type}`} className="pdf-container p-2 sm:p-4 bg-white dark:bg-[#0a0a0a] rounded-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {data.days.map((dayPlan, idx) => (
            <Card key={idx} className="overflow-hidden border-slate-200 dark:border-[#1a1a1a] bg-white dark:bg-[#0d0d0d] shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl flex flex-col h-full">
              <CardHeader className="bg-slate-50/80 dark:bg-[#151515] py-4 px-5 border-b border-slate-100 dark:border-[#1a1a1a]">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-green-700 dark:text-green-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {dayPlan.day}
                  </CardTitle>
                  <Badge variant="secondary" className="text-[10px] font-medium bg-white dark:bg-black border border-slate-100 dark:border-slate-800 shadow-sm">
                    روز {idx + 1}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-5 flex-1">
                {dayPlan.meals.map((meal, mIdx) => (
                  <div key={mIdx} className="relative ps-4 border-s-2 border-slate-100 dark:border-[#1a1a1a] last:border-0">
                    <div className="absolute start-[-5px] top-1.5 w-2 h-2 rounded-full bg-slate-300 dark:bg-[#333] ring-4 ring-white dark:ring-[#0d0d0d]" />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MealIcon name={meal.name} />
                          <span className="text-xs font-bold text-slate-800 dark:text-gray-200">
                            {meal.name}
                          </span>
                        </div>
                        {meal.time && (
                          <span className="text-[10px] text-slate-400 dark:text-gray-500 bg-slate-50 dark:bg-[#1a1a1a] px-2 py-0.5 rounded-full">
                            {meal.time}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed ps-1 mt-1">
                        {meal.content}
                      </p>
                    </div>
                  </div>
                ))}
                {dayPlan.notes && (
                  <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-800/20">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                        {dayPlan.notes}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {data.generalNotes && (
          <div className="mt-8 bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 rounded-2xl p-6 flex gap-4 items-start">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl text-yellow-600 dark:text-yellow-400 shrink-0">
              <Info className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-yellow-800 dark:text-yellow-400 text-sm">نکات کلی رژیم</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-500 leading-relaxed">
                {data.generalNotes}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

