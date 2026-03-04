"use client";

import { InlineMessage } from "@/components/ui/inline-message";

export type SaveStatusState = "idle" | "saving" | "saved" | "error";

type SaveStatusProps = {
  status: SaveStatusState;
  errorMessage?: string;
  className?: string;
};

export function SaveStatus({
  status,
  errorMessage,
  className = "",
}: SaveStatusProps) {
  if (status === "idle") return null;

  if (status === "saving") {
    return (
      <span
        className={`font-body text-sm text-gray-600 ${className}`.trim()}
        aria-live="polite"
      >
        Saving…
      </span>
    );
  }

  if (status === "saved") {
    return (
      <InlineMessage variant="success" className={className}>
        Saved
      </InlineMessage>
    );
  }

  if (status === "error") {
    return (
      <InlineMessage variant="error" className={className}>
        {errorMessage ?? "Failed to save"}
      </InlineMessage>
    );
  }

  return null;
}
