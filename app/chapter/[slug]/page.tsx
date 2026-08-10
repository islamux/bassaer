import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllChapters, getChapterData } from "@/lib/contentLoader";
import Sidebar from "@/components/Sidebar";
import BookmarkButton from "@/components/BookmarkButton";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import ErrorBoundary from "@/components/ErrorBoundary";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export async function generateStaticParams() {
  const chapters = getAllChapters();
  return chapters.map((chapter) => ({
    slug: chapter.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chapterData = getChapterData(slug);
  if (!chapterData) {
    return {
      title: "فصل غير موجود",
    };
  }

  return {
    title: `${chapterData.title} | بصائر`,
    description: `اقرأ ${chapterData.title} من كتاب بصائر.`,
  };
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chapterData = getChapterData(slug);

  if (!chapterData) {
    notFound();
  }

  // Find next/prev chapters
  const allChapters = getAllChapters();
  const currentIndex = allChapters.findIndex(c => c.id === slug);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <Sidebar />
      <div className="flex-1 w-full lg:pr-72 overflow-y-auto min-h-full scroll-smooth">
        <main className="max-w-4xl mx-auto px-4 py-12 sm:px-8 lg:px-12 pb-32">
          <ReadingProgressBar chapterId={slug} />
          <ErrorBoundary>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--primary)] tracking-tight">
              {chapterData.title}
            </h1>
            <BookmarkButton chapterId={slug} chapterTitle={chapterData.title} />
          </div>
          <article className="prose prose-lg dark:prose-invert prose-p:text-[var(--foreground)] prose-headings:text-[var(--primary)] max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {chapterData.content.replace(/^#\s+.*$/m, '').trim()}
            </ReactMarkdown>
          </article>
          
          <div className="mt-16 pt-8 border-t border-[var(--border)] flex justify-between items-center text-sm font-medium">
            {prevChapter ? (
              <Link href={`/chapter/${prevChapter.id}`} className="flex flex-col items-end gap-1 hover:text-[var(--primary)] transition-colors p-4 border rounded-xl border-[var(--border)] hover:border-[var(--primary)] bg-[var(--background)]">
                <span className="text-[var(--muted-foreground)]">السابق</span>
                <span className="text-[var(--foreground)]">{prevChapter.title}</span>
              </Link>
            ) : <div />}
            
            {nextChapter ? (
              <Link href={`/chapter/${nextChapter.id}`} className="flex flex-col items-start gap-1 hover:text-[var(--primary)] transition-colors p-4 border rounded-xl border-[var(--border)] hover:border-[var(--primary)] bg-[var(--background)]">
                <span className="text-[var(--muted-foreground)]">التالي</span>
                <span className="text-[var(--foreground)]">{nextChapter.title}</span>
              </Link>
            ) : <div />}
          </div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
