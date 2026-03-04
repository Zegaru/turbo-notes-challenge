"use client";

import Image from "next/image";
import Link from "next/link";

const sizeMap = {
  sm: { width: 32, height: 32, textClass: "text-sm", gapClass: "gap-1.5" },
  md: { width: 40, height: 40, textClass: "text-base", gapClass: "gap-2" },
  lg: { width: 80, height: 80, textClass: "text-2xl", gapClass: "gap-3" },
  xl: { width: 140, height: 140, textClass: "text-3xl", gapClass: "gap-4" },
} as const;

type AppLogoSize = keyof typeof sizeMap;

export interface AppLogoProps {
  size?: AppLogoSize;
  showText?: boolean;
  asLink?: boolean;
  className?: string;
}

export function AppLogo({
  size = "md",
  showText = false,
  asLink = false,
  className = "",
}: AppLogoProps) {
  const { width, height, textClass, gapClass } = sizeMap[size];

  const content = (
    <span
      className={`inline-flex items-center ${gapClass} ${className}`}
      aria-label="Notes"
    >
      <Image
        src="/images/notes-logo.png"
        alt=""
        width={width}
        height={height}
        className="shrink-0 rounded-lg"
      />
      {showText && (
        <span className={`font-heading font-bold text-border ${textClass}`}>
          Notes
        </span>
      )}
    </span>
  );

  if (asLink) {
    return (
      <Link href="/" className="rounded flex focus-ring">
        {content}
      </Link>
    );
  }

  return content;
}
