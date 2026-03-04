import { AuthGuard } from "@/components/auth-guard";
import { Sidebar } from "@/components/app/sidebar";
import { Suspense } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard mode="protected">
      <div className="mx-auto flex max-w-[1400px] min-h-screen">
        <Suspense fallback={<aside className="w-64 shrink-0 py-10 pl-10 pr-4" />}>
          <Sidebar />
        </Suspense>
        <main className="scrollbar min-h-0 flex-1 overflow-auto">{children}</main>
      </div>
    </AuthGuard>
  );
}
