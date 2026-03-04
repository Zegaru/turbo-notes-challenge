import * as React from "react";

type InlineMessageProps = {
  variant: "error" | "success";
  children: React.ReactNode;
  className?: string;
};

const variantStyles = {
  error: "text-red-600",
  success: "text-green-700",
};

export function InlineMessage({
  variant,
  children,
  className = "",
}: InlineMessageProps) {
  return (
    <p
      className={`font-body text-sm ${variantStyles[variant]} ${className}`.trim()}
      role="alert"
    >
      {children}
    </p>
  );
}
