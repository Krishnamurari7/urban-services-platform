import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from "react";

async function LoginMessages({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string; redirect?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      {params.message && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {params.message}
        </div>
      )}
      {params.error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {params.error}
        </div>
      )}
    </>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string; redirect?: string }>;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <Suspense fallback={null}>
          <LoginMessages searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
