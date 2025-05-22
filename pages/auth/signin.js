import { signIn, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import ManualAuthForm from '../../components/ManualAuthForm';
import { useRouter } from 'next/router';

export default function SignIn() {
  const [showManualAuth, setShowManualAuth] = useState(false);
  const [googleAuthAvailable, setGoogleAuthAvailable] = useState(true);
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    // Check if Google auth is configured
    const hasGoogleConfig = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
    setGoogleAuthAvailable(!!hasGoogleConfig);
  }, []);

  useEffect(() => {
    // Redirect to home page if user is authenticated
    if (status === 'authenticated') {
      router.replace('/');
    }
  }, [status, router]);

  const handleManualAuth = (userData) => {
    // Redirect to home page after manual auth
    router.replace('/');
  };

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Don't render the sign-in form if user is authenticated
  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-dark-200 rounded-xl shadow-lg"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Вход в систему
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Войдите, чтобы получить доступ к функциям
          </p>
        </div>

        {!showManualAuth ? (
          <div className="mt-8 space-y-6">
            {googleAuthAvailable ? (
              <>
                <motion.button
                  onClick={() => signIn('google', { callbackUrl: '/' })}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                    />
                  </svg>
                  Войти через Google
                </motion.button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-dark-200 text-gray-500 dark:text-gray-400">
                      или
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm"
              >
                Авторизация через Google временно недоступна. Вы можете создать профиль вручную.
              </motion.div>
            )}
            <motion.button
              onClick={() => setShowManualAuth(true)}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-300 hover:bg-gray-50 dark:hover:bg-dark-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Продолжить без авторизации
            </motion.button>
          </div>
        ) : (
          <ManualAuthForm onAuth={handleManualAuth} />
        )}
      </motion.div>
    </div>
  );
} 