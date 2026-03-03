import { AuthGuard } from "@/components/auth-guard";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard mode="protected">
      <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r bg-gray-50 p-4">
        <nav className="space-y-2">
          <Link
            href="/app"
            className="block rounded px-3 py-2 hover:bg-gray-200"
          >
            Notes
          </Link>
          <Link
            href="/app"
            className="block rounded px-3 py-2 hover:bg-gray-200"
          >
            New note
          </Link>
          <LogoutButton />
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
    </AuthGuard>
  );
}
