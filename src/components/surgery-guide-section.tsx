
'use client'

import React, { useState, useRef } from 'react'
import { 
  ClipboardList, 
  Activity, 
  Plus, 
  Trash2, 
  Printer, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Stethoscope,
  Clock,
  ChevronDown,
  ChevronUp,
  History,
  Pill,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible"
import { useToast } from '@/hooks/use-toast'
import { generateSurgeryGuideAI } from '@/lib/surgery-guide-service'

interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

interface SurgeryGuide {
  id: string
  date: string
  surgeryType: string
  preOpChecklist: ChecklistItem[]
  postOpChecklist: ChecklistItem[]
}

interface SurgeryGuideSectionProps {
  patient: any
  onSave: (guide: SurgeryGuide) => void
  existingGuides: SurgeryGuide[]
}

export function SurgeryGuideSection({ patient, onSave, existingGuides }: SurgeryGuideSectionProps) {
  const { toast } = useToast()
  const [surgeryType, setSurgeryType] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentGuide, setCurrentGuide] = useState<SurgeryGuide | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const handleGenerate = async () => {
    if (!surgeryType.trim()) {
      toast({
        variant: 'destructive',
        title: 'نوع عمل را وارد کنید',
        description: 'لطفاً نام عمل جراحی را در کادر مربوطه وارد کنید.',
      })
      return
    }

    setIsGenerating(true)
    toast({
      title: 'در حال تولید راهنما',
      description: 'هوش مصنوعی در حال تحلیل اطلاعات بیمار و تولید راهنماست...',
    })

    try {
      const result = await generateSurgeryGuideAI(patient, surgeryType)
      
      const newGuide: SurgeryGuide = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        surgeryType: surgeryType,
        preOpChecklist: result.preOp.map(text => ({ id: Math.random().toString(36).substr(2, 9), text, completed: false })),
        postOpChecklist: result.postOp.map(text => ({ id: Math.random().toString(36).substr(2, 9), text, completed: false }))
      }
      
      setCurrentGuide(newGuide)
      toast({
        title: 'راهنما تولید شد',
        description: 'می‌توانید موارد را ویرایش کرده و سپس ذخیره کنید.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطا در تولید راهنما',
        description: 'متاسفانه مشکلی در ارتباط با هوش مصنوعی پیش آمده است.',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAddItem = (type: 'pre' | 'post') => {
    if (!currentGuide) return
    const newItem: ChecklistItem = { id: Math.random().toString(36).substr(2, 9), text: '', completed: false }
    const updatedGuide = { ...currentGuide }
    if (type === 'pre') {
      updatedGuide.preOpChecklist = [...updatedGuide.preOpChecklist, newItem]
    } else {
      updatedGuide.postOpChecklist = [...updatedGuide.postOpChecklist, newItem]
    }
    setCurrentGuide(updatedGuide)
  }

  const handleRemoveItem = (type: 'pre' | 'post', id: string) => {
    if (!currentGuide) return
    const updatedGuide = { ...currentGuide }
    if (type === 'pre') {
      updatedGuide.preOpChecklist = updatedGuide.preOpChecklist.filter(i => i.id !== id)
    } else {
      updatedGuide.postOpChecklist = updatedGuide.postOpChecklist.filter(i => i.id !== id)
    }
    setCurrentGuide(updatedGuide)
  }

  const handleToggleItem = (type: 'pre' | 'post', id: string) => {
    if (!currentGuide) return
    const updatedGuide = { ...currentGuide }
    if (type === 'pre') {
      updatedGuide.preOpChecklist = updatedGuide.preOpChecklist.map(i => i.id === id ? { ...i, completed: !i.completed } : i)
    } else {
      updatedGuide.postOpChecklist = updatedGuide.postOpChecklist.map(i => i.id === id ? { ...i, completed: !i.completed } : i)
    }
    setCurrentGuide(updatedGuide)
  }

  const handleUpdateItemText = (type: 'pre' | 'post', id: string, text: string) => {
    if (!currentGuide) return
    const updatedGuide = { ...currentGuide }
    if (type === 'pre') {
      updatedGuide.preOpChecklist = updatedGuide.preOpChecklist.map(i => i.id === id ? { ...i, text } : i)
    } else {
      updatedGuide.postOpChecklist = updatedGuide.postOpChecklist.map(i => i.id === id ? { ...i, text } : i)
    }
    setCurrentGuide(updatedGuide)
  }

  const handleSave = () => {
    if (!currentGuide) return
    onSave(currentGuide)
    setCurrentGuide(null)
    setSurgeryType('')
    toast({
      title: currentGuide.id.startsWith('new_') ? 'راهنما ذخیره شد' : 'تغییرات ذخیره شد',
      description: 'راهنمای عمل در پرونده بیمار به‌روزرسانی شد.',
    })
  }

  const handleUpdateHistoryItem = (guide: SurgeryGuide, type: 'pre' | 'post', itemId: string, field: 'completed' | 'text', value: any) => {
    const updatedGuide = { ...guide }
    const checklist = type === 'pre' ? 'preOpChecklist' : 'postOpChecklist'
    
    updatedGuide[checklist] = updatedGuide[checklist].map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    )
    
    onSave(updatedGuide)
  }

  const handleAddHistoryItem = (guide: SurgeryGuide, type: 'pre' | 'post') => {
    const updatedGuide = { ...guide }
    const checklist = type === 'pre' ? 'preOpChecklist' : 'postOpChecklist'
    const newItem = { id: Math.random().toString(36).substr(2, 9), text: '', completed: false }
    
    updatedGuide[checklist] = [...updatedGuide[checklist], newItem]
    onSave(updatedGuide)
  }

  const handleRemoveHistoryItem = (guide: SurgeryGuide, type: 'pre' | 'post', itemId: string) => {
    const updatedGuide = { ...guide }
    const checklist = type === 'pre' ? 'preOpChecklist' : 'postOpChecklist'
    
    updatedGuide[checklist] = updatedGuide[checklist].filter(item => item.id !== itemId)
    onSave(updatedGuide)
  }

  const handleEditHistoryGuide = (guide: SurgeryGuide) => {
    setCurrentGuide(guide)
    setSurgeryType(guide.surgeryType)
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Card className="rounded-3xl border-none shadow-sm bg-white dark:bg-[#151515]">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
            <Stethoscope className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">تولید راهنمای عمل جراحی (Pre-op/Post-op)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input 
                placeholder="نوع عمل جراحی (مثلاً: تعویض مفصل زانو)" 
                value={surgeryType}
                onChange={(e) => setSurgeryType(e.target.value)}
                className="h-12 rounded-2xl border-slate-200 focus:ring-green-500"
              />
            </div>
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="h-12 px-6 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold transition-all shadow-lg shadow-green-500/20"
            >
              {isGenerating ? (
                <>
                  <Activity className="ml-2 h-5 w-5 animate-spin" />
                  در حال تولید...
                </>
              ) : (
                <>
                  <Activity className="ml-2 h-5 w-5" />
                  تولید با هوش مصنوعی
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Guide Section */}
      {currentGuide && (
        <Card id="printable-guide" className="rounded-3xl border-none shadow-sm bg-white dark:bg-[#151515] overflow-hidden print:shadow-none print:m-0">
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-b border-green-100 dark:border-green-900/20 flex items-center justify-between print:bg-white print:border-b-2 print:border-black">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-600 flex items-center justify-center text-white print:hidden">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-green-800 dark:text-green-300 print:text-black">راهنمای عمل {currentGuide.surgeryType}</h3>
                <p className="text-sm text-green-600/80 dark:text-green-400/80 print:text-black">بیمار: {patient.fullName}</p>
              </div>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" onClick={() => setCurrentGuide(null)} className="rounded-xl border-slate-200">
                <X className="h-5 w-5" />
              </Button>
              <Button variant="outline" onClick={handlePrint} className="rounded-xl border-slate-200">
                <Printer className="h-5 w-5 ml-2" />
                چاپ
              </Button>
              <Button onClick={handleSave} className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-500/20">
                <Save className="h-5 w-5 ml-2" />
                ذخیره در پرونده
              </Button>
            </div>
          </div>

          <CardContent className="p-8 space-y-12">
            {/* Pre-op Checklist */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 print:text-black">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200 print:text-black">چک‌لیست قبل از عمل (Pre-op)</h4>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleAddItem('pre')} className="rounded-xl text-green-600 print:hidden">
                  <Plus className="h-4 w-4 ml-1" />
                  افزودن مورد
                </Button>
              </div>
              <div className="space-y-3">
                {currentGuide.preOpChecklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 group">
                    <Checkbox 
                      checked={item.completed} 
                      onCheckedChange={() => handleToggleItem('pre', item.id)}
                      className="h-5 w-5 rounded-md border-slate-300 print:border-black"
                    />
                    <Input 
                      value={item.text} 
                      onChange={(e) => handleUpdateItemText('pre', item.id, e.target.value)}
                      className={`flex-1 border-none bg-transparent focus:ring-0 text-slate-700 dark:text-slate-300 p-0 h-auto text-base ${item.completed ? 'line-through opacity-50' : ''} print:text-black print:opacity-100`}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveItem('pre', item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 print:hidden"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            {/* Post-op Checklist */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 print:text-black">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200 print:text-black">مراقبت‌های بعد از عمل (Post-op)</h4>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleAddItem('post')} className="rounded-xl text-green-600 print:hidden">
                  <Plus className="h-4 w-4 ml-1" />
                  افزودن مورد
                </Button>
              </div>
              <div className="space-y-3">
                {currentGuide.postOpChecklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 group">
                    <Checkbox 
                      checked={item.completed} 
                      onCheckedChange={() => handleToggleItem('post', item.id)}
                      className="h-5 w-5 rounded-md border-slate-300 print:border-black"
                    />
                    <Input 
                      value={item.text} 
                      onChange={(e) => handleUpdateItemText('post', item.id, e.target.value)}
                      className={`flex-1 border-none bg-transparent focus:ring-0 text-slate-700 dark:text-slate-300 p-0 h-auto text-base ${item.completed ? 'line-through opacity-50' : ''} print:text-black print:opacity-100`}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveItem('post', item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 print:hidden"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          </CardContent>

          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-guide, #printable-guide * {
                visibility: visible;
              }
              #printable-guide {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                border: none !important;
                background: white !important;
              }
              .print\\:hidden {
                display: none !important;
              }
            }
          `}</style>
        </Card>
      )}

      {/* History Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600">
            <History className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-lg">سوابق راهنماهای عمل</h3>
        </div>

        {existingGuides && existingGuides.length > 0 ? (
          existingGuides.slice().reverse().map((guide) => (
            <Card key={guide.id} className="rounded-3xl border-none shadow-sm bg-white dark:bg-[#151515] overflow-hidden">
              <Collapsible>
                <CollapsibleTrigger className="w-full">
                  <div className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                        <ClipboardList className="h-6 w-6" />
                      </div>
                      <div className="text-right">
                        <h4 className="font-bold text-lg">راهنمای عمل {guide.surgeryType}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <Clock className="h-3 w-3" />
                          {new Date(guide.date).toLocaleDateString('fa-IR')}
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-8 mt-4">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditHistoryGuide(guide)} 
                        className="rounded-xl border-slate-200 text-blue-600 hover:text-blue-700"
                      >
                        <Save className="h-4 w-4 ml-2" />
                        ویرایش کلی
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-500" />
                          <h5 className="font-bold text-sm">چک‌لیست قبل از عمل:</h5>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleAddHistoryItem(guide, 'pre')} className="rounded-xl h-7 text-xs text-green-600">
                          <Plus className="h-3 w-3 ml-1" />
                          افزودن
                        </Button>
                      </div>
                      <div className="space-y-3 pr-2">
                        {guide.preOpChecklist.map(item => (
                          <div key={item.id} className="flex items-center gap-3 group">
                            <Checkbox 
                              checked={item.completed} 
                              onCheckedChange={(checked) => handleUpdateHistoryItem(guide, 'pre', item.id, 'completed', !!checked)}
                              className="h-4 w-4 rounded border-slate-300"
                            />
                            <Input 
                              value={item.text} 
                              onChange={(e) => handleUpdateHistoryItem(guide, 'pre', item.id, 'text', e.target.value)}
                              className={`flex-1 border-none bg-transparent focus:ring-0 text-sm text-slate-600 dark:text-slate-400 p-0 h-auto ${item.completed ? 'line-through opacity-50' : ''}`}
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveHistoryItem(guide, 'pre', item.id)}
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-orange-500" />
                          <h5 className="font-bold text-sm">مراقبت‌های بعد از عمل:</h5>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleAddHistoryItem(guide, 'post')} className="rounded-xl h-7 text-xs text-green-600">
                          <Plus className="h-3 w-3 ml-1" />
                          افزودن
                        </Button>
                      </div>
                      <div className="space-y-3 pr-2">
                        {guide.postOpChecklist.map(item => (
                          <div key={item.id} className="flex items-center gap-3 group">
                            <Checkbox 
                              checked={item.completed} 
                              onCheckedChange={(checked) => handleUpdateHistoryItem(guide, 'post', item.id, 'completed', !!checked)}
                              className="h-4 w-4 rounded border-slate-300"
                            />
                            <Input 
                              value={item.text} 
                              onChange={(e) => handleUpdateHistoryItem(guide, 'post', item.id, 'text', e.target.value)}
                              className={`flex-1 border-none bg-transparent focus:ring-0 text-sm text-slate-600 dark:text-slate-400 p-0 h-auto ${item.completed ? 'line-through opacity-50' : ''}`}
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveHistoryItem(guide, 'post', item.id)}
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-white dark:bg-[#151515] rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <ClipboardList className="h-10 w-10" />
            </div>
            <p className="text-slate-500 text-lg font-medium">هنوز هیچ راهنمای عملی برای این بیمار ثبت نشده است.</p>
          </div>
        )}
      </div>
    </div>
  )
}
