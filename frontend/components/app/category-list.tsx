"use client";

import { useCategoriesQuery } from "@/lib/categories-queries";
import { CategoryRow } from "./category-row";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function CategoryList() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("category");

  const {
    data: categories = [],
    isPending,
    isError,
    refetch,
  } = useCategoriesQuery();

  const baseHref = "/app";

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={baseHref}
        className={`font-body text-sm font-bold text-gray-900 hover:opacity-90 transition-opacity ${!selectedId ? "opacity-100" : "opacity-75"}`}
      >
        All notes
      </Link>

      {isPending ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : isError ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-red-600">Failed to load categories</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-left text-sm text-gray-700 underline hover:text-gray-900"
          >
            Retry
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {categories.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              isSelected={selectedId === String(cat.id)}
              baseHref={baseHref}
            />
          ))}
        </ul>
      )}

      {!isPending && !isError && categories.length === 0 && (
        <p className="text-sm text-gray-500">No categories yet</p>
      )}
    </div>
  );
}
