"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

export function useAppSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams);

  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  const noteId = searchParams.get("note");
  const categoryIdParam = searchParams.get("category");
  const editParam = searchParams.get("edit");
  const searchParam = searchParams.get("search");

  const closeHref = categoryIdParam
    ? `/app?category=${categoryIdParam}`
    : "/app";

  const setEditInUrl = useCallback(
    (edit: boolean, _focusField?: "title" | "content") => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      if (edit) {
        params.set("edit", "1");
      } else {
        params.delete("edit");
      }
      const qs = params.toString();
      router.replace(pathname + (qs ? `?${qs}` : ""));
    },
    [router, pathname]
  );

  const setSearchInUrl = useCallback(
    (search: string) => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      if (search.trim()) {
        params.set("search", search.trim());
      } else {
        params.delete("search");
      }
      const qs = params.toString();
      router.replace(pathname + (qs ? `?${qs}` : ""));
    },
    [router, pathname]
  );

  return {
    noteId,
    categoryIdParam,
    editParam,
    searchParam,
    closeHref,
    setEditInUrl,
    setSearchInUrl,
  };
}
