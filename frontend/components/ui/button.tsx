import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";

const variantStyles: Record<string, string> = {
  primary:
    "border border-border bg-bg font-body shadow-card hover:bg-hover disabled:opacity-50",
  ghost: "block w-full text-left border border-border font-body hover:bg-hover",
  secondary:
    "border border-border bg-bg font-body shadow-card hover:bg-hover disabled:opacity-50",
  icon: "flex h-14 w-14 items-center justify-center rounded-full bg-[#2d2d2d] text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50",
  color: "h-6 w-6 shrink-0 rounded-full border-2 transition-all border-transparent",
};

const sizeStyles: Record<string, string> = {
  sm: "rounded-chip px-3 py-1.5 text-sm",
  md: "rounded-chip px-3 py-2 text-sm",
  lg: "rounded-card px-4 py-2",
};

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

export interface ButtonProps extends BaseButton.Props {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const FIXED_VARIANTS = ["icon", "color"] as const;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", className = "", ...props },
    ref
  ) {
    const variantClass = variantStyles[variant] ?? variantStyles.primary;
    const sizeClass =
      FIXED_VARIANTS.includes(variant as (typeof FIXED_VARIANTS)[number])
        ? ""
        : sizeStyles[size] ?? sizeStyles.md;
    const classes = [variantClass, sizeClass, className].filter(Boolean).join(" ");
    return (
      <BaseButton
        ref={ref}
        className={classes}
        focusableWhenDisabled={props.type === "submit"}
        {...props}
      />
    );
  }
);
