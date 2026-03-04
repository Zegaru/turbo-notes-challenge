"use client";

import { createContext, useCallback, useContext } from "react";
import { useSearchParams } from "next/navigation";
import { useCreateNoteMutation } from "./notes-queries";

type CreateNoteContextValue = {
  createNote: () => void;
  isPending: boolean;
};

const CreateNoteContext = createContext<CreateNoteContextValue | null>(null);

export function CreateNoteProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get("category");

  const createMutation = useCreateNoteMutation({
    draft: true,
    categoryId: categoryIdParam,
  });

  const createNote = useCallback(() => {
    createMutation.mutate();
  }, [createMutation]);

  return (
    <CreateNoteContext.Provider
      value={{ createNote, isPending: createMutation.isPending }}
    >
      {children}
    </CreateNoteContext.Provider>
  );
}

export function useCreateNote() {
  const ctx = useContext(CreateNoteContext);
  if (!ctx) {
    throw new Error("useCreateNote must be used within CreateNoteProvider");
  }
  return ctx;
}
