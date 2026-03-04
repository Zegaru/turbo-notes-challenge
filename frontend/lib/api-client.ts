import { api } from "./api";

export type CategoryColor = "orange" | "yellow" | "sage" | "teal";

export const CATEGORY_COLORS: CategoryColor[] = [
  "orange",
  "yellow",
  "sage",
  "teal",
];

export const colorToDotClass: Record<CategoryColor, string> = {
  orange: "bg-note-orange",
  yellow: "bg-note-yellow",
  sage: "bg-note-sage",
  teal: "bg-note-teal",
};

export const colorToCardClass: Record<CategoryColor, string> = {
  orange: "bg-note-orange-card border-note-orange",
  yellow: "bg-note-yellow-card border-note-yellow",
  sage: "bg-note-sage-card border-note-sage",
  teal: "bg-note-teal-card border-note-teal",
};

export type Category = {
  id: number;
  name: string;
  color: CategoryColor;
  created_at: string;
};

export type NoteImage = {
  id: number;
  url: string;
  created_at: string;
};

export type Note = {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  draft: boolean;
  category: number | null;
  category_name: string | null;
  category_color: CategoryColor | null;
  images: NoteImage[];
  created_at: string;
  updated_at: string;
};

export type NoteListParams = {
  categoryId?: string | null;
  pinned?: boolean;
  q?: string;
};

export type SuggestCategoryResponse = {
  suggested_category_id: number | null;
  suggested_category_name: string | null;
  reason: string;
};

function buildQueryString(
  params: Record<string, string | boolean | undefined | null>
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const categoriesApi = {
  list: () => api.get<Category[]>("/api/categories/"),
  create: (data: { name: string; color?: CategoryColor }) =>
    api.post<Category>("/api/categories/", data),
  get: (id: number) => api.get<Category>(`/api/categories/${id}/`),
  update: (id: number, data: Partial<{ name: string; color: CategoryColor }>) =>
    api.patch<Category>(`/api/categories/${id}/`, data),
  delete: (id: number) => api.delete(`/api/categories/${id}/`),
};

export const notesApi = {
  list: (params?: NoteListParams) => {
    const qs: Record<string, string | boolean | undefined | null> = {};
    if (params?.categoryId != null) qs.category_id = params.categoryId;
    if (params?.pinned != null) qs.pinned = params.pinned;
    if (params?.q != null) qs.q = params.q;
    const query = buildQueryString(qs);
    return api.get<Note[]>(`/api/notes/${query}`);
  },
  create: (
    data: Partial<{
      title: string;
      content: string;
      category: number | null;
      pinned: boolean;
      draft: boolean;
    }>
  ) => api.post<Note>("/api/notes/", data),
  get: (id: number) => api.get<Note>(`/api/notes/${id}/`),
  update: (
    id: number,
    data: Partial<{
      title: string;
      content: string;
      category: number | null;
      pinned: boolean;
      draft: boolean;
    }>,
    options?: { signal?: AbortSignal }
  ) => api.patch<Note>(`/api/notes/${id}/`, data, options),
  delete: (id: number) => api.delete(`/api/notes/${id}/`),
  suggestCategory: (data: { title?: string; content?: string }) =>
    api.post<SuggestCategoryResponse>("/api/notes/suggest_category/", data),
};
