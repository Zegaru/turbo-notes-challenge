"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "./api";
import { clearTokens, setTokens } from "./auth-store";

type TokenResponse = { access: string; refresh: string };

type LoginInput = { email: string; password: string };
type SignupInput = { email: string; password: string };

async function login(input: LoginInput): Promise<TokenResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"}/api/token/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: input.email,
        password: input.password,
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? err.message ?? "Login failed");
  }
  return res.json();
}

async function signup(input: SignupInput): Promise<TokenResponse> {
  return api.post<TokenResponse>("/api/signup/", input);
}

export function useLoginMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setTokens(data.access, data.refresh);
      queryClient.clear();
      router.push("/app");
    },
  });
}

export function useSignupMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      setTokens(data.access, data.refresh);
      queryClient.clear();
      router.push("/app");
    },
  });
}

export function useLogoutMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      clearTokens();
    },
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
    },
  });
}
