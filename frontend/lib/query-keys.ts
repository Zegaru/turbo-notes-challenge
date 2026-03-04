export const notesKeys = {
  all: ["notes"] as const,
  list: (categoryId: string | null, search?: string) =>
    ["notes", categoryId ?? "all", search ?? ""] as const,
};

export const noteKeys = {
  all: ["note"] as const,
  detail: (id: string | number) => ["note", String(id)] as const,
};

export const categoriesKeys = {
  all: ["categories"] as const,
};
