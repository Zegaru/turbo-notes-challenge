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
    <html
      lang="en"
      className={`${inriaSerif.variable} ${inter.variable} scroll-smooth`}
    >
      <head>
        <link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Notes" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only rounded-chip border-2 border-border bg-bg px-4 py-2 font-body text-sm outline-none transition-shadow focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:m-0 focus:block focus-ring"
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
