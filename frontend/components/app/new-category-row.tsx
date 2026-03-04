"use client";

import {
  CATEGORY_COLORS,
  categoriesApi,
  colorToDotClass,
  type CategoryColor,
} from "@/lib/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InlineMessage } from "@/components/ui/inline-message";

export function NewCategoryRow() {
  const [name, setName] = useState("");
  const [color, setColor] = useState<CategoryColor>("orange");
  const queryClient = useQueryClient();
  const router = useRouter();

  const createMutation = useMutation({
    mutationFn: (data: { name: string; color: CategoryColor }) =>
      categoriesApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setName("");
      setColor("orange");
      router.push(`/app?category=${data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    createMutation.mutate({ name: trimmed, color });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New category…"
        disabled={createMutation.isPending}
        className="w-full rounded-chip border border-border px-3 py-2 font-body text-sm shadow-card placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-border"
      />
      {createMutation.isError && (
        <InlineMessage variant="error">
          {createMutation.error instanceof Error
            ? createMutation.error.message
            : "Failed to create category"}
        </InlineMessage>
      )}
      <div className="flex gap-2">
        {CATEGORY_COLORS.map((c) => (
          <Button
            key={c}
            variant="color"
            type="button"
            onClick={() => setColor(c)}
            title={c}
            className={`${colorToDotClass[c]} ${color === c ? "ring-2 ring-border ring-offset-1" : "border-transparent"}`}
          />
        ))}
      </div>
    </form>
  );
}
