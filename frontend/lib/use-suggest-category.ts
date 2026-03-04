"use client";

import { notesApi } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";

type Suggestion = { id: number; name: string } | null;

export function useSuggestCategory() {
  const [suggestion, setSuggestion] = useState<Suggestion>(null);

  const suggestMutation = useMutation({
    mutationFn: (data: { title?: string; content?: string }) =>
      notesApi.suggestCategory(data),
    onSuccess: (data) => {
      if (data.suggested_category_id != null && data.suggested_category_name) {
        setSuggestion({
          id: data.suggested_category_id,
          name: data.suggested_category_name,
        });
      } else {
        setSuggestion(null);
      }
    },
    onError: () => setSuggestion(null),
  });

  const applySuggestion = useCallback((): number | null => {
    if (suggestion) {
      const id = suggestion.id;
      setSuggestion(null);
      return id;
    }
    return null;
  }, [suggestion]);

  return { suggestion, suggestMutation, applySuggestion };
}
