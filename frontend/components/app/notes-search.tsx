"use client";

type NotesSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function NotesSearch({
  value,
  onChange,
  placeholder = "Search your thoughts...",
}: NotesSearchProps) {
  return (
    <>
      <label htmlFor="notes-search" className="sr-only">
        Search notes
      </label>
      <input
        id="notes-search"
        type="search"
        data-testid="notes-search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full  border-0 border-b border-border/40 bg-transparent px-0 py-4 font-body text-base outline-none transition-[border-color,box-shadow] placeholder:font-heading placeholder:text-2xl placeholder:italic placeholder:text-[#6E7F91] focus:border-accent/60 focus:ring-0 focus:shadow-[0_1px_0_0_var(--color-accent)]"
      />
    </>
  );
}
