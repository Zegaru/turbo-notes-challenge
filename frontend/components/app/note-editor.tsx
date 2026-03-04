"use client";

import {
  categoriesApi,
  colorToCardClass,
  notesApi,
  type CategoryColor,
  type Note,
} from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CategorySelect } from "@/components/app/category-select";
import { ImageModal } from "@/components/app/image-modal";
import { ImageUploader } from "@/components/app/image-uploader";
import { ImagesPanel } from "@/components/app/images-panel";
import { MarkdownPreview } from "@/components/app/markdown-preview";
import { SaveStatus, type SaveStatusState } from "@/components/app/save-status";

const DEFAULT_CARD_CLASS = "bg-note-orange-card border-note-orange";
const AUTOSAVE_DEBOUNCE_MS = 600;

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

type NoteEditorFormProps = {
  note: Note | null;
  noteId: string | null;
  categoryIdParam: string | null;
  initialEditMode: boolean;
};

function NoteEditorForm({
  note,
  noteId,
  categoryIdParam,
  initialEditMode,
}: NoteEditorFormProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(
    note?.category != null ? String(note.category) : (categoryIdParam ?? null)
  );
  const [contentMode, setContentMode] = useState<"edit" | "preview" | "split">(
    "split"
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatusState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingFocusRef = useRef<"title" | "content" | null>(null);
  const lastSavedRef = useRef<SavedPayload>({
    title: note?.title ?? "",
    content: note?.content ?? "",
    categoryId:
      note?.category != null
        ? String(note.category)
        : (categoryIdParam ?? null),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
  });

  const suggestMutation = useMutation({
    mutationFn: (data: { title?: string; content?: string }) =>
      notesApi.suggestCategory(data),
    onSuccess: (data) => {
      if (data.suggested_category_id != null && data.suggested_category_name) {
        setSuggestion({
          id: data.suggested_category_id,
          name: data.suggested_category_name,
        });
      } else {
        setSuggestion(null);
      }
    },
    onError: () => setSuggestion(null),
  });

  const applySuggestion = useCallback(() => {
    if (suggestion) {
      setCategoryId(String(suggestion.id));
      setSuggestion(null);
    }
  }, [suggestion]);

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
            pinned: note?.pinned ?? false,
            draft: false,
          },
          { signal: controller.signal }
        )
        .then((updatedNote) => {
          lastSavedRef.current = payload;
          setSaveStatus("saved");
          setErrorMessage(null);
          queryClient.setQueryData(["note", noteId], updatedNote);
          queryClient.setQueriesData(
            { queryKey: ["notes"] },
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
          const t = setTimeout(() => setSaveStatus("idle"), 2000);
          return () => clearTimeout(t);
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
  }, [noteId, title, content, categoryId, note?.pinned, queryClient]);

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

  const handleCreateSubmit = () => {
    const payload = {
      title: title.trim(),
      content: content.trim(),
      category: categoryId && categoryId !== "none" ? Number(categoryId) : null,
      pinned: note?.pinned ?? false,
      draft: false,
    };
    createMutation.mutate(payload);
  };

  const handleFieldChange = useCallback((clearError = true) => {
    if (clearError) setErrorMessage(null);
  }, []);

  const isCreatePending = createMutation.isPending;
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

  const hasTitleOrContent =
    (title?.trim()?.length ?? 0) > 0 || (content?.trim()?.length ?? 0) > 0;

  const categoryName =
    note?.category_name ??
    (categoryId
      ? categories.find((c) => String(c.id) === categoryId)?.name
      : null);

  const setEditMode = useCallback(
    (edit: boolean, focusField?: "title" | "content") => {
      if (edit && focusField) {
        pendingFocusRef.current = focusField;
      }
      setIsEditing(edit);
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

  useEffect(() => {
    if (!isEditing || !pendingFocusRef.current) return;
    const field = pendingFocusRef.current;
    pendingFocusRef.current = null;
    requestAnimationFrame(() => {
      if (field === "title") {
        titleInputRef.current?.focus();
      } else {
        contentTextareaRef.current?.focus();
      }
    });
  }, [isEditing]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "e" || e.key === "E") {
        if (!isEditing && noteId) {
          e.preventDefault();
          setEditMode(true);
        }
      } else if (e.key === "Escape") {
        if (isEditing && noteId) {
          e.preventDefault();
          setEditMode(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, noteId, setEditMode]);

  const showViewMode = noteId && !isEditing;

  return (
    <div
      className={`relative flex h-full min-h-0 w-full flex-col rounded-2xl border-2 transition-shadow duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.04),0_1px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] ${bgClass}`}
    >
      {/* Subtle overlay to simulate paper surface/lighting */}
      <div
        className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-linear-to-br from-white/50 via-transparent to-black/5"
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-center justify-between p-6 pb-2">
        <div className="flex items-center gap-2">
          {showViewMode ? (
            <span className="inline-flex items-center gap-1.5 rounded-chip border border-border bg-bg/50 px-3 py-1 font-body text-sm text-gray-800">
              {categoryName ?? "No Category"}
            </span>
          ) : (
            <>
              <CategorySelect
                value={categoryId}
                onChange={setCategoryId}
                categories={categories}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  suggestMutation.mutate({
                    title: title.trim(),
                    content: content.trim(),
                  })
                }
                disabled={suggestMutation.isPending || !hasTitleOrContent}
                className="rounded-chip px-2 py-1 text-xs"
              >
                {suggestMutation.isPending ? "…" : "Suggest category"}
              </Button>
              {suggestion && (
                <span className="inline-flex items-center gap-1.5 rounded-chip border border-border bg-bg px-2 py-1 font-body text-xs">
                  {suggestion.name}
                  <button
                    type="button"
                    onClick={applySuggestion}
                    className="text-accent hover:underline"
                  >
                    Apply
                  </button>
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showViewMode ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setEditMode(true)}
              className="rounded-chip px-3 py-1.5"
            >
              Edit
            </Button>
          ) : noteId ? (
            <>
              <SaveStatus
                status={saveStatus}
                errorMessage={errorMessage ?? undefined}
                className="animate-in fade-in duration-200"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditMode(false)}
                className="rounded-chip px-3 py-1.5"
              >
                Done
              </Button>
            </>
          ) : (
            <>
              {errorMessage && (
                <SaveStatus
                  status="error"
                  errorMessage={errorMessage}
                  className="animate-in fade-in duration-200"
                />
              )}
              <Button
                variant="icon"
                type="button"
                onClick={handleCreateSubmit}
                disabled={isCreatePending}
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
            </>
          )}
          <Link href={closeHref} className="text-gray-500 hover:text-black p-1">
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
      </div>

      <div className="scrollbar relative z-10 flex-1 min-h-0 overflow-y-auto p-12 pt-6">
        <div className="flex min-h-min flex-col">
          <div className="flex justify-end mb-2">
            <span className="text-sm text-gray-600 font-body">
              {note?.updated_at
                ? `Last Edited: ${formatDate(note.updated_at)}`
                : "New Note"}
            </span>
          </div>

          {noteId && (
            <ImagesPanel
              images={note?.images ?? []}
              onImageClick={(img) => setPreviewImageUrl(img.url)}
              onInsertIntoNote={(url) =>
                setContent((prev) => prev + `\n![image](${url})\n`)
              }
              uploadSlot={
                isEditing ? (
                  <ImageUploader
                    noteId={Number(noteId)}
                    currentCount={note?.images?.length ?? 0}
                    onUploadSuccess={() => {
                      queryClient.invalidateQueries({
                        queryKey: ["note", noteId],
                      });
                      queryClient.invalidateQueries({ queryKey: ["notes"] });
                    }}
                  />
                ) : null
              }
              canInsert={isEditing}
            />
          )}

          {showViewMode ? (
            <>
              <h1
                onClick={() => setEditMode(true, "title")}
                className="font-heading text-4xl font-bold text-black cursor-text rounded px-1 -mx-1 hover:bg-black/5 transition-colors"
              >
                {title || "Untitled"}
              </h1>
              <div
                onClick={() => setEditMode(true, "content")}
                className="mt-8 min-h-[200px] shrink-0 cursor-text rounded px-1 -mx-1 hover:bg-black/5 transition-colors"
              >
                <MarkdownPreview content={content} />
              </div>
            </>
          ) : (
            <>
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  handleFieldChange();
                }}
                placeholder="Note Title"
                className="w-full bg-transparent font-heading text-4xl font-bold text-black outline-none placeholder:text-gray-800/50"
              />

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => setContentMode("edit")}
                  className={`rounded-chip border px-2 py-1 font-body text-sm ${
                    contentMode === "edit"
                      ? "border-border bg-bg shadow-card"
                      : "border-transparent text-gray-600 hover:text-black"
                  }`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setContentMode("preview")}
                  className={`rounded-chip border px-2 py-1 font-body text-sm ${
                    contentMode === "preview"
                      ? "border-border bg-bg shadow-card"
                      : "border-transparent text-gray-600 hover:text-black"
                  }`}
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => setContentMode("split")}
                  className={`rounded-chip border px-2 py-1 font-body text-sm ${
                    contentMode === "split"
                      ? "border-border bg-bg shadow-card"
                      : "border-transparent text-gray-600 hover:text-black"
                  }`}
                >
                  Split
                </button>
              </div>

              {contentMode === "split" ? (
                <div className="mt-4 flex-1 min-h-[200px] flex gap-4 overflow-hidden">
                  <textarea
                    ref={contentTextareaRef}
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      handleFieldChange();
                    }}
                    placeholder="Pour your heart out..."
                    className="scrollbar flex-1 min-w-0 resize-none bg-transparent font-body text-lg text-gray-900 outline-none placeholder:text-gray-800/50 leading-relaxed"
                  />
                  <div className="w-px shrink-0 bg-gray-300/60" aria-hidden />
                  <div className="scrollbar flex-1 min-w-0 overflow-y-auto">
                    <MarkdownPreview content={content} />
                  </div>
                </div>
              ) : contentMode === "edit" ? (
                <textarea
                  ref={contentTextareaRef}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    handleFieldChange();
                  }}
                  placeholder="Pour your heart out..."
                  className="scrollbar mt-4 w-full flex-1 min-h-[200px] resize-none bg-transparent font-body text-lg text-gray-900 outline-none placeholder:text-gray-800/50 leading-relaxed"
                />
              ) : (
                <div className="mt-4 flex-1 min-h-[200px]">
                  <MarkdownPreview content={content} />
                </div>
              )}
            </>
          )}
        </div>

        <ImageModal
          open={!!previewImageUrl}
          onOpenChange={(open) => !open && setPreviewImageUrl(null)}
          imageUrl={previewImageUrl}
        />
      </div>
    </div>
  );
}

export function NoteEditor() {
  const searchParams = useSearchParams();
  const noteId = searchParams.get("note");
  const categoryIdParam = searchParams.get("category");
  const editParam = searchParams.get("edit");

  const initialEditMode = !noteId || editParam === "1";

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

  if (!noteId) {
    return null;
  }

  return (
    <NoteEditorForm
      key={noteId ?? `cat-${categoryIdParam ?? "all"}`}
      note={note ?? null}
      noteId={noteId}
      categoryIdParam={categoryIdParam}
      initialEditMode={initialEditMode}
    />
  );
}
