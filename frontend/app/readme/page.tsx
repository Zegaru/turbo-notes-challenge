import fs from "fs";
import path from "path";
import Link from "next/link";
import { MarkdownPreview } from "@/components/app/markdown-preview";

function getReadmePath(): string {
  const cwd = process.cwd();
  const fromFrontend = path.join(cwd, "..", "README.md");
  const fromRoot = path.join(cwd, "README.md");
  if (fs.existsSync(fromFrontend)) return fromFrontend;
  if (fs.existsSync(fromRoot)) return fromRoot;
  return fromFrontend;
}

export default function ReadmePage() {
  let content = "";
  try {
    const readmePath = getReadmePath();
    content = fs.readFileSync(readmePath, "utf-8");
  } catch {
    content = "README not found.";
  }

  return (
    <main className="min-h-screen bg-bg p-6 sm:p-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 font-body text-sm font-medium text-gray-600 hover:text-accent transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        <article className="relative rounded-2xl border-2 border-border bg-[#FDFBF7] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.08)] before:absolute before:inset-0 before:z-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-black/5 before:pointer-events-none">
          {/* Decorative tape */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-white/40 backdrop-blur-sm border border-white/30 -rotate-1 z-20 shadow-sm" />
          
          <div className="relative z-10">
            <MarkdownPreview 
              content={content} 
              className="[&_h1]:text-4xl [&_h1]:mb-6 [&_h1]:mt-8 [&_h1:first-child]:mt-0 [&_h1]:border-b [&_h1]:border-border/30 [&_h1]:pb-4 [&_h2]:text-2xl [&_h2]:mb-4 [&_h2]:mt-8 [&_h3]:text-xl [&_h3]:mb-3 [&_h3]:mt-6 [&_p]:mb-5 [&_p]:text-gray-800 [&_p]:leading-relaxed [&_ul]:mb-6 [&_ul]:space-y-2 [&_li]:text-gray-800 [&_ol]:mb-6 [&_ol]:space-y-2 [&_pre]:my-6 [&_pre]:shadow-inner [&_pre]:!bg-[#F4F1EA] [&_pre]:border [&_pre]:border-border/20 [&_code:not(pre_code)]:!bg-border/10 [&_code:not(pre_code)]:text-accent [&_code:not(pre_code)]:px-1.5 [&_code:not(pre_code)]:py-0.5 [&_code:not(pre_code)]:rounded-md [&_blockquote]:my-6 [&_blockquote]:bg-note-sage/10 [&_blockquote]:py-2 [&_blockquote]:pr-4 [&_blockquote]:rounded-r-lg [&_table]:w-full [&_table]:mb-6 [&_th]:border-b [&_th]:border-border/40 [&_th]:pb-2 [&_th]:text-left [&_td]:border-b [&_td]:border-border/20 [&_td]:py-3 [&_hr]:border-border/30 [&_hr]:my-8"
            />
          </div>
        </article>
      </div>
    </main>
  );
}
