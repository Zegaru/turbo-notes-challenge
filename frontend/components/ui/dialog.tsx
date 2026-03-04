import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";

export const Dialog = BaseDialog.Root;

export const DialogTrigger = BaseDialog.Trigger;

export const DialogPortal = BaseDialog.Portal;

export const DialogBackdrop = React.forwardRef<
  HTMLDivElement,
  BaseDialog.Backdrop.Props
>(function DialogBackdrop({ className, ...props }, ref) {
  return (
    <BaseDialog.Backdrop
      ref={ref}
      className={`fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm transition-all duration-300 data-starting-style:opacity-0 data-ending-style:opacity-0 ${className || ""}`}
      {...props}
    />
  );
});

export const DialogPopup = React.forwardRef<
  HTMLDivElement,
  BaseDialog.Popup.Props
>(function DialogPopup({ className, ...props }, ref) {
  return (
    <BaseDialog.Popup
      ref={ref}
      className={`fixed inset-0 z-50 flex items-center justify-center p-8 outline-none pointer-events-none transition-all duration-300 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 ${className || ""}`}
      {...props}
    />
  );
});

export const DialogClose = React.forwardRef<
  HTMLButtonElement,
  BaseDialog.Close.Props
>(function DialogClose({ className, ...props }, ref) {
  return (
    <BaseDialog.Close
      ref={ref}
      className={`text-gray-500 hover:text-black transition-colors ${className || ""}`}
      {...props}
    >
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </BaseDialog.Close>
  );
});
