"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useCreateNoteMutation } from "@/lib/notes-queries";
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
  const { categoryIdParam, noteId, closeHref } = useAppSearchParams();
  const isEditing = noteId !== null;

  const createMutation = useCreateNoteMutation({
    draft: true,
    categoryId: categoryIdParam,
  });

  return (
    <div className="relative flex h-full flex-col px-8 py-10">
      <div className="mb-8 flex items-center justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="rounded-full border-border px-6 py-2.5 font-body text-sm font-medium"
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
            <div className="relative w-full max-w-5xl h-[85vh] min-h-0 rounded-2xl shadow-2xl flex flex-col bg-bg pointer-events-auto">
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
