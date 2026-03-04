"use client";

import { notesApi } from "@/lib/api-client";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { NotesSearch } from "./notes-search";
import { NoteRow } from "./note-row";

export function NotesList() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const categoryId = searchParams.get("category");
  const noteId = searchParams.get("note");

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const { data: notes = [], isPending } = useQuery({
    queryKey: ["notes", categoryId ?? "all", debouncedSearch],
    queryFn: () =>
      notesApi.list({
        categoryId: categoryId || undefined,
        q: debouncedSearch || undefined,
      }),
  });

  const pinMutation = useMutation({
    mutationFn: ({ id, pinned }: { id: number; pinned: boolean }) =>
      notesApi.update(id, { pinned }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const handlePinToggle = (note: { id: number; pinned: boolean }) => {
    pinMutation.mutate({ id: note.id, pinned: !note.pinned });
  };

  const pinnedNotes = notes.filter((n) => n.pinned);
  const otherNotes = notes.filter((n) => !n.pinned);

  if (isPending) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="mb-4">
          <NotesSearch value={searchInput} onChange={setSearchInput} />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">Loading notes…</p>
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="mb-4">
          <NotesSearch value={searchInput} onChange={setSearchInput} />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center pt-32">
          <Image
            src="/images/empty_state.png"
            alt="No notes yet"
            width={240}
            height={240}
            className="mb-8"
          />
          <p className="text-xl text-accent font-body">
            I&apos;m just here waiting for your charming notes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4">
        <NotesSearch value={searchInput} onChange={setSearchInput} />
      </div>

      <div className="flex flex-col gap-8">
        {pinnedNotes.length > 0 && (
          <section>
            <h2 className="mb-4 font-body text-sm font-bold text-gray-600">
              Pinned
            </h2>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
              {pinnedNotes.map((note) => (
                <div key={note.id} className="break-inside-avoid mb-6">
                  <NoteRow
                    note={note}
                    isSelected={noteId === String(note.id)}
                    categoryParam={categoryId}
                    onPinToggle={handlePinToggle}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-4 font-body text-sm font-bold text-gray-600">
            Notes
          </h2>
          {otherNotes.length > 0 ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
              {otherNotes.map((note) => (
                <div key={note.id} className="break-inside-avoid mb-6">
                  <NoteRow
                    note={note}
                    isSelected={noteId === String(note.id)}
                    categoryParam={categoryId}
                    onPinToggle={handlePinToggle}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-card border border-dashed border-border py-12 text-center font-body text-sm text-gray-500">
              No notes yet. Create one with the &quot;New Note&quot; button
              above.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
