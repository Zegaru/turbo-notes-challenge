export type ParsedSearch = {
  pinned: boolean;
  categoryId: string | null;
  q: string;
};

const PINNED_REGEX = /\bpinned\b/i;

export function parseSearchQuery(
  search: string,
  categories: { id: number; name: string }[]
): ParsedSearch {
  const trimmed = search.trim();
  if (!trimmed) {
    return { pinned: false, categoryId: null, q: "" };
  }

  let remainder = trimmed;
  const pinned = PINNED_REGEX.test(remainder);
  if (pinned) {
    remainder = remainder.replace(PINNED_REGEX, "").replace(/\s+/g, " ").trim();
  }

  let categoryId: string | null = null;
  const remainderLower = remainder.toLowerCase();
  const matched = categories.find(
    (c) => c.name.toLowerCase() === remainderLower
  );
  if (matched) {
    categoryId = String(matched.id);
    remainder = "";
  }

  return {
    pinned,
    categoryId,
    q: remainder,
  };
}
