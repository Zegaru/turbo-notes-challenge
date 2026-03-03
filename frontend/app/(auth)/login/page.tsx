"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import Link from "next/link";
import { useLoginMutation } from "@/lib/auth-queries";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const loginMutation = useLoginMutation();

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-4">
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
        >
          <div>
            <input
              {...register("email")}
              type="email"
              placeholder="Email address"
              className="w-full rounded-chip border border-border px-3 py-2 font-body shadow-card placeholder:text-gray-500"
            />
            {formState.errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {formState.errors.email.message}
              </p>
            )}
          </div>
          <div>
            <div className="relative">
              <input
                {...register("password")}
                type="password"
                placeholder="Password"
                className="w-full rounded-chip border border-border px-3 py-2 pr-16 font-body shadow-card placeholder:text-gray-500"
              />
              <Link
                href="/forgot-password"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-border hover:underline"
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
          <button
            type="submit"
            disabled={formState.isSubmitting || loginMutation.isPending}
            className="w-full rounded-card border border-border bg-bg px-4 py-2 font-body shadow-card hover:bg-hover disabled:opacity-50"
          >
            Login
          </button>
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
