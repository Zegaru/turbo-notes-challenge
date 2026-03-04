"use client";

import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/ui/app-logo";
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
    position: "top-[20%] left-[45%]",
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
    position: "top-[65%] left-[35%]",
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
      <main
        id="main"
        className="relative min-h-screen overflow-hidden bg-bg selection:bg-accent/20"
      >
        {/* Layered Atmosphere Background */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,var(--color-bg-warm)_0%,transparent_40%)] opacity-30 mix-blend-multiply" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,var(--color-note-sage)_0%,transparent_40%)] opacity-20 mix-blend-multiply" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,var(--color-note-yellow)_0%,transparent_50%)] opacity-10 mix-blend-multiply" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-0">
          <div className="lg:flex lg:min-h-screen lg:items-center">
            {/* Left Column: Hero Copy */}
            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:shrink-0 pt-16 lg:pt-0">
              <div
                className="flex justify-center lg:justify-start animate-reveal-up"
                style={{ animationDelay: "0.05s" }}
              >
                <AppLogo size="lg" />
              </div>
              <div
                className="mt-6 animate-reveal-up"
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
                className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 animate-reveal-up"
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
                <a
                  href="#tech-stack"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("tech-stack")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
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
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  Tech Stack
                </a>
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
                            <svg
                              className="h-5 w-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
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

          {/* Tech Stack */}
          <section
            id="tech-stack"
            className="mt-12 lg:mt-16 pb-16 animate-reveal-up"
            style={{ animationDelay: "0.6s" }}
          >
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
              Built With
            </h2>
            <ul className="font-body text-sm text-gray-600 space-y-1">
              <li>Django + Django REST Framework</li>
              <li>Next.js + TypeScript</li>
              <li>PostgreSQL</li>
              <li>Docker</li>
              <li>OpenAI API</li>
            </ul>
            <a
              href="https://github.com/Zegaru/turbo-notes-challenge"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-body text-accent hover:text-accent/80 transition-colors rounded focus-ring px-1 -mx-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View on GitHub
            </a>
          </section>

          <footer className="pb-12 pt-8 text-center">
            <a
              href="https://www.zegaru.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-lg border border-border/40 bg-white/40 px-5 py-2.5 shadow-sm backdrop-blur-sm hover:border-accent/40 hover:shadow-md transition-all focus-ring"
            >
              <span className="text-xs font-body uppercase tracking-widest text-gray-500">
                Crafted by
              </span>
              <span className="font-heading text-base font-bold text-gray-800 group-hover:text-accent transition-colors">
                Zegaru
              </span>
              <svg
                className="w-4 h-4 text-gray-400 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </footer>
        </div>
      </main>
    </>
  );
}
