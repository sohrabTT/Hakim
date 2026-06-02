import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { encrypt } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'نام کاربری و رمز عبور الزامی است' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور اشتباه است' },
        { status: 401 }
      )
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور اشتباه است' },
        { status: 401 }
      )
    }

    // Create session
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const session = await encrypt({ userId: user.id, username: user.username, expires })

    // Save session in cookie
    const cookieStore = await cookies()
    cookieStore.set('session', session, { expires, httpOnly: true })

    return NextResponse.json({
      message: 'ورود با موفقیت انجام شد',
      user: { id: user.id, username: user.username },
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'خطایی در ورود رخ داد' },
      { status: 500 }
    )
  }
}
