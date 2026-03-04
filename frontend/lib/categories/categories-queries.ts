"use client";

import {
  categoriesApi,
  type Category,
  type CategoryColor,
} from "@/lib/api/api-client";
import { categoriesKeys } from "@/lib/api/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useCategoriesQuery() {
  return useQuery({
    queryKey: categoriesKeys.all,
    queryFn: () => categoriesApi.list(),
  });
}

type CreateCategoryOptions = {
  onSuccess?: (data: Category) => void;
};

export function useCreateCategoryMutation(options?: CreateCategoryOptions) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; color: CategoryColor }) =>
      categoriesApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.all });
      options?.onSuccess?.(data);
      router.push(`/app?category=${data.id}`);
    },
  });
}

type RenameCategoryOptions = {
  category: Category;
  onSettled?: () => void;
};

export function useRenameCategoryMutation({
  category,
  onSettled,
}: RenameCategoryOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => categoriesApi.update(category.id, { name }),
    onMutate: async (newName) => {
      await queryClient.cancelQueries({ queryKey: categoriesKeys.all });
      const prev = queryClient.getQueryData<Category[]>(categoriesKeys.all);
      queryClient.setQueryData<Category[]>(categoriesKeys.all, (old) =>
        old?.map((c) =>
          c.id === category.id ? { ...c, name: newName } : c
        ) ?? []
      );
      return { prev };
    },
    onError: (_e, _newName, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(categoriesKeys.all, ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.all });
      onSettled?.();
    },
  });
}

type DeleteCategoryOptions = {
  category: Category;
  isSelected: boolean;
  baseHref: string;
  onSuccess?: () => void;
};

export function useDeleteCategoryMutation({
  category,
  isSelected,
  baseHref,
  onSuccess,
}: DeleteCategoryOptions) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => categoriesApi.delete(category.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.all });
      onSuccess?.();
      if (isSelected) {
        router.push(baseHref);
      }
    },
  });
}
