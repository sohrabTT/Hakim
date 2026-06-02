'use client'

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Leaf, User, Copy, Download, Sparkles, Loader2, Check, ChevronDown, ChevronUp, BrainCircuit } from 'lucide-react'
import { Skeleton } from './ui/skeleton'
import { DietPlan } from './diet-plan'

const EMOJI_REGEX = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;

const AppleEmoji = ({ text }: { text: string }) => {
  const parts = text.split(EMOJI_REGEX);
  return (
    <>
      {parts.map((part, i) => {
        if (part.match(EMOJI_REGEX)) {
          const codePoints = Array.from(part)
            .map(char => char.codePointAt(0)?.toString(16))
            .filter(cp => cp !== 'fe0f')
            .join('-');
          return (
            <img
              key={i}
              src={`https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/${codePoints}.png`}
              alt={part}
              className="inline-block w-[1.25em] h-[1.25em] align-text-bottom mx-[0.05em]"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).outerHTML = part;
              }}
            />
          );
        }
        return part;
      })}
    </>
  );
};

const processEmoji = (children: React.ReactNode): React.ReactNode => {
  return React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      return <AppleEmoji text={child} />;
    }
    return child;
  });
};

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  reasoning?: string
  image?: string
  hasImage?: boolean
  isStreaming?: boolean
}

export function ChatMessage({ role, content, reasoning, image, hasImage, isStreaming }: ChatMessageProps) {
  const isAssistant = role === 'assistant'
  const [showReasoning, setShowReasoning] = useState(false)

  return (
    <div
      className={`flex gap-4 mb-10 animate-fade-in w-full ${
        isAssistant ? 'justify-start' : 'justify-end'
      }`}
    >
      {isAssistant && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm">
            <Leaf className="w-4 h-4 text-green-500" />
          </div>
        </div>
      )}
      
      <div
        className={`max-w-[85%] sm:max-w-[80%] transition-all duration-300 flex flex-col gap-2 ${
          isAssistant
            ? 'text-slate-800 dark:text-gray-200 w-full'
            : 'bg-green-600 dark:bg-[#0f0f0f] text-white px-5 py-3 rounded-2xl border border-white/10 shadow-sm'
        }`}
      >
        {isAssistant && reasoning && (
          <div className="mb-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden transition-all duration-300">
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="w-full flex items-center justify-between px-4 py-3 text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold tracking-tight">مشاهده استدلال حکیم</span>
              </div>
              {showReasoning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showReasoning && (
              <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                  <p className="text-xs leading-relaxed text-slate-500 dark:text-gray-400 italic">
                    {reasoning}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={`text-[16px] leading-[1.6] font-normal ${
          isAssistant ? 'text-right' : 'text-right'
        }`}>
          {!isAssistant && (image || hasImage) && (
            <div className="mb-3">
              {image ? (
                <img src={image} alt="Uploaded content" className="max-w-full rounded-lg border border-slate-200 dark:border-white/10 shadow-md transition-transform hover:scale-[1.01]" />
              ) : (
                <div className="flex items-center gap-2 text-xs bg-slate-800/10 dark:bg-white/10 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5 text-slate-500 dark:text-gray-400" />
                  <span className="text-slate-600 dark:text-gray-300 opacity-90">تصویر تحلیل شده و در حافظه متنی ذخیره گشت</span>
                </div>
              )}
            </div>
          )}
          {isAssistant ? (
            <div className="prose dark:prose-invert prose-slate max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 dark:prose-pre:bg-[#050505] prose-pre:border border-slate-800 dark:border-[#1a1a1a] prose-pre:rounded-xl prose-code:text-green-400">
              {isStreaming && !content ? (
                <div className="space-y-3 py-2">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium mb-4 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>در حال نوشتن پاسخ...</span>
                  </div>
                  <Skeleton className="h-4 w-[90%] bg-slate-100 dark:bg-white/5" />
                  <Skeleton className="h-4 w-[75%] bg-slate-100 dark:bg-white/5" />
                  <Skeleton className="h-4 w-[85%] bg-slate-100 dark:bg-white/5" />
                </div>
              ) : (
                <div className="animate-slide-up">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: ({ node, inline, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '')
                        const language = match ? match[1] : ''
                        const content = String(children).trim()
                        
                        // Check if it's a diet plan (either by language tag or by content structure)
                        const isDietPlan = language === 'json_diet_plan' || 
                                          (language === 'json' && content.includes('"days"') && content.includes('"title"'))
                        
                        if (!inline && isDietPlan) {
                           try {
                             const data = JSON.parse(content)
                             return <DietPlan data={data} />
                           } catch (e) {
                             console.error('Failed to parse diet plan JSON:', e)
                             return (
                               <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl">
                                 <p className="text-amber-600 dark:text-amber-400 text-sm mb-2">در حال نمایش رژیم غذایی...</p>
                                 <pre className="text-xs overflow-x-auto text-slate-500">{content}</pre>
                               </div>
                             )
                           }
                         }

                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        )
                      },
                      pre: ({ node, children, ...props }: any) => {
                         // Check if the children contain a DietPlan component
                         // ReactMarkdown wraps code in pre. If code returns DietPlan, 
                         // we should just render it without the pre wrapper's styling.
                         const childrenArray = React.Children.toArray(children)
                         const hasDietPlan = childrenArray.some((child: any) => {
                           return child?.type?.name === 'DietPlan' || (child?.props?.data && child?.props?.days)
                         })

                         if (hasDietPlan) {
                           return <div className="my-6">{children}</div>
                         }

                        return (
                          <div className="relative group/code my-4" dir="ltr">
                            <div className="flex items-center justify-between px-4 py-2 bg-[#0a0a0a] border-b border-[#1a1a1a] rounded-t-xl text-xs text-gray-500">
                              <span>code</span>
                              <div className="flex items-center gap-3">
                                <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                                  <Copy className="w-3.5 h-3.5" />
                                  کپی
                                </button>
                                <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                                  <Download className="w-3.5 h-3.5" />
                                  دانلود
                                </button>
                              </div>
                            </div>
                            <pre {...props} className="!mt-0 !rounded-t-none overflow-x-auto p-4">
                              {children}
                            </pre>
                          </div>
                        )
                      },
                      h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 mt-6 text-slate-900 dark:text-white" {...props}>{processEmoji(props.children)}</h1>,
                      h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-3 mt-5 text-slate-900 dark:text-white" {...props}>{processEmoji(props.children)}</h2>,
                      h3: ({ node, ...props }) => <h3 className="text-lg font-bold mb-2 mt-4 text-slate-900 dark:text-white" {...props}>{processEmoji(props.children)}</h3>,
                      p: ({ node, ...props }) => {
                        const childrenText = String(props.children).trim()
                        if (childrenText.startsWith('{') && childrenText.endsWith('}') && childrenText.includes('"days"') && childrenText.includes('"title"')) {
                          try {
                            const data = JSON.parse(childrenText)
                            return <DietPlan data={data} />
                          } catch (e) {
                            // Not a valid JSON or not a diet plan, render as normal paragraph
                          }
                        }
                        return <p className="leading-relaxed mb-4" {...props}>{processEmoji(props.children)}</p>
                      },
                      li: ({ node, ...props }) => <li className="text-slate-700 dark:text-gray-300" {...props}>{processEmoji(props.children)}</li>,
                      a: ({ node, ...props }) => <a className="text-green-500 hover:underline" {...props}>{processEmoji(props.children)}</a>,
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          ) : (
            <p className="whitespace-pre-wrap"><AppleEmoji text={content} /></p>
          )}
        </div>
      </div>

      {!isAssistant && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
            S
          </div>
        </div>
      )}
    </div>
  )
}
