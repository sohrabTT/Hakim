'use client'

import type { Metadata } from 'next'
import { Vazirmatn } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { UserProvider } from '@/context/user-context'
import './globals.css'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const vazirmatn = Vazirmatn({ 
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-vazirmatn',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400..700&family=Vazirmatn:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <UserProvider>
            {children}
            <Toaster />
          </UserProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
