import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";

export function Select<Value, Multiple extends boolean | undefined = false>(
  props: BaseSelect.Root.Props<Value, Multiple>
): React.JSX.Element {
  return <BaseSelect.Root {...props} />;
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  BaseSelect.Trigger.Props
>(function SelectTrigger({ className, ...props }, ref) {
  return (
    <BaseSelect.Trigger
      ref={ref}
      className={`rounded-full border border-gray-400/50 bg-transparent px-4 py-1.5 font-body text-sm text-gray-800 outline-none focus:ring-2 focus:ring-black flex items-center justify-between gap-2 data-placeholder:text-gray-500 ${className || ""}`}
      {...props}
    />
  );
});

export const SelectValue = BaseSelect.Value;

export const SelectIcon = React.forwardRef<
  HTMLSpanElement,
  BaseSelect.Icon.Props
>(function SelectIcon(props, ref) {
  return (
    <BaseSelect.Icon ref={ref} {...props}>
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </BaseSelect.Icon>
  );
});

export const SelectPortal = BaseSelect.Portal;

export const SelectPositioner = React.forwardRef<
  HTMLDivElement,
  BaseSelect.Positioner.Props
>(function SelectPositioner({ className, ...props }, ref) {
  return (
    <BaseSelect.Positioner
      ref={ref}
      className={`z-50 ${className || ""}`}
      {...props}
    />
  );
});

export const SelectPopup = React.forwardRef<
  HTMLDivElement,
  BaseSelect.Popup.Props
>(function SelectPopup({ className, ...props }, ref) {
  return (
    <BaseSelect.Popup
      ref={ref}
      className={`relative z-50 min-w-32 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg data-open:animate-in data-closed:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ${className || ""}`}
      {...props}
    />
  );
});

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  BaseSelect.Item.Props
>(function SelectItem({ className, ...props }, ref) {
  return (
    <BaseSelect.Item
      ref={ref}
      className={`relative flex w-full cursor-default select-none items-center rounded-lg py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 data-disabled:pointer-events-none data-disabled:opacity-50 ${className || ""}`}
      {...props}
    />
  );
});

export const SelectItemText = BaseSelect.ItemText;

export const SelectItemIndicator = React.forwardRef<
  HTMLSpanElement,
  BaseSelect.ItemIndicator.Props
>(function SelectItemIndicator({ className, ...props }, ref) {
  return (
    <BaseSelect.ItemIndicator
      ref={ref}
      className={`absolute left-2 flex h-3.5 w-3.5 items-center justify-center ${className || ""}`}
      {...props}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </BaseSelect.ItemIndicator>
  );
});
