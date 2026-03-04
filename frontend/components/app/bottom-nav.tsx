"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCreateNote } from "@/lib/create-note-context";
import { useLogoutMutation } from "@/lib/auth-queries";
import { CategoriesSheet } from "./categories-sheet";

export function BottomNav() {
  const searchParams = useSearchParams();
  const logout = useLogoutMutation();
  const categoryId = searchParams.get("category");
  const { createNote, isPending } = useCreateNote();
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const baseHref = "/app";
  const allNotesHref = baseHref;
  const isAllNotes = !categoryId;

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-bg/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] lg:hidden"
        aria-label="Bottom navigation"
      >
        <Link
          href={allNotesHref}
          aria-current={isAllNotes ? "page" : undefined}
          className={`flex flex-1 flex-col items-center gap-1 py-3 px-2 font-body text-xs transition-colors rounded focus-ring ${
            isAllNotes ? "text-accent font-semibold" : "text-gray-600"
          }`}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          All Notes
        </Link>

        <button
          type="button"
          onClick={() => setCategoriesOpen(true)}
          className="flex flex-1 flex-col items-center gap-1 py-3 px-2 font-body text-xs text-gray-600 transition-colors hover:text-accent rounded focus-ring"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          Categories
        </button>

        <button
          type="button"
          onClick={() => createNote()}
          disabled={isPending}
          className="flex flex-1 flex-col items-center gap-1 py-3 px-2 font-body text-xs font-medium text-white bg-accent hover:bg-accent/90 disabled:opacity-50 transition-colors min-w-0 rounded focus-ring"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Note
        </button>

        <button
          type="button"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="flex flex-1 flex-col items-center gap-1 py-3 px-2 font-body text-xs text-gray-600 transition-colors hover:text-accent disabled:opacity-50 rounded focus-ring"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Log out
        </button>
      </nav>

      <CategoriesSheet open={categoriesOpen} onOpenChange={setCategoriesOpen} />
    </>
  );
}
