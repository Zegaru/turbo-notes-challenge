import { AuthGuard } from "@/components/auth-guard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard mode="auth">{children}</AuthGuard>;
}
