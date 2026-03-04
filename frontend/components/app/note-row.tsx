"use client";

import {
  colorToCardClass,
  type CategoryColor,
  type Note,
} from "@/lib/api-client";
import { MarkdownPreview } from "@/components/app/markdown-preview";
import Link from "next/link";

const DEFAULT_CARD_CLASS = "bg-note-orange-card border-note-orange";

const PHOTO_ROTATIONS = ["-rotate-2", "rotate-1", "-rotate-1"] as const;

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
      data-testid="note-row"
      data-note-id={String(note.id)}
      className={`group relative block rounded-2xl border-2 p-4 font-body transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.06),0_4px_8px_rgba(0,0,0,0.03)] sm:p-6 ${bgClass} ${
        isSelected ? "ring-2 ring-black ring-offset-2 ring-offset-bg" : ""
      }`}
    >
      {/* Subtle overlay to simulate paper surface/lighting */}
      <div
        className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-linear-to-br from-white/40 via-transparent to-black/5 opacity-80 group-hover:opacity-100 transition-opacity duration-300"
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-sm flex items-center gap-2">
            <span className="font-bold text-black">
              {formatRelativeDate(note.updated_at)}
            </span>
            {note.category_name && (
              <span className="text-gray-700">{note.category_name}</span>
            )}
          </div>
          <h3 className="mt-4 font-heading text-2xl text-black sm:text-3xl">
            {note.title || "Untitled"}
          </h3>
          <div className="mt-3 line-clamp-4 overflow-hidden">
            <MarkdownPreview
              content={note.content || ""}
              className="text-sm text-gray-800 leading-relaxed [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-bold"
            />
          </div>
          {note.images && note.images.length > 0 && (
            <div className="mt-4 flex items-end gap-1">
              {note.images.slice(0, 3).map((img, i) => (
                <div
                  key={img.id}
                  className={`relative h-15 w-15 shrink-0 rounded-[2px] border border-black/5 bg-[#FDFBF7] p-0.5 pb-3 shadow-[0_2px_6px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.03)] transition-transform duration-300 group-hover:scale-105 ${PHOTO_ROTATIONS[i % PHOTO_ROTATIONS.length]}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt=""
                    className="h-full w-full object-cover filter brightness-95 contrast-[1.1] sepia-[0.2]"
                  />
                </div>
              ))}
              {note.images.length > 3 && (
                <div
                  className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[2px] border border-black/5 bg-[#FDFBF7] pb-2 text-xs font-medium text-gray-500 shadow-[0_2px_6px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.03)] transition-transform duration-300 group-hover:scale-105 ${PHOTO_ROTATIONS[note.images.length % PHOTO_ROTATIONS.length]}`}
                >
                  +{note.images.length - 3}
                </div>
              )}
            </div>
          )}
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
          data-testid="note-pin-btn"
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
