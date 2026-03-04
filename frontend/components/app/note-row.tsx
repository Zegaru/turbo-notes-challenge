"use client";

import {
  colorToCardClass,
  type CategoryColor,
  type Note,
} from "@/lib/api-client";
import { MarkdownPreview } from "@/components/app/markdown-preview";
import Link from "next/link";

const DEFAULT_CARD_CLASS = "bg-note-orange-card border-note-orange";

function formatRelativeDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isToday) return "today";
  if (isYesterday) return "yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type NoteRowProps = {
  note: Note;
  isSelected: boolean;
  categoryParam: string | null;
  onPinToggle: (note: Note) => void;
};

export function NoteRow({
  note,
  isSelected,
  categoryParam,
  onPinToggle,
}: NoteRowProps) {
  const href = categoryParam
    ? `/app?category=${categoryParam}&note=${note.id}`
    : `/app?note=${note.id}`;

  const bgClass =
    note.category_color && note.category_color in colorToCardClass
      ? colorToCardClass[note.category_color as CategoryColor]
      : DEFAULT_CARD_CLASS;

  return (
    <Link
      href={href}
      className={`block rounded-2xl border-2 p-6 font-body shadow-card transition-transform hover:-translate-y-1 ${bgClass} ${
        isSelected ? "ring-2 ring-black ring-offset-2 ring-offset-bg" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-sm flex items-center gap-2">
            <span className="font-bold text-black">
              {formatRelativeDate(note.updated_at)}
            </span>
            {note.category_name && (
              <span className="text-gray-700">{note.category_name}</span>
            )}
          </div>
          <h3 className="mt-4 font-heading text-3xl text-black">
            {note.title || "Untitled"}
          </h3>
          <div className="mt-3 line-clamp-4 overflow-hidden">
            <MarkdownPreview
              content={note.content || ""}
              className="text-sm text-gray-800 leading-relaxed [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-bold"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPinToggle(note);
          }}
          className="shrink-0 p-1 text-gray-600 hover:text-accent"
          aria-label={note.pinned ? "Unpin note" : "Pin note"}
        >
          {note.pinned ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          )}
        </button>
      </div>
    </Link>
  );
}
