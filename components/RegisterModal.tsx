'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (!name.trim()) throw new Error('Имя обязательно');
      if (!email.trim()) throw new Error('Логин (email) обязателен');
      if (password.length < 6) throw new Error('Пароль должен быть не менее 6 символов');
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Ошибка регистрации');
      setSuccess(true);
      setEmail('');
      setName('');
      setPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form onSubmit={handleRegister} className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg relative">
        <button type="button" onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">✕</button>
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Регистрация</h2>
        {success ? (
          <div className="flex flex-col items-center gap-2 p-3 text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle2 className="h-6 w-6" />
            <span>Регистрация успешна! Теперь вы можете войти.</span>
          </div>
        ) : error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        {!success && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Имя</Label>
              <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email">Логин (email)</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1" />
            </div>
          </div>
        )}
        <Button type="submit" className="w-full" disabled={isLoading || success}>
          {isLoading ? 'Создание...' : success ? 'Готово' : 'Зарегистрироваться'}
        </Button>
      </form>
    </div>
  );
} 