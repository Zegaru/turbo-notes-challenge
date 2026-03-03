import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Notes Challenge</h1>
      <p className="text-gray-500">Frontend placeholder.</p>
      <nav className="flex gap-4">
        <Link href="/login" className="text-blue-600 underline">
          Log in
        </Link>
        <Link href="/signup" className="text-blue-600 underline">
          Sign up
        </Link>
        <Link href="/app" className="text-blue-600 underline">
          App
        </Link>
      </nav>
    </main>
  );
}
