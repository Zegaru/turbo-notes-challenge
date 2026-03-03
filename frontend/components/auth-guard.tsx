"use client";

import { getAccessToken } from "@/lib/auth-store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const AUTH_ROUTES = ["/login", "/signup"];
const PROTECTED_PREFIX = "/app";

type AuthGuardProps = {
  children: React.ReactNode;
  mode: "auth" | "protected";
};

export function AuthGuard({ children, mode }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    const isAuthRoute = AUTH_ROUTES.includes(pathname);
    const isProtected = pathname.startsWith(PROTECTED_PREFIX);

    if (mode === "auth") {
      if (token) {
        router.replace("/app");
        return;
      }
    } else if (mode === "protected") {
      if (!token) {
        router.replace("/login");
        return;
      }
    }

    queueMicrotask(() => setReady(true));
  }, [pathname, mode, router]);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
