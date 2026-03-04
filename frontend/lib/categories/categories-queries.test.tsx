import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useRenameCategoryMutation,
} from "./categories-queries";
import * as apiClient from "@/lib/api/api-client";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/lib/api/api-client", () => ({
  categoriesApi: {
    list: vi.fn(),
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

describe("categories-queries", () => {
  const mockPush = vi.fn();
  const mockCategory = {
    id: 1,
    name: "Work",
    color: "orange" as const,
    created_at: "2024-01-01",
  };

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    } as ReturnType<typeof useRouter>);
    vi.mocked(apiClient.categoriesApi.list).mockResolvedValue([]);
    mockPush.mockClear();
  });

  describe("useCategoriesQuery", () => {
    it("calls categoriesApi.list", async () => {
      const { result } = renderHook(() => useCategoriesQuery(), {
        wrapper: createWrapper(),
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.categoriesApi.list).toHaveBeenCalled();
    });
  });

  describe("useCreateCategoryMutation", () => {
    it("creates category and redirects to category filter", async () => {
      vi.mocked(apiClient.categoriesApi.create).mockResolvedValue(mockCategory);
      const { result } = renderHook(() => useCreateCategoryMutation(), {
        wrapper: createWrapper(),
      });
      result.current.mutate({ name: "Work", color: "orange" });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.categoriesApi.create).toHaveBeenCalledWith({
        name: "Work",
        color: "orange",
      });
      expect(mockPush).toHaveBeenCalledWith("/app?category=1");
    });

    it("calls onSuccess with created category", async () => {
      vi.mocked(apiClient.categoriesApi.create).mockResolvedValue(mockCategory);
      const onSuccess = vi.fn();
      const { result } = renderHook(
        () => useCreateCategoryMutation({ onSuccess }),
        { wrapper: createWrapper() }
      );
      result.current.mutate({ name: "Work", color: "orange" });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(onSuccess).toHaveBeenCalledWith(mockCategory);
    });
  });

  describe("useRenameCategoryMutation", () => {
    it("updates category name and invalidates queries", async () => {
      vi.mocked(apiClient.categoriesApi.update).mockResolvedValue({
        ...mockCategory,
        name: "Updated",
      });
      const onSettled = vi.fn();
      const { result } = renderHook(
        () =>
          useRenameCategoryMutation({
            category: mockCategory,
            onSettled,
          }),
        { wrapper: createWrapper() }
      );
      result.current.mutate("Updated");
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.categoriesApi.update).toHaveBeenCalledWith(1, {
        name: "Updated",
      });
      expect(onSettled).toHaveBeenCalled();
    });
  });

  describe("useDeleteCategoryMutation", () => {
    it("deletes category and redirects when isSelected", async () => {
      vi.mocked(apiClient.categoriesApi.delete).mockResolvedValue(
        undefined as never
      );
      const { result } = renderHook(
        () =>
          useDeleteCategoryMutation({
            category: mockCategory,
            isSelected: true,
            baseHref: "/app",
          }),
        { wrapper: createWrapper() }
      );
      result.current.mutate();
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.categoriesApi.delete).toHaveBeenCalledWith(1);
      expect(mockPush).toHaveBeenCalledWith("/app");
    });

    it("does not redirect when not selected", async () => {
      vi.mocked(apiClient.categoriesApi.delete).mockResolvedValue(
        undefined as never
      );
      const { result } = renderHook(
        () =>
          useDeleteCategoryMutation({
            category: mockCategory,
            isSelected: false,
            baseHref: "/app",
          }),
        { wrapper: createWrapper() }
      );
      result.current.mutate();
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
