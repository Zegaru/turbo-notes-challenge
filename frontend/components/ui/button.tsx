import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";

const brutalistShadow =
  "shadow-[3px_3px_0px_0px_rgba(149,113,57,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(149,113,57,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all";

const variantStyles: Record<string, string> = {
  primary: `border-2 border-border bg-bg font-body ${brutalistShadow} disabled:opacity-50 disabled:pointer-events-none font-medium`,
  ghost: "block text-left border border-border font-body hover:bg-hover",
  secondary: `border-2 border-border bg-white font-body ${brutalistShadow} disabled:opacity-50 disabled:pointer-events-none font-medium`,
  icon: "flex h-14 w-14 items-center justify-center rounded-full bg-[#2d2d2d] text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50",
  color:
    "h-6 w-6 shrink-0 rounded-full border-2 transition-all border-transparent",
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
    const sizeClass = FIXED_VARIANTS.includes(
      variant as (typeof FIXED_VARIANTS)[number]
    )
      ? ""
      : (sizeStyles[size] ?? sizeStyles.md);
    const classes = [variantClass, sizeClass, className]
      .filter(Boolean)
      .join(" ");
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
