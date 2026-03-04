"use client";

type NotesSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function NotesSearch({ value, onChange, placeholder = "Search notes…" }: NotesSearchProps) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-chip border border-border bg-bg px-4 py-2 font-body text-sm outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-accent/30"
    />
  );
}
