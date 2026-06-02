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

    // Username validation: 3-20 characters, alphanumeric and underscore
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: 'نام کاربری باید بین ۳ تا ۲۰ کاراکتر و شامل حروف، اعداد یا خط تیره باشد' },
        { status: 400 }
      )
    }

    // Password validation: minimum 8 characters
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'رمز عبور باید حداقل ۸ کاراکتر باشد' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'این نام کاربری قبلاً انتخاب شده است' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    })

    // Create session
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const session = await encrypt({ userId: user.id, username: user.username, expires })

    // Save session in cookie
    const cookieStore = await cookies()
    cookieStore.set('session', session, { expires, httpOnly: true })

    return NextResponse.json({
      message: 'ثبت‌نام با موفقیت انجام شد',
      user: { id: user.id, username: user.username },
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'خطایی در ثبت‌نام رخ داد' },
      { status: 500 }
    )
  }
}
