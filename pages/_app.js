// pages/_app.js
import { SessionProvider } from 'next-auth/react';
import '../styles/globals.css'

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider 
      session={session} 
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 py-8">
          <Component {...pageProps} />
        </main>
      </div>
    </SessionProvider>
  )
}
