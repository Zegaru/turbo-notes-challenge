"use client";

import { notesApi } from "@/lib/api-client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { InlineMessage } from "@/components/ui/inline-message";

const MAX_IMAGES = 5;

type ImageUploaderProps = {
  noteId: number;
  currentCount: number;
  onUploadSuccess: () => void;
};

export function ImageUploader({
  noteId,
  currentCount,
  onUploadSuccess,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const disabled = currentCount >= MAX_IMAGES;

  const handleFile = async (file: File | null) => {
    if (!file || disabled) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    setError(null);
    setUploading(true);
    setProgress(0);
    try {
      await notesApi.uploadImage(noteId, file, {
        onProgress: (loaded, total) => {
          if (total > 0) setProgress((loaded / total) * 100);
        },
      });
      onUploadSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file ?? null);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file ?? null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`group relative -rotate-1 transition-all duration-300 ${
          disabled
            ? "opacity-50"
            : "hover:z-10 hover:-translate-y-1 hover:scale-105"
        }`}
      >
        <div
          className={`relative rounded-sm border border-black/5 bg-[#FDFBF7] p-2.5 pb-12 shadow-[0_2px_10px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 ${
            !disabled &&
            "group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.12),0_4px_10px_rgba(0,0,0,0.06)]"
          }`}
        >
          <div
            role="button"
            tabIndex={disabled || uploading ? -1 : 0}
            onClick={() => !disabled && !uploading && inputRef.current?.click()}
            onKeyDown={(e) => {
              if (
                (e.key === "Enter" || e.key === " ") &&
                !disabled &&
                !uploading
              ) {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            className={`flex h-24 w-24 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-sm border border-dashed transition-colors bg-gray-100/60 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[#FDFBF7] ${
              dragOver ? "border-accent bg-hover" : "border-black/15"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleChange}
              disabled={disabled || uploading}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled || uploading}
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              className="h-7 rounded-sm bg-black/5 px-3 text-[10px] font-medium tracking-widest text-gray-600 uppercase hover:bg-black/10 hover:text-black"
            >
              {uploading ? "Uploading…" : "Add image"}
            </Button>
            <span className="text-[10px] text-gray-500">Click or drop</span>
          </div>
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center">
            <span className="font-body text-[11px] text-gray-500">
              {currentCount}/{MAX_IMAGES}
            </span>
          </div>
        </div>
      </div>
      {progress != null && progress < 100 && (
        <div className="h-1 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {error && <InlineMessage variant="error">{error}</InlineMessage>}
    </div>
  );
}
