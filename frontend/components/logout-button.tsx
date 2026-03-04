"use client";

import { Button } from "@/components/ui/button";
import { useLogoutMutation } from "@/lib/auth-queries";

export function LogoutButton() {
  const logout = useLogoutMutation();
  return (
    <Button variant="ghost" type="button" onClick={() => logout.mutate()}>
      Log out
    </Button>
  );
}
