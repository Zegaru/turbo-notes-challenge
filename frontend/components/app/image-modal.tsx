"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogPortal,
  DialogPopup,
} from "@/components/ui/dialog";

type ImageModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
};

export function ImageModal({ open, onOpenChange, imageUrl }: ImageModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogBackdrop forceRender />
        <DialogPopup>
          <div className="relative max-h-[90vh] max-w-[90vw] pointer-events-auto bg-white rounded-card border border-border shadow-card">
            {imageUrl && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-h-[90vh] min-h-64 max-w-full object-contain rounded-card border border-border shadow-card"
                />
                <DialogClose
                  className="absolute -top-2 -right-2 rounded-full bg-bg border border-border p-1 shadow-card"
                  aria-label="Close"
                />
              </>
            )}
          </div>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
