import React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { User, LogOut, UserCircle, ChevronDown } from 'lucide-react';

export default function UserMenu() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  if (isLoading) {
    return (
      <div className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 border border-transparent rounded-md">
        Загрузка...
      </div>
    );
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn('google')}
        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <User className="w-4 h-4 mr-2" />
        Войти
      </button>
    );
  }

  const userName = session.user?.name || 'Пользователь';
  const userEmail = session.user?.email || '';
  const userImage = session.user?.image;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="inline-flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 border border-gray-200 shadow-sm transition-all focus:outline-none">
          <div className="flex items-center space-x-2">
            {userImage ? (
              <img
                src={userImage}
                alt={userName}
                className="w-6 h-6 rounded-full ring-2 ring-white"
              />
            ) : (
              <UserCircle className="w-6 h-6 text-gray-400" />
            )}
            <span className="max-w-[150px] truncate">{userName}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="w-48 mt-1 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 divide-y divide-gray-100"
          sideOffset={5}
        >
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userName}
            </p>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {userEmail}
            </p>
          </div>

          <div className="py-1">
            <DropdownMenu.Item className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
              <UserCircle className="w-4 h-4 mr-2" />
              Мой профиль
            </DropdownMenu.Item>

            <DropdownMenu.Item
              className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выйти из аккаунта
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
} 