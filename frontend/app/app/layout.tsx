import { AuthGuard } from "@/components/auth-guard";
import { Sidebar } from "@/components/app/sidebar";
import { BottomNav } from "@/components/app/bottom-nav";
import { AppLogo } from "@/components/ui/app-logo";
import { CreateNoteProvider } from "@/lib/create-note-context";
import { Suspense } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard mode="protected">
      <Suspense
        fallback={
          <div className="mx-auto flex max-w-[1400px] min-h-screen">
            <aside className="hidden w-64 shrink-0 py-10 pl-10 pr-4 lg:block" />
            <main className="scrollbar flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-auto pb-16 lg:pb-0">
              <AppLogo size="lg" />
              <p className="font-body text-gray-500">Loading…</p>
            </main>
          </div>
        }
      >
        <CreateNoteProvider>
          <div className="mx-auto flex max-w-[1400px] min-h-screen">
            <Suspense
              fallback={
                <aside className="hidden w-64 shrink-0 py-10 pl-10 pr-4 lg:block" />
              }
            >
              <Sidebar />
            </Suspense>
            <main id="main" className="scrollbar min-h-0 flex-1 overflow-auto pb-16 lg:pb-0">
              {children}
            </main>
            <BottomNav />
          </div>
        </CreateNoteProvider>
      </Suspense>
    </AuthGuard>
  );
}
