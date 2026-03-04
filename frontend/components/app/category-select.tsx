"use client";

import type { Category } from "@/lib/api-client";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectPositioner,
  SelectPopup,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
} from "@/components/ui/select";

type CategorySelectProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  categories: Category[];
  disabled?: boolean;
};

export function CategorySelect({
  value,
  onChange,
  categories,
  disabled = false,
}: CategorySelectProps) {
  const isEmpty = !value || value === "none";
  return (
    <Select
      value={value ?? "none"}
      onValueChange={(val) => onChange(val === "none" ? null : val)}
      disabled={disabled}
    >
      <SelectTrigger
        aria-label="Category"
        className={
          isEmpty
            ? "min-w-40 border-dashed border-gray-400/60 text-gray-500 hover:border-gray-500/70 hover:text-gray-600"
            : ""
        }
      >
        <SelectValue placeholder="Pick category">
          {(val: string) => {
            if (val === "none") return "Pick category";
            const cat = categories.find((c) => String(c.id) === val);
            return cat ? cat.name : "Pick category";
          }}
        </SelectValue>
        <SelectIcon />
      </SelectTrigger>
      <SelectPortal>
        <SelectPositioner>
          <SelectPopup>
            <SelectItem value="none">
              <SelectItemIndicator />
              <SelectItemText>No Category</SelectItemText>
            </SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                <SelectItemIndicator />
                <SelectItemText>{c.name}</SelectItemText>
              </SelectItem>
            ))}
          </SelectPopup>
        </SelectPositioner>
      </SelectPortal>
    </Select>
  );
}
