"use client";

import {
  colorToCardClass,
  type CategoryColor,
  type Note,
} from "@/lib/api-client";
import { useCategoriesQuery } from "@/lib/categories-queries";
import { formatDate } from "@/lib/format-date";
import { useCreateNoteMutation, useNoteQuery } from "@/lib/notes-queries";
import { noteKeys, notesKeys } from "@/lib/query-keys";
import { useAppSearchParams } from "@/lib/use-app-search-params";
import { useNoteAutosave } from "@/lib/use-note-autosave";
import { useSuggestCategory } from "@/lib/use-suggest-category";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CategorySelect } from "@/components/app/category-select";
import { ImageModal } from "@/components/app/image-modal";
import { ImageUploader } from "@/components/app/image-uploader";
import { ImagesPanel } from "@/components/app/images-panel";
import { MarkdownPreview } from "@/components/app/markdown-preview";
import { SaveStatus } from "@/components/app/save-status";

const DEFAULT_CARD_CLASS = "bg-note-orange-card border-note-orange";

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
  const { setEditInUrl, closeHref } = useAppSearchParams();

  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(
    note?.category != null ? String(note.category) : (categoryIdParam ?? null)
  );
  const [contentMode, setContentMode] = useState<"edit" | "preview" | "split">(
    "split"
  );
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingFocusRef = useRef<"title" | "content" | null>(null);

  const { data: categories = [] } = useCategoriesQuery();
  const { suggestion, suggestMutation, applySuggestion } = useSuggestCategory();

  const {
    saveStatus,
    errorMessage: autosaveErrorMessage,
    clearError: clearAutosaveError,
  } = useNoteAutosave({
    noteId,
    title,
    content,
    categoryId,
    pinned: note?.pinned ?? false,
    note,
    categoryIdParam,
    isEditing,
  });

  const createMutation = useCreateNoteMutation({
    redirectToCategory: categoryIdParam,
  });

  const createErrorMessage = createMutation.error?.message ?? null;
  const errorMessage = autosaveErrorMessage ?? createErrorMessage;

  const handleApplySuggestion = useCallback(() => {
    const id = applySuggestion();
    if (id != null) setCategoryId(String(id));
  }, [applySuggestion]);

  const handleFieldChange = useCallback(() => {
    clearAutosaveError();
    createMutation.reset();
  }, [clearAutosaveError, createMutation]);

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
      setEditInUrl(edit, focusField);
    },
    [setEditInUrl]
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

  const handleCreateSubmit = () => {
    createMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      category: categoryId && categoryId !== "none" ? Number(categoryId) : null,
      pinned: note?.pinned ?? false,
    });
  };

  const showViewMode = noteId && !isEditing;

  return (
    <div
      data-testid="note-editor"
      className={`relative flex h-full min-h-0 w-full flex-col rounded-2xl border-2 transition-shadow duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.04),0_1px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] ${bgClass}`}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-linear-to-br from-white/50 via-transparent to-black/5"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 p-6 pb-2! sm:p-8 lg:p-12">
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
                disabled={saveStatus === "saving"}
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
                className="rounded-chip px-2 py-1 text-xs inline-flex items-center gap-1.5"
              >
                {suggestMutation.isPending ? (
                  <>
                    <Spinner size="sm" />
                    <span>Thinking</span>
                  </>
                ) : (
                  "Suggest category"
                )}
              </Button>
              {suggestion && (
                <span className="inline-flex items-center gap-1.5 rounded-chip border border-border bg-bg px-2 py-1 font-body text-xs">
                  {suggestion.name}
                  <button
                    type="button"
                    onClick={handleApplySuggestion}
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
                disabled={saveStatus === "saving"}
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
                aria-label={isCreatePending ? "Creating…" : "Save note"}
              >
                {isCreatePending ? (
                  <Spinner size="lg" />
                ) : (
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
                )}
              </Button>
            </>
          )}
          <Link href={closeHref} className="text-gray-500 hover:text-black p-1" data-testid="note-editor-close">
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

      <div className="scrollbar relative z-10 flex-1 min-h-0 overflow-y-auto p-6 pt-2! h-full sm:p-8 lg:p-12">
        <div className="flex min-h-min flex-col h-full">
          <div className="flex justify-end ">
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
                        queryKey: noteKeys.detail(noteId),
                      });
                      queryClient.invalidateQueries({
                        queryKey: notesKeys.all,
                      });
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
                className="font-heading text-3xl font-bold text-black cursor-text rounded px-1 -mx-1 hover:bg-black/5 transition-colors sm:text-4xl"
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
                className="w-full bg-transparent font-heading text-3xl font-bold text-black outline-none placeholder:text-gray-800/50 sm:text-4xl"
                data-testid="note-title"
              />

              <div className="mt-6 flex flex-wrap gap-2">
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
                <div className="mt-4 flex-1 min-h-[200px] flex flex-col gap-4 overflow-hidden lg:flex-row">
                  <textarea
                    ref={contentTextareaRef}
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      handleFieldChange();
                    }}
                    placeholder="Pour your heart out..."
                    className="scrollbar flex-1 min-w-0 resize-none bg-transparent font-body text-lg text-gray-900 outline-none placeholder:text-gray-800/50 leading-relaxed"
                    data-testid="note-content"
                  />
                  <div
                    className="h-px w-full shrink-0 bg-gray-300/60 lg:h-auto lg:w-px"
                    aria-hidden
                  />
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
                  data-testid="note-content"
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
  const { noteId, categoryIdParam, editParam } = useAppSearchParams();
  const { data: note, isPending: noteLoading } = useNoteQuery(noteId);

  const initialEditMode =
    (note?.content?.trim()?.length ?? 0) === 0 || editParam === "1";

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
