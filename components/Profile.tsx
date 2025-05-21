import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function Profile() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow">
      {session.user.image && (
        <Image
          src={session.user.image}
          alt={session.user.name || 'Profile picture'}
          width={48}
          height={48}
          className="rounded-full"
        />
      )}
      <div>
        <h2 className="text-xl font-semibold">{session.user.name}</h2>
        <p className="text-gray-600">{session.user.email}</p>
      </div>
      <button
        onClick={() => signOut()}
        className="ml-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Выйти
      </button>
    </div>
  );
} 