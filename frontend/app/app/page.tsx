"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useCreateNote } from "@/lib/create-note-context";
import { useAppSearchParams } from "@/lib/use-app-search-params";
import { NotesList } from "@/components/app/notes-list";
import { NoteEditor } from "@/components/app/note-editor";
import {
  Dialog,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function AppContent() {
  const router = useRouter();
  const { noteId, closeHref } = useAppSearchParams();
  const { createNote, isPending } = useCreateNote();
  const isEditing = noteId !== null;

  return (
    <div className="relative flex h-full flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mb-4 flex items-center justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={() => createNote()}
          disabled={isPending}
          className="hidden rounded-full border-border px-6 py-2.5 font-body text-sm font-medium lg:flex"
          data-testid="new-note-btn"
        >
          + New Note
        </Button>
      </div>

      <div className="flex-1">
        <NotesList />
      </div>

      <Dialog
        open={isEditing}
        onOpenChange={(open) => {
          if (!open) {
            router.push(closeHref);
          }
        }}
      >
        <DialogPortal>
          <DialogBackdrop />
          <DialogPopup>
            <div className="relative flex h-full min-h-0 w-full flex-col self-stretch rounded-none bg-bg shadow-2xl pointer-events-auto lg:max-w-5xl lg:h-[85vh] lg:rounded-2xl">
              <NoteEditor />
            </div>
          </DialogPopup>
        </DialogPortal>
      </Dialog>
    </div>
  );
}

export default function AppPage() {
  return (
    <Suspense
      fallback={<div className="p-8 font-body text-gray-500">Loading…</div>}
    >
      <AppContent />
    </Suspense>
  );
}
