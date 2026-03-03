"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type HealthStatus = { status?: string } | null;

export default function AppPage() {
  const [health, setHealth] = useState<HealthStatus>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ status: string }>("/api/health/")
      .then(setHealth)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold">Notes</h1>
      <p className="mt-2 text-gray-500">Main content area placeholder.</p>
      <div className="mt-6 rounded border p-4">
        <h2 className="text-sm font-medium text-gray-600">Backend health</h2>
        {health && (
          <p className="mt-1 text-green-600">{health.status ?? "OK"}</p>
        )}
        {error && <p className="mt-1 text-red-500">{error}</p>}
        {!health && !error && <p className="mt-1 text-gray-400">Checking…</p>}
      </div>
    </div>
  );
}
