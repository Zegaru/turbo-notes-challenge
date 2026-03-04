"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useAppSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const noteId = searchParams.get("note");
  const categoryIdParam = searchParams.get("category");
  const editParam = searchParams.get("edit");

  const closeHref = categoryIdParam
    ? `/app?category=${categoryIdParam}`
    : "/app";

  const setEditInUrl = useCallback(
    (edit: boolean, _focusField?: "title" | "content") => {
      const params = new URLSearchParams(searchParams.toString());
      if (edit) {
        params.set("edit", "1");
      } else {
        params.delete("edit");
      }
      const qs = params.toString();
      router.replace(pathname + (qs ? `?${qs}` : ""));
    },
    [router, pathname, searchParams]
  );

  return {
    noteId,
    categoryIdParam,
    editParam,
    closeHref,
    setEditInUrl,
  };
}
