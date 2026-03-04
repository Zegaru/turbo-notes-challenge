import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useCreateNoteMutation,
  useDeleteNoteMutation,
  useNotesQuery,
  useNoteQuery,
  usePinMutation,
} from "./notes-queries";
import * as apiClient from "@/lib/api/api-client";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/lib/api/api-client", () => ({
  notesApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("notes-queries", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    } as ReturnType<typeof useRouter>);
    vi.mocked(apiClient.notesApi.list).mockResolvedValue([]);
    vi.mocked(apiClient.notesApi.get).mockResolvedValue({
      id: 1,
      title: "Test",
      content: "",
      pinned: false,
      draft: false,
      category: null,
      category_name: null,
      category_color: null,
      images: [],
      created_at: "",
      updated_at: "",
    });
    mockPush.mockClear();
  });

  describe("useNotesQuery", () => {
    it("calls notesApi.list with filters", async () => {
      const { result } = renderHook(
        () => useNotesQuery("1", true, "search"),
        { wrapper: createWrapper() }
      );
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.notesApi.list).toHaveBeenCalledWith({
        categoryId: "1",
        pinned: true,
        q: "search",
      });
    });

    it("passes undefined for empty filters", async () => {
      const { result } = renderHook(
        () => useNotesQuery(null, false, ""),
        { wrapper: createWrapper() }
      );
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.notesApi.list).toHaveBeenCalledWith({
        categoryId: undefined,
        pinned: undefined,
        q: undefined,
      });
    });
  });

  describe("useNoteQuery", () => {
    it("fetches note when noteId is provided", async () => {
      const { result } = renderHook(
        () => useNoteQuery("1"),
        { wrapper: createWrapper() }
      );
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.notesApi.get).toHaveBeenCalledWith(1);
    });

    it("does not fetch when noteId is null", () => {
      renderHook(() => useNoteQuery(null), { wrapper: createWrapper() });
      expect(apiClient.notesApi.get).not.toHaveBeenCalled();
    });
  });

  describe("usePinMutation", () => {
    it("calls notesApi.update and invalidates queries", async () => {
      vi.mocked(apiClient.notesApi.update).mockResolvedValue({} as never);
      const { result } = renderHook(() => usePinMutation(), {
        wrapper: createWrapper(),
      });
      result.current.mutate({ id: 1, pinned: true });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.notesApi.update).toHaveBeenCalledWith(1, { pinned: true });
    });
  });

  describe("useDeleteNoteMutation", () => {
    it("calls notesApi.delete and redirects when redirectOnSuccess provided", async () => {
      vi.mocked(apiClient.notesApi.delete).mockResolvedValue(undefined as never);
      const { result } = renderHook(
        () => useDeleteNoteMutation({ redirectOnSuccess: "/app" }),
        { wrapper: createWrapper() }
      );
      result.current.mutate(1);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.notesApi.delete).toHaveBeenCalledWith(1);
      expect(mockPush).toHaveBeenCalledWith("/app");
    });

    it("calls onSuccess callback when provided", async () => {
      vi.mocked(apiClient.notesApi.delete).mockResolvedValue(undefined as never);
      const onSuccess = vi.fn();
      const { result } = renderHook(
        () => useDeleteNoteMutation({ onSuccess }),
        { wrapper: createWrapper() }
      );
      result.current.mutate(1);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe("useCreateNoteMutation", () => {
    it("creates note with payload and redirects to /app", async () => {
      const created = {
        id: 2,
        title: "New",
        content: "Body",
        pinned: false,
        draft: false,
        category: 1,
        category_name: "Work",
        category_color: "orange" as const,
        images: [],
        created_at: "",
        updated_at: "",
      };
      vi.mocked(apiClient.notesApi.create).mockResolvedValue(created);
      const { result } = renderHook(() => useCreateNoteMutation(), {
        wrapper: createWrapper(),
      });
      result.current.mutate({
        title: "New",
        content: "Body",
        category: 1,
        pinned: false,
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.notesApi.create).toHaveBeenCalledWith({
        title: "New",
        content: "Body",
        category: 1,
        pinned: false,
        draft: false,
      });
      expect(mockPush).toHaveBeenCalledWith("/app");
    });

    it("creates draft and redirects to note when draft option set", async () => {
      const created = {
        id: 3,
        title: "",
        content: "",
        pinned: false,
        draft: true,
        category: 1,
        category_name: null,
        category_color: null,
        images: [],
        created_at: "",
        updated_at: "",
      };
      vi.mocked(apiClient.notesApi.create).mockResolvedValue(created);
      const { result } = renderHook(
        () => useCreateNoteMutation({ draft: true, categoryId: "1" }),
        { wrapper: createWrapper() }
      );
      result.current.mutate();
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.notesApi.create).toHaveBeenCalledWith({
        title: "",
        content: "",
        pinned: false,
        draft: true,
        category: 1,
      });
      expect(mockPush).toHaveBeenCalledWith("/app?category=1&note=3");
    });
  });
});
