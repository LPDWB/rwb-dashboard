'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const [login, setLogin] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (!name.trim()) throw new Error('Имя обязательно');
      if (!login.trim()) throw new Error('Логин обязателен');
      if (password.length < 6) throw new Error('Пароль должен быть не менее 6 символов');
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, name, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Ошибка регистрации');
      // Автоматический вход после регистрации
      const loginRes = await signIn('credentials', {
        login,
        password,
        redirect: false,
      });
      if (loginRes?.error) throw new Error(loginRes.error);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <form onSubmit={handleRegister} className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Регистрация</h2>
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Имя</Label>
            <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="login">Логин</Label>
            <Input id="login" type="text" value={login} onChange={e => setLogin(e.target.value)} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1" />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Создание...' : 'Зарегистрироваться'}
        </Button>
        <div className="text-center mt-2">
          Уже есть аккаунт?{' '}
          <Link href="/auth/signin" className="text-blue-600 hover:underline">
            Войти
          </Link>
        </div>
      </form>
    </div>
  );
}
