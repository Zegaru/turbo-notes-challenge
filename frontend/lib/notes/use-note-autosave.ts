"use client";

import { notesApi, type Note } from "@/lib/api/api-client";
import { noteKeys, notesKeys } from "@/lib/api/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SaveStatusState } from "@/components/app/save-status";

const AUTOSAVE_DEBOUNCE_MS = 600;

type SavedPayload = {
  title: string;
  content: string;
  categoryId: string | null;
};

function payloadEqual(a: SavedPayload, b: SavedPayload): boolean {
  return (
    a.title === b.title &&
    a.content === b.content &&
    (a.categoryId ?? "none") === (b.categoryId ?? "none")
  );
}

type UseNoteAutosaveParams = {
  noteId: string | null;
  title: string;
  content: string;
  categoryId: string | null;
  pinned: boolean;
  note: Note | null;
  categoryIdParam: string | null;
  isEditing: boolean;
};

export function useNoteAutosave({
  noteId,
  title,
  content,
  categoryId,
  pinned,
  note,
  categoryIdParam,
  isEditing,
}: UseNoteAutosaveParams) {
  const queryClient = useQueryClient();
  const [saveStatus, setSaveStatus] = useState<SaveStatusState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSavedRef = useRef<SavedPayload>({
    title: note?.title ?? "",
    content: note?.content ?? "",
    categoryId:
      note?.category != null ? String(note.category) : (categoryIdParam ?? null),
  });

  const scheduleAutosave = useCallback(() => {
    if (!noteId) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;

      const payload: SavedPayload = {
        title: title.trim(),
        content: content.trim(),
        categoryId: categoryId && categoryId !== "none" ? categoryId : null,
      };

      if (payloadEqual(payload, lastSavedRef.current)) return;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setSaveStatus("saving");
      setErrorMessage(null);

      notesApi
        .update(
          Number(noteId),
          {
            title: payload.title,
            content: payload.content,
            category: payload.categoryId ? Number(payload.categoryId) : null,
            pinned,
            draft: false,
          },
          { signal: controller.signal }
        )
        .then((updatedNote) => {
          lastSavedRef.current = payload;
          setSaveStatus("saved");
          setErrorMessage(null);
          queryClient.setQueryData(noteKeys.detail(noteId), updatedNote);
          queryClient.setQueriesData(
            { queryKey: notesKeys.all },
            (oldData: Note[] | undefined, query?: { queryKey: unknown[] }) => {
              if (!oldData) return oldData;
              const categoryFilter = query?.queryKey?.[1] as string | undefined;
              const noteMatchesFilter =
                !categoryFilter ||
                categoryFilter === "all" ||
                String(updatedNote.category) === categoryFilter;
              const idx = oldData.findIndex((n) => n.id === updatedNote.id);
              if (idx >= 0) {
                if (noteMatchesFilter) {
                  const next = [...oldData];
                  next[idx] = updatedNote;
                  return next;
                }
                return oldData.filter((n) => n.id !== updatedNote.id);
              }
              if (noteMatchesFilter) return [...oldData, updatedNote];
              return oldData;
            }
          );
          setTimeout(() => setSaveStatus("idle"), 2000);
        })
        .catch((e) => {
          if (e?.name === "AbortError") return;
          setSaveStatus("error");
          setErrorMessage(
            e instanceof Error ? e.message : "Failed to save note"
          );
        })
        .finally(() => {
          if (abortControllerRef.current === controller) {
            abortControllerRef.current = null;
          }
        });
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [noteId, title, content, categoryId, pinned, queryClient]);

  useEffect(() => {
    if (noteId && isEditing) {
      scheduleAutosave();
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [noteId, isEditing, scheduleAutosave]);

  useEffect(() => {
    lastSavedRef.current = {
      title: note?.title ?? "",
      content: note?.content ?? "",
      categoryId:
        note?.category != null
          ? String(note.category)
          : (categoryIdParam ?? null),
    };
  }, [note?.title, note?.content, note?.category, categoryIdParam]);

  const clearError = useCallback(() => setErrorMessage(null), []);

  return { saveStatus, errorMessage, scheduleAutosave, clearError };
}
