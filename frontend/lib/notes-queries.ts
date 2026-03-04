"use client";

import { notesApi, type Note } from "@/lib/api-client";
import { notesKeys, noteKeys } from "@/lib/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useNotesQuery(categoryId: string | null, search: string) {
  return useQuery({
    queryKey: notesKeys.list(categoryId, search),
    queryFn: () =>
      notesApi.list({
        categoryId: categoryId || undefined,
        q: search || undefined,
      }),
  });
}

export function useNoteQuery(noteId: string | null) {
  return useQuery({
    queryKey: noteKeys.detail(noteId ?? ""),
    queryFn: () => notesApi.get(Number(noteId!)),
    enabled: !!noteId,
  });
}

export function usePinMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, pinned }: { id: number; pinned: boolean }) =>
      notesApi.update(id, { pinned }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.all });
    },
  });
}

type CreateNotePayload = {
  title: string;
  content: string;
  category: number | null;
  pinned: boolean;
  draft?: boolean;
};

type CreateNoteOptions = {
  draft?: boolean;
  categoryId?: string | null;
  redirectToCategory?: string | null;
  onError?: (error: Error) => void;
};

export function useCreateNoteMutation(options?: CreateNoteOptions) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { onError } = options ?? {};

  return useMutation<Note, Error, CreateNotePayload | void>({
    mutationFn: (data) => {
      if (options?.draft) {
        return notesApi.create({
          title: "",
          content: "",
          pinned: false,
          draft: true,
          category: options.categoryId ? Number(options.categoryId) : null,
        });
      }
      return notesApi.create({
        ...(data as CreateNotePayload),
        draft: false,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notesKeys.all });
      if (options?.draft) {
        const href = options.categoryId
          ? `/app?category=${options.categoryId}&note=${data.id}`
          : `/app?note=${data.id}`;
        router.push(href);
      } else {
        const redirect = options?.redirectToCategory;
        router.push(redirect ? `/app?category=${redirect}` : "/app");
      }
    },
    onError: (e) => {
      onError?.(e instanceof Error ? e : new Error(String(e)));
    },
  });
}
