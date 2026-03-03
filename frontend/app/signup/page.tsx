"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "At least 8 characters"),
});

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold">Sign up</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-600">Email</label>
            <input
              {...register("email")}
              type="email"
              className="mt-1 w-full rounded border px-3 py-2"
            />
            {formState.errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {formState.errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-600">Password</label>
            <input
              {...register("password")}
              type="password"
              className="mt-1 w-full rounded border px-3 py-2"
            />
            {formState.errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {formState.errors.password.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="w-full rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            Sign up
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
