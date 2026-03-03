"use client";

import { useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { getAccessToken, getRefreshToken, setTokens } from "@/lib/auth-store";

function decodeExp(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

const REFRESH_BEFORE_EXPIRY_MS = 60 * 1000;

export function SessionRefresh() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function doRefresh(): Promise<boolean> {
      const refresh = getRefreshToken();
      if (!refresh) return false;
      try {
        const data = await api.post<{ access: string }>("/api/token/refresh/", {
          refresh,
        });
        setTokens(data.access, refresh);
        return true;
      } catch {
        return false;
      }
    }

    function scheduleRefresh() {
      const access = getAccessToken();
      const refresh = getRefreshToken();
      if (!access || !refresh) return;

      const exp = decodeExp(access);
      if (!exp) return;

      const now = Math.floor(Date.now() / 1000);
      const msUntilRefresh = (exp - now) * 1000 - REFRESH_BEFORE_EXPIRY_MS;
      if (msUntilRefresh <= 0) {
        doRefresh().then((ok) => ok && scheduleRefresh());
        return;
      }

      timeoutRef.current = setTimeout(async () => {
        const ok = await doRefresh();
        if (ok) scheduleRefresh();
      }, msUntilRefresh);
    }

    scheduleRefresh();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return null;
}
