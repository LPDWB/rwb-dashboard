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
        onClick={() => signIn()}
        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <User className="w-4 h-4 mr-2" />
        Войти
      </button>
    );
  }

  const userName = session.user?.name || 'Пользователь';
  const userEmail = session.user?.email || '';

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
          <UserCircle className="w-5 h-5 mr-2" />
          {userName}
          <ChevronDown className="w-4 h-4 ml-2" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[220px] bg-white rounded-md shadow-lg border border-gray-200 p-1"
          sideOffset={5}
        >
          <DropdownMenu.Item className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
            {userEmail}
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
          <DropdownMenu.Item
            className="px-3 py-2 text-sm text-red-600 hover:bg-gray-100 rounded cursor-pointer flex items-center"
            onClick={() => signOut()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
} 