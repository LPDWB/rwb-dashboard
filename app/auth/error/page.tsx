import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Ошибка авторизации | RWB Dashboard",
  description: "Страница ошибки авторизации",
};

const errorMessages: Record<string, string> = {
  OAuthAccountNotLinked: "Эта учетная запись Google уже связана с другим пользователем",
  OAuthSignin: "Ошибка при входе через Google",
  OAuthCallback: "Ошибка при обработке ответа от Google",
  OAuthCreateAccount: "Ошибка при создании учетной записи",
  EmailCreateAccount: "Ошибка при создании учетной записи",
  Callback: "Ошибка при обработке ответа от провайдера",
  EmailSignin: "Ошибка при отправке email для входа",
  CredentialsSignin: "Неверные учетные данные",
  SessionRequired: "Требуется авторизация",
  Default: "Неизвестная ошибка",
};

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams.error || "Default";
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Ошибка авторизации
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {errorMessage}
          </p>
        </div>
        <div className="mt-8">
          <Link href="/auth/signin" className="w-full">
            <Button className="w-full">
              Вернуться на страницу входа
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 