"use client";

import { useLogoutMutation } from "@/lib/auth-queries";

export function LogoutButton() {
  const logout = useLogoutMutation();
  return (
    <button
      type="button"
      onClick={() => logout.mutate()}
      className="block w-full rounded px-3 py-2 text-left hover:bg-gray-200"
    >
      Log out
    </button>
  );
}
