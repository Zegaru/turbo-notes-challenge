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
        className={`flex p-2 flex-col items-center gap-2 rounded-chip border border-dashed transition-colors bg-bg ${
          dragOver ? "border-accent bg-hover" : "border-border"
        } ${disabled ? "opacity-50" : ""}`}
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
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : "Add image"}
        </Button>
        {currentCount > 0 && (
          <span className="font-body text-sm text-gray-600">
            {currentCount}/{MAX_IMAGES}
          </span>
        )}
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
