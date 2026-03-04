"use client";

import { Button } from "@/components/ui/button";
import { isAuthenticated } from "@/lib/auth-store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MarkdownPreview } from "@/components/app/markdown-preview";

const FEATURES = [
  {
    id: "pinned",
    title: "Pinned Notes",
    category: "Organization",
    date: "today",
    content:
      "Keep your most important thoughts at the very top. Never lose track of a brilliant idea again.",
    color: "bg-note-orange-card",
    borderColor: "border-note-orange",
    rotation: "-rotate-[4deg]",
    zIndex: 40,
    delay: "0.4s",
    position: "top-[0%] left-[10%]",
    pin: true,
  },
  {
    id: "images",
    title: "Visual Context",
    category: "Media",
    date: "yesterday",
    content:
      "A picture is worth a thousand words. Attach images to your notes with ease.",
    color: "bg-note-yellow-card",
    borderColor: "border-note-yellow",
    rotation: "rotate-[3deg]",
    zIndex: 30,
    delay: "0.5s",
    position: "top-[15%] left-[45%]",
    tape: true,
  },
  {
    id: "markdown",
    title: "Markdown Support",
    category: "Formatting",
    date: "Oct 22",
    content:
      "Write with **bold**, *italic*, or ~~strikethrough~~.\n\n```js\nconsole.log('Code snippets!');\n```",
    color: "bg-note-sage-card",
    borderColor: "border-note-sage",
    rotation: "-rotate-[2deg]",
    zIndex: 20,
    delay: "0.6s",
    position: "top-[40%] left-[0%]",
  },
  {
    id: "ai",
    title: "AI Categories",
    category: "Magic",
    date: "Oct 20",
    content:
      "Let our smart AI automatically categorize your notes based on their content.",
    color: "bg-note-teal-card",
    borderColor: "border-note-teal",
    rotation: "rotate-[5deg]",
    zIndex: 10,
    delay: "0.7s",
    position: "top-[55%] left-[35%]",
  },
];

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleOpenApp = () => {
    router.push(isAuthenticated() ? "/app" : "/login");
  };

  const showOpenApp = mounted && isAuthenticated();

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes reveal-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes reveal-card {
          0% { opacity: 0; transform: translateY(40px) scale(0.95) rotate(0deg); }
          100% { opacity: 1; transform: translateY(0) scale(1); } /* Rotation is handled by tailwind classes */
        }
        .animate-reveal-up { animation: reveal-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-reveal-card { animation: reveal-card 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        @media (prefers-reduced-motion: reduce) {
          .animate-reveal-up, .animate-reveal-card { animation: none; opacity: 1; }
        }
      `,
        }}
      />
      <main id="main" className="relative min-h-screen overflow-hidden bg-bg selection:bg-accent/20">
        {/* Layered Atmosphere Background */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,var(--color-bg-warm)_0%,transparent_40%)] opacity-30 mix-blend-multiply" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,var(--color-note-sage)_0%,transparent_40%)] opacity-20 mix-blend-multiply" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,var(--color-note-yellow)_0%,transparent_50%)] opacity-10 mix-blend-multiply" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:flex lg:min-h-screen lg:items-center lg:px-8 lg:py-0">
          {/* Left Column: Hero Copy */}
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:shrink-0 pt-16 lg:pt-0">
            <div
              className="animate-reveal-up"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-border/30 bg-white/50 px-3 py-1 text-sm font-body text-accent backdrop-blur-sm shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-note-orange opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-note-orange"></span>
                </span>
                v1.0 is live
              </span>
            </div>

            <h1
              className="mt-8 font-heading text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl animate-reveal-up"
              style={{ animationDelay: "0.2s" }}
            >
              Thoughts, <br />
              <span className="relative whitespace-nowrap">
                <span className="relative z-10 italic text-accent pr-4">
                  beautifully
                </span>
                <span className="absolute bottom-2 left-0 -z-10 h-4 w-full bg-note-yellow/60 -rotate-1 rounded-sm"></span>
              </span>
              <br /> captured.
            </h1>

            <p
              className="mt-6 text-lg leading-relaxed font-body text-gray-700 sm:max-w-md animate-reveal-up"
              style={{ animationDelay: "0.3s" }}
            >
              A note-taking experience that feels like your favorite notebook.
              Organize with ease, write in markdown, and let AI handle the
              categorization.
            </p>

            <div
              className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-reveal-up"
              style={{ animationDelay: "0.4s" }}
            >
              {showOpenApp ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleOpenApp}
                  className="group relative overflow-hidden text-base w-full sm:w-auto"
                >
                  <span className="relative z-10">Open Notebook</span>
                </Button>
              ) : (
                <>
                  <Link href="/signup">
                    <Button
                      variant="primary"
                      size="lg"
                      className="group text-base w-full sm:w-auto"
                    >
                      Start Writing
                    </Button>
                  </Link>
                  <Link
                    href="/login"
                    className="group flex items-center gap-2 font-body text-sm font-medium text-gray-700 hover:text-accent transition-colors px-4 py-3 rounded focus-ring"
                  >
                    Sign in
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </>
              )}
            </div>

            <div
              className="mt-12 animate-reveal-up"
              style={{ animationDelay: "0.5s" }}
            >
              <Link
                href="/readme"
                className="inline-flex items-center gap-2 text-sm font-body text-gray-500 hover:text-gray-900 transition-colors rounded focus-ring px-1 -mx-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V"
                  ></path>
                </svg>
                Read the Documentation
              </Link>
            </div>
          </div>

          {/* Right Column: Floating Notes Board */}
          <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32 items-center justify-center relative w-full lg:w-[600px] h-[600px] lg:h-[700px]">
            <div className="relative w-full h-full">
              {FEATURES.map((feature) => (
                <div
                  key={feature.id}
                  className={`absolute w-64 sm:w-72 transition-all duration-500 hover:z-50 hover:scale-105 animate-reveal-card ${feature.position} ${feature.rotation}`}
                  style={{
                    zIndex: feature.zIndex,
                    animationDelay: feature.delay,
                  }}
                >
                  <div
                    className={`group relative block rounded-2xl border-2 p-5 font-body shadow-[0_8px_30px_rgb(0,0,0,0.08)] ${feature.color} ${feature.borderColor}`}
                  >
                    {/* Subtle paper overlay */}
                    <div
                      className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-linear-to-br from-white/60 via-transparent to-black/5 opacity-80"
                      aria-hidden="true"
                    />

                    {/* Tape accessory */}
                    {feature.tape && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 bg-white/40 backdrop-blur-sm border border-white/30 -rotate-2 z-20 shadow-sm" />
                    )}

                    <div className="relative z-10 flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs flex items-center gap-2 mb-3">
                          <span className="font-bold text-black/70">
                            {feature.date}
                          </span>
                          <span className="text-black/30">•</span>
                          <span className="text-black/60">
                            {feature.category}
                          </span>
                        </div>
                        <h3 className="font-heading text-xl text-black/90 font-bold mb-2">
                          {feature.title}
                        </h3>
                        {feature.id === "markdown" ? (
                          <div className="text-sm text-black/80 leading-relaxed">
                            <MarkdownPreview
                              content={feature.content}
                              className="[&_p]:mb-1 [&_pre]:mt-2 [&_pre]:p-2 [&_code]:text-xs [&_pre]:bg-white/50 [&_pre]:border [&_pre]:border-black/10"
                            />
                          </div>
                        ) : (
                          <div className="text-sm text-black/70 leading-relaxed whitespace-pre-wrap">
                            {feature.content}
                          </div>
                        )}
                      </div>

                      {/* App-style Pin */}
                      {feature.pin && (
                        <div className="shrink-0 p-1 text-black">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
