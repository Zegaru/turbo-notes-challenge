"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLoginMutation } from "@/lib/auth-queries";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const loginMutation = useLoginMutation();

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data);
  };

  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm text-center">
        <Image
          src="/images/cactus.png"
          alt=""
          width={120}
          height={120}
          className="mx-auto"
        />
        <h1 className="mt-4 text-2xl font-heading font-bold text-border">
          Yay, You&apos;re Back!
        </h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 space-y-4 text-left"
          data-testid="login-form"
        >
          <div>
            <label htmlFor="login-email" className="sr-only">
              Email address
            </label>
            <input
              {...register("email")}
              id="login-email"
              type="email"
              placeholder="Email address"
              data-testid="login-email"
              className="w-full rounded-chip border border-border px-3 py-2 font-body shadow-card placeholder:text-gray-500 focus-ring"
            />
            {formState.errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {formState.errors.email.message}
              </p>
            )}
          </div>
          <div>
            <div className="relative">
              <label htmlFor="login-password" className="sr-only">
                Password
              </label>
              <input
                {...register("password")}
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full rounded-chip border border-border px-3 py-2 pr-12 font-body shadow-card placeholder:text-gray-500 focus-ring"
                data-testid="login-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 focus-ring rounded"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="mt-1 flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-border hover:underline"
              >
                Forgot?
              </Link>
            </div>
            {formState.errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {formState.errors.password.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={formState.isSubmitting || loginMutation.isPending}
            data-testid="login-submit"
          >
            Login
          </Button>
        </form>
        {loginMutation.isError && (
          <p className="mt-4 text-center text-sm text-red-500">
            {loginMutation.error?.message}
          </p>
        )}
        <p className="mt-6 text-center font-body text-sm text-border">
          <Link href="/signup" className="underline">
            Oops! I&apos;ve never been here before
          </Link>
        </p>
      </div>
    </main>
  );
}
