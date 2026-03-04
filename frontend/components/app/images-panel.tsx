"use client";

import type { NoteImage } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

const ROTATIONS = [
  "-rotate-2",
  "rotate-1",
  "-rotate-1",
  "rotate-2",
  "rotate-0",
];

type ImagesPanelProps = {
  images: NoteImage[];
  onImageClick: (img: NoteImage) => void;
  onInsertIntoNote: (url: string) => void;
  onDeleteImage?: (img: NoteImage) => void;
  uploadSlot: React.ReactNode;
  canInsert?: boolean;
};

export function ImagesPanel({
  images,
  onImageClick,
  onInsertIntoNote,
  onDeleteImage,
  uploadSlot,
  canInsert = true,
}: ImagesPanelProps) {
  return (
    <div className="mb-4 flex flex-col gap-3" data-testid="images-panel">
      <h3 className="font-heading text-sm font-semibold text-gray-800 sr-only">
        Images
      </h3>
      <div className="flex flex-wrap items-start gap-2">
        {images.map((img, i) => (
          <div
            key={img.id}
            className={`group relative transition-all duration-300 hover:z-10 hover:-translate-y-1 hover:scale-105 ${ROTATIONS[i % ROTATIONS.length]}`}
          >
            <div className="relative rounded-sm border border-black/5 bg-[#FDFBF7] p-2.5 pb-12 shadow-[0_2px_10px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.12),0_4px_10px_rgba(0,0,0,0.06)]">
              {onDeleteImage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteImage(img);
                  }}
                  className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/20 text-white opacity-0 transition-opacity duration-200 hover:bg-red-600/90 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                  aria-label="Delete image"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={() => onImageClick(img)}
                className="block overflow-hidden bg-gray-200 focus-ring focus:ring-offset-[#FDFBF7]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt=""
                  className={`object-cover transition-all duration-500 filter brightness-95 contrast-[1.1] sepia-[0.2] group-hover:brightness-100 group-hover:contrast-100 group-hover:sepia-0 ${ROTATIONS[i % ROTATIONS.length]} ${canInsert ? "h-24 w-24" : "h-32 w-32"}`}
                />
              </button>

              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center">
                {canInsert ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 rounded-sm bg-black/5 px-3 text-[11px] font-medium tracking-widest text-gray-600 uppercase opacity-0 transition-all duration-300 hover:bg-black/10 hover:text-black group-hover:translate-y-0 group-hover:opacity-100 translate-y-1"
                    onClick={() => onInsertIntoNote(img.url)}
                  >
                    Insert
                  </Button>
                ) : (
                  <span className="block h-7 w-12 border-t border-b border-black/5 opacity-50" />
                )}
              </div>
            </div>
          </div>
        ))}
        {uploadSlot}
      </div>
    </div>
  );
}
