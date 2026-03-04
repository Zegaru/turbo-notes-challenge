"use client";

import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useNotesQuery, usePinMutation } from "@/lib/notes-queries";
import { useAppSearchParams } from "@/lib/use-app-search-params";
import { useCategoriesQuery } from "@/lib/categories-queries";
import { parseSearchQuery } from "@/lib/parse-search-query";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { NotesSearch } from "./notes-search";
import { NoteRow } from "./note-row";

export function NotesList() {
  const { noteId, categoryIdParam, searchParam, setSearchInUrl } =
    useAppSearchParams();
  const [searchInput, setSearchInput] = useState(searchParam ?? "");
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const lastWrittenSearchRef = useRef<string>("");

  const { data: categories = [] } = useCategoriesQuery();
  const parsed = parseSearchQuery(debouncedSearch, categories);
  const effectiveCategoryId = parsed.categoryId ?? categoryIdParam;

  useEffect(() => {
    setSearchInUrl(debouncedSearch);
    lastWrittenSearchRef.current = debouncedSearch;
  }, [debouncedSearch, setSearchInUrl]);

  useEffect(() => {
    if (searchParam !== lastWrittenSearchRef.current) {
      lastWrittenSearchRef.current = searchParam ?? "";
      const value = searchParam ?? "";
      queueMicrotask(() => setSearchInput(value));
    }
  }, [searchParam]);

  const {
    data: notes = [],
    isPending,
    isError,
    refetch,
    error,
  } = useNotesQuery(effectiveCategoryId, parsed.pinned, parsed.q);
  const pinMutation = usePinMutation();

  const handlePinToggle = (note: { id: number; pinned: boolean }) => {
    pinMutation.mutate({ id: note.id, pinned: !note.pinned });
  };

  const sortedNotes = [...notes].sort((a, b) =>
    a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1
  );

  const hasFilter = !!parsed.q || !!effectiveCategoryId;

  if (isError) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="mb-4">
          <NotesSearch value={searchInput} onChange={setSearchInput} />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 pt-16">
          <p className="font-body text-sm text-red-600">
            {error instanceof Error ? error.message : "Failed to load notes"}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-chip border border-border bg-bg px-3 py-1.5 font-body text-sm text-gray-700 hover:bg-gray-100"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
          {hasFilter ? (
            <>
              <p className="text-lg font-body text-gray-600">
                No notes match your search
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Try a different query or category
              </p>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4">
        <NotesSearch value={searchInput} onChange={setSearchInput} />
      </div>

      {pinMutation.isError && (
        <div className="mb-4 flex items-center gap-2">
          <p className="font-body text-sm text-red-600">
            {pinMutation.error instanceof Error
              ? pinMutation.error.message
              : "Failed to update pin"}
          </p>
          <button
            type="button"
            onClick={() =>
              pinMutation.variables &&
              pinMutation.mutate(pinMutation.variables)
            }
            className="text-sm text-accent hover:underline"
          >
            Retry
          </button>
        </div>
      )}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
        {sortedNotes.map((note) => (
          <div key={note.id} className="break-inside-avoid mb-6">
            <NoteRow
              note={note}
              isSelected={noteId === String(note.id)}
              categoryParam={categoryIdParam}
              onPinToggle={handlePinToggle}
              isPinning={
                pinMutation.isPending &&
                pinMutation.variables?.id === note.id
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
