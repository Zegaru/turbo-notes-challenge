"use client";

import { getAccessToken } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function LandingRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (getAccessToken()) {
      router.replace("/app");
    }
  }, [router]);

  return null;
}
