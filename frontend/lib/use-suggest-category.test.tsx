import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSuggestCategory } from "./use-suggest-category";
import * as apiClient from "./api-client";

vi.mock("./api-client", () => ({
  notesApi: {
    suggestCategory: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useSuggestCategory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns suggestion when API returns category", async () => {
    vi.mocked(apiClient.notesApi.suggestCategory).mockResolvedValue({
      suggested_category_id: 1,
      suggested_category_name: "Work",
      reason: "Matches work content",
    });
    const { result } = renderHook(() => useSuggestCategory(), {
      wrapper: createWrapper(),
    });
    act(() => {
      result.current.suggestMutation.mutate({
        title: "Meeting",
        content: "Notes",
      });
    });
    await waitFor(() => {
      expect(result.current.suggestion).toEqual({ id: 1, name: "Work" });
    });
  });

  it("returns null suggestion when API returns no category", async () => {
    vi.mocked(apiClient.notesApi.suggestCategory).mockResolvedValue({
      suggested_category_id: null,
      suggested_category_name: null,
      reason: "No match",
    });
    const { result } = renderHook(() => useSuggestCategory(), {
      wrapper: createWrapper(),
    });
    act(() => {
      result.current.suggestMutation.mutate({
        title: "Random",
        content: "Text",
      });
    });
    await waitFor(() => {
      expect(result.current.suggestion).toBeNull();
    });
  });

  it("returns null on API error", async () => {
    vi.mocked(apiClient.notesApi.suggestCategory).mockRejectedValue(
      new Error("API error")
    );
    const { result } = renderHook(() => useSuggestCategory(), {
      wrapper: createWrapper(),
    });
    act(() => {
      result.current.suggestMutation.mutate({
        title: "Meeting",
        content: "Notes",
      });
    });
    await waitFor(() => {
      expect(result.current.suggestion).toBeNull();
    });
  });

  it("applySuggestion returns id and clears suggestion", async () => {
    vi.mocked(apiClient.notesApi.suggestCategory).mockResolvedValue({
      suggested_category_id: 2,
      suggested_category_name: "Personal",
      reason: "Matches",
    });
    const { result } = renderHook(() => useSuggestCategory(), {
      wrapper: createWrapper(),
    });
    act(() => {
      result.current.suggestMutation.mutate({ title: "Note", content: "" });
    });
    await waitFor(() => {
      expect(result.current.suggestion).toEqual({ id: 2, name: "Personal" });
    });
    let applied: number | null = 0;
    act(() => {
      applied = result.current.applySuggestion();
    });
    expect(applied).toBe(2);
    expect(result.current.suggestion).toBeNull();
  });

  it("applySuggestion returns null when no suggestion", () => {
    const { result } = renderHook(() => useSuggestCategory(), {
      wrapper: createWrapper(),
    });
    const applied = result.current.applySuggestion();
    expect(applied).toBeNull();
  });
});
