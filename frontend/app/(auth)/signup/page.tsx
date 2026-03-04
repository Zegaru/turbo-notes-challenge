"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSignupMutation } from "@/lib/auth-queries";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "At least 8 characters"),
});

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const signupMutation = useSignupMutation();

  const onSubmit = (data: FormData) => {
    signupMutation.mutate(data);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm text-center">
        <Image
          src="/images/cat.png"
          alt=""
          width={200}
          height={200}
          className="mx-auto"
        />
        <h1 className="mt-4 text-2xl font-heading font-bold text-border">
          Yay, New Friend!
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
            <input
              {...register("password")}
              type="password"
              placeholder="Password"
              className="w-full rounded-chip border border-border px-3 py-2 font-body shadow-card placeholder:text-gray-500"
            />
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
            disabled={formState.isSubmitting || signupMutation.isPending}
          >
            Sign Up
          </Button>
        </form>
        {signupMutation.isError && (
          <p className="mt-4 text-center text-sm text-red-500">
            {signupMutation.error?.message}
          </p>
        )}
        <p className="mt-6 text-center font-body text-sm text-border">
          <Link href="/login" className="underline">
            We&apos;re already friends!
          </Link>
        </p>
      </div>
    </main>
  );
}
