import type { Metadata } from "next";
import { Inria_Serif, Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inriaSerif = Inria_Serif({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-inria-serif",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Notes Challenge",
  description: "Notes app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inriaSerif.variable} ${inter.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only rounded-chip border-2 border-border bg-bg px-4 py-2 font-body text-sm outline-none transition-shadow focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:m-0 focus:block focus-ring"
        >
          Skip to main content
        </a>
        <div className="root">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
