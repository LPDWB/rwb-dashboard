'use client';

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Suspense } from "react";

const errorMessages: Record<string, string> = {
  CredentialsSignin: "Неверные учетные данные",
  SessionRequired: "Требуется авторизация",
  Default: "Неизвестная ошибка",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error") || "Default";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Ошибка авторизации
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {errorMessages[error] || errorMessages.Default}
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <Link href="/auth/signin" passHref>
            <Button className="w-full" variant="default">
              Вернуться на страницу входа
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-pulse">
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mt-6 mx-auto"></div>
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mt-4 mx-auto"></div>
          </div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
} 