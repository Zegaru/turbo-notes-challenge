import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNoteAutosave } from "./use-note-autosave";
import * as apiClient from "./api-client";

vi.mock("./api-client", () => ({
  notesApi: {
    update: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

const baseNote = {
  id: 1,
  title: "Original",
  content: "Content",
  pinned: false,
  draft: false,
  category: 1,
  category_name: "Work",
  category_color: "orange" as const,
  images: [],
  created_at: "",
  updated_at: "",
};

describe("useNoteAutosave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(apiClient.notesApi.update).mockResolvedValue(baseNote);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not save when noteId is null", () => {
    renderHook(
      () =>
        useNoteAutosave({
          noteId: null,
          title: "Changed",
          content: "Content",
          categoryId: "1",
          pinned: false,
          note: baseNote,
          categoryIdParam: null,
          isEditing: true,
        }),
      { wrapper: createWrapper() }
    );
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(apiClient.notesApi.update).not.toHaveBeenCalled();
  });

  it("saves after debounce when noteId and isEditing", async () => {
    renderHook(
      () =>
        useNoteAutosave({
          noteId: "1",
          title: "Changed",
          content: "New content",
          categoryId: "1",
          pinned: false,
          note: baseNote,
          categoryIdParam: null,
          isEditing: true,
        }),
      { wrapper: createWrapper() }
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(700);
    });
    expect(apiClient.notesApi.update).toHaveBeenCalledWith(
      1,
      {
        title: "Changed",
        content: "New content",
        category: 1,
        pinned: false,
        draft: false,
      },
      expect.objectContaining({ signal: expect.any(Object) })
    );
  });

  it("sets saveStatus to error on API failure", async () => {
    vi.useRealTimers();
    vi.mocked(apiClient.notesApi.update).mockRejectedValue(
      new Error("Network error")
    );
    const { result } = renderHook(
      () =>
        useNoteAutosave({
          noteId: "1",
          title: "Changed",
          content: "Content",
          categoryId: "1",
          pinned: false,
          note: baseNote,
          categoryIdParam: null,
          isEditing: true,
        }),
      { wrapper: createWrapper() }
    );
    await waitFor(
      () => {
        expect(result.current.saveStatus).toBe("error");
        expect(result.current.errorMessage).toBe("Network error");
      },
      { timeout: 2000 }
    );
    vi.useFakeTimers();
  });

  it("clearError resets errorMessage", async () => {
    vi.useRealTimers();
    vi.mocked(apiClient.notesApi.update).mockRejectedValue(
      new Error("Network error")
    );
    const { result } = renderHook(
      () =>
        useNoteAutosave({
          noteId: "1",
          title: "Changed",
          content: "Content",
          categoryId: "1",
          pinned: false,
          note: baseNote,
          categoryIdParam: null,
          isEditing: true,
        }),
      { wrapper: createWrapper() }
    );
    await waitFor(
      () => expect(result.current.errorMessage).toBe("Network error"),
      { timeout: 2000 }
    );
    act(() => {
      result.current.clearError();
    });
    expect(result.current.errorMessage).toBeNull();
    vi.useFakeTimers();
  });
});
