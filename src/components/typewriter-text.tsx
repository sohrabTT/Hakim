'use client'

import React, { useState, useEffect } from 'react'

interface TypewriterTextProps {
  text: string
  isStreaming?: boolean
}

export function TypewriterText({ text, isStreaming }: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('')
  const [displayedLength, setDisplayedLength] = useState(0)

  useEffect(() => {
    if (!isStreaming) {
      setDisplayText(text)
      return
    }

    if (displayedLength < text.length) {
      const timer = setTimeout(() => {
        setDisplayedLength(displayedLength + 1)
        setDisplayText(text.substring(0, displayedLength + 1))
      }, 15)

      return () => clearTimeout(timer)
    }
  }, [text, displayedLength, isStreaming])

  useEffect(() => {
    if (!isStreaming) {
      setDisplayText(text)
      setDisplayedLength(text.length)
    }
  }, [text, isStreaming])

  return (
    <>
      {displayText}
      {isStreaming && (
        <span className="inline-block ml-1 w-2 h-2 bg-current rounded-full animate-pulse"></span>
      )}
    </>
  )
}
