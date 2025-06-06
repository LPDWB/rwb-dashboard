import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { login, name, password } = await req.json();
    if (!login || !password || !name) {
      return NextResponse.json({ message: 'Все поля обязательны' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: 'Пароль должен быть не менее 6 символов' }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { login } });
    if (existing) {
      return NextResponse.json({ message: 'Пользователь с таким логином уже существует' }, { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        login,
        name,
        password: hashed,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ message: 'Ошибка регистрации' }, { status: 500 });
  }
}
