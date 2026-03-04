import * as React from "react";

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-6 w-6",
} as const;

type SpinnerProps = {
  size?: keyof typeof sizeClasses;
  className?: string;
};

export const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  function Spinner({ size = "md", className = "", ...props }, ref) {
    const sizeClass = sizeClasses[size];
    return (
      <svg
        ref={ref}
        className={`shrink-0 animate-spin ${sizeClass} ${className}`.trim()}
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden
        {...props}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );
  }
);
