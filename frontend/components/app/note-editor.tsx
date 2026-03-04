"use client";

import {
  categoriesApi,
  colorToCardClass,
  notesApi,
  type CategoryColor,
  type Note,
} from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { InlineMessage } from "@/components/ui/inline-message";
import Link from "next/link";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectPositioner,
  SelectPopup,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const DEFAULT_CARD_CLASS = "bg-note-orange-card border-note-orange";

function formatDate(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    " at " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
}

type NoteEditorFormProps = {
  note: Note | null;
  noteId: string | null;
  categoryIdParam: string | null;
};

function NoteEditorForm({
  note,
  noteId,
  categoryIdParam,
}: NoteEditorFormProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(
    note?.category != null ? String(note.category) : (categoryIdParam ?? null)
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
  });

  useEffect(() => {
    if (savedAt === null) return;
    const t = setTimeout(() => setSavedAt(null), 2000);
    return () => clearTimeout(t);
  }, [savedAt]);

  const createMutation = useMutation({
    mutationFn: (data: {
      title: string;
      content: string;
      category: number | null;
      pinned: boolean;
    }) => notesApi.create(data),
    onMutate: () => setErrorMessage(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      router.push(
        categoryIdParam ? `/app?category=${categoryIdParam}` : "/app"
      );
    },
    onError: (e) => {
      setErrorMessage(e instanceof Error ? e.message : "Failed to create note");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      title: string;
      content: string;
      category: number | null;
      pinned: boolean;
    }) => notesApi.update(Number(noteId), data),
    onMutate: () => setErrorMessage(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note", noteId] });
      setSavedAt(Date.now());
      setErrorMessage(null);
    },
    onError: (e) => {
      setErrorMessage(e instanceof Error ? e.message : "Failed to save note");
    },
  });

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const payload = {
      title: title.trim(),
      content: content.trim(),
      category: categoryId && categoryId !== "none" ? Number(categoryId) : null,
      pinned: note?.pinned ?? false,
      draft: false,
    };
    if (noteId) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const resolvedColor =
    note?.category_color ??
    (categoryId
      ? categories.find((c) => String(c.id) === categoryId)?.color
      : null);
  const bgClass =
    resolvedColor && resolvedColor in colorToCardClass
      ? colorToCardClass[resolvedColor as CategoryColor]
      : DEFAULT_CARD_CLASS;

  const closeHref = categoryIdParam
    ? `/app?category=${categoryIdParam}`
    : "/app";

  return (
    <div
      className={`flex h-full w-full flex-col rounded-2xl transition-colors border-3 ${bgClass}`}
    >
      <div className="flex items-center justify-between p-6 pb-2">
        <Select
          value={categoryId ?? "none"}
          onValueChange={(val) => setCategoryId(val === "none" ? null : val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="No Category">
              {(val: string) => {
                if (val === "none") return "No Category";
                const cat = categories.find((c) => String(c.id) === val);
                return cat ? cat.name : "No Category";
              }}
            </SelectValue>
            <SelectIcon />
          </SelectTrigger>
          <SelectPortal>
            <SelectPositioner>
              <SelectPopup>
                <SelectItem value="none">
                  <SelectItemIndicator />
                  <SelectItemText>No Category</SelectItemText>
                </SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    <SelectItemIndicator />
                    <SelectItemText>{c.name}</SelectItemText>
                  </SelectItem>
                ))}
              </SelectPopup>
            </SelectPositioner>
          </SelectPortal>
        </Select>

        <Link href={closeHref} className="text-gray-500 hover:text-black">
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-12 pt-6 flex flex-col relative">
        <div className="flex justify-end mb-8">
          <span className="text-sm text-gray-600 font-body">
            {note?.updated_at
              ? `Last Edited: ${formatDate(note.updated_at)}`
              : "New Note"}
          </span>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setErrorMessage(null);
          }}
          placeholder="Note Title"
          className="w-full bg-transparent font-heading text-4xl font-bold text-black outline-none placeholder:text-gray-800/50"
        />

        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setErrorMessage(null);
          }}
          placeholder="Pour your heart out..."
          className="mt-8 w-full flex-1 resize-none bg-transparent font-body text-lg text-gray-900 outline-none placeholder:text-gray-800/50 leading-relaxed"
        />

        <div className="absolute bottom-8 right-8 flex flex-col items-end gap-1">
          {(errorMessage || savedAt) && (
            <InlineMessage
              variant={errorMessage ? "error" : "success"}
              className="animate-in fade-in duration-200"
            >
              {errorMessage ?? "Saved"}
            </InlineMessage>
          )}
          <Button
            variant="icon"
            type="button"
            onClick={() => handleSubmit()}
            disabled={isPending}
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function NoteEditor() {
  const searchParams = useSearchParams();
  const noteId = searchParams.get("note");
  const categoryIdParam = searchParams.get("category");

  const { data: note, isPending: noteLoading } = useQuery({
    queryKey: ["note", noteId],
    queryFn: () => notesApi.get(Number(noteId!)),
    enabled: !!noteId,
  });

  if (noteId && noteLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg text-gray-500">Loading note…</p>
      </div>
    );
  }

  return (
    <NoteEditorForm
      key={noteId ?? `cat-${categoryIdParam ?? "all"}`}
      note={note ?? null}
      noteId={noteId}
      categoryIdParam={categoryIdParam}
    />
  );
}
