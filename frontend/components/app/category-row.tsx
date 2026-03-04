"use client";

import {
  colorToDotClass,
  type Category,
  type CategoryColor,
} from "@/lib/api-client";
import {
  useDeleteCategoryMutation,
  useRenameCategoryMutation,
} from "@/lib/categories-queries";
import {
  Dialog,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { InlineMessage } from "@/components/ui/inline-message";

type CategoryRowProps = {
  category: Category;
  isSelected: boolean;
  baseHref: string;
};

export function CategoryRow({ category, isSelected, baseHref }: CategoryRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(category.name);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const renameMutation = useRenameCategoryMutation({
    category,
    onSettled: () => setIsEditing(false),
  });
  const deleteMutation = useDeleteCategoryMutation({
    category,
    isSelected,
    baseHref,
    onSuccess: () => setDeleteOpen(false),
  });

  const renameError = renameMutation.error?.message ?? null;
  const deleteError = deleteMutation.error?.message ?? null;

  const startEditing = useCallback(() => {
    setEditValue(category.name);
    setIsEditing(true);
  }, [category.name]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleRenameSubmit = useCallback(() => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === category.name) {
      setIsEditing(false);
      setEditValue(category.name);
      return;
    }
    renameMutation.mutate(trimmed);
  }, [editValue, category.name, renameMutation]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleRenameSubmit();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(category.name);
      inputRef.current?.blur();
    }
  };

  if (isEditing) {
    return (
      <li className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${colorToDotClass[category.color as CategoryColor]}`}
          />
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleKeyDown}
            disabled={renameMutation.isPending}
            className="flex-1 rounded-chip border border-border bg-bg px-2 py-1 font-body text-sm shadow-card outline-none"
          />
        </div>
        {renameError && (
          <InlineMessage variant="error" className="pl-5">
            {renameError}
          </InlineMessage>
        )}
      </li>
    );
  }

  return (
    <li className="group flex items-center gap-2">
      <Link
        href={`${baseHref}?category=${category.id}`}
        onDoubleClick={(e) => {
          e.preventDefault();
          startEditing();
        }}
        className={`flex flex-1 items-center gap-3 font-body text-sm transition-opacity hover:opacity-80 ${
          isSelected
            ? "font-semibold opacity-100 text-gray-900"
            : "text-gray-700 opacity-90"
        }`}
      >
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${colorToDotClass[category.color as CategoryColor]}`}
        />
        {category.name}
      </Link>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setDeleteOpen(true);
        }}
        className="opacity-0 group-hover:opacity-70 hover:opacity-100 p-1 rounded transition-opacity text-gray-500 hover:text-red-600"
        aria-label={`Delete ${category.name}`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) deleteMutation.reset();
        }}
      >
        <DialogPortal>
          <DialogBackdrop />
          <DialogPopup>
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-bg p-6 shadow-2xl pointer-events-auto">
              <p className="font-body text-gray-900 mb-4">
                Delete category &quot;{category.name}&quot;? Notes in this category will become uncategorized.
              </p>
              {deleteError && (
                <InlineMessage variant="error" className="mb-4">
                  {deleteError}
                </InlineMessage>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteOpen(false)}
                  className="rounded-chip border border-border px-4 py-2 font-body text-sm hover:bg-hover"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="rounded-chip border border-red-500 bg-red-500 px-4 py-2 font-body text-sm text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </DialogPopup>
        </DialogPortal>
      </Dialog>
    </li>
  );
}
