import { describe, expect, it } from "vitest";
import { parseSearchQuery } from "./parse-search-query";

const categories = [
  { id: 1, name: "Work" },
  { id: 2, name: "Personal" },
];

describe("parseSearchQuery", () => {
  it("returns empty state for blank search", () => {
    expect(parseSearchQuery("", categories)).toEqual({
      pinned: false,
      categoryId: null,
      q: "",
    });
    expect(parseSearchQuery("   ", categories)).toEqual({
      pinned: false,
      categoryId: null,
      q: "",
    });
  });

  it("extracts pinned flag when 'pinned' is present", () => {
    expect(parseSearchQuery("pinned", categories)).toEqual({
      pinned: true,
      categoryId: null,
      q: "",
    });
    expect(parseSearchQuery("PINNED", categories)).toEqual({
      pinned: true,
      categoryId: null,
      q: "",
    });
    expect(parseSearchQuery("show pinned notes", categories)).toEqual({
      pinned: true,
      categoryId: null,
      q: "show notes",
    });
  });

  it("matches category by exact name (case-insensitive)", () => {
    expect(parseSearchQuery("Work", categories)).toEqual({
      pinned: false,
      categoryId: "1",
      q: "",
    });
    expect(parseSearchQuery("work", categories)).toEqual({
      pinned: false,
      categoryId: "1",
      q: "",
    });
    expect(parseSearchQuery("Personal", categories)).toEqual({
      pinned: false,
      categoryId: "2",
      q: "",
    });
  });

  it("returns q as remainder when no category match", () => {
    expect(parseSearchQuery("meeting notes", categories)).toEqual({
      pinned: false,
      categoryId: null,
      q: "meeting notes",
    });
    expect(parseSearchQuery("  python tutorial  ", categories)).toEqual({
      pinned: false,
      categoryId: null,
      q: "python tutorial",
    });
  });

  it("handles pinned + category", () => {
    expect(parseSearchQuery("pinned Work", categories)).toEqual({
      pinned: true,
      categoryId: "1",
      q: "",
    });
  });

  it("handles empty categories", () => {
    expect(parseSearchQuery("Work", [])).toEqual({
      pinned: false,
      categoryId: null,
      q: "Work",
    });
  });
});
