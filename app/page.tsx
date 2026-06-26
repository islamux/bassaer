import Link from "next/link";
import { getAllChapters } from "@/lib/contentLoader";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";

export default function Home() {
  const chapters = getAllChapters();

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <Sidebar />
      <div className="flex-1 w-full lg:pr-72 overflow-y-auto min-h-full">
        <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-[var(--muted)]/50 rounded-2xl p-8 mb-12 flex flex-col items-center justify-center text-center shadow-sm border border-[var(--border)] relative overflow-hidden">
            {/* Background pattern for visual flair */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--primary)_0,_transparent_50%)] blur-2xl pointer-events-none"></div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--foreground)] mb-4 tracking-tight font-serif pt-8">
              بصائر في الكون والحياة والدين
            </h1>
            <p className="text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto mb-8 font-medium">
              رحلة فكرية للبحث عن اليقين واكتشاف حقائق الوجود، موجهة لكل باحث عن الحقيقة ومُتشكك. تأليف د. هيثم طلعت.
            </p>
            <Link 
              href={`/chapter/${chapters[0]?.id || "intro"}`} 
              className="inline-flex items-center justify-center bg-[var(--primary)] text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-[var(--primary)]/30 hover:bg-[var(--primary)]/90 hover:-translate-y-1 transition-all duration-300 z-10"
            >
              ابدأ القراءة
            </Link>
          </div>

          <div className="space-y-8 pb-32">
            <h2 className="text-2xl font-bold text-[var(--primary)] border-b pb-4 border-[var(--border)]">محتويات الكتاب</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {chapters.map((chapter) => (
                <Link 
                  key={chapter.id} 
                  href={`/chapter/${chapter.id}`}
                  className="group block rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-sm hover:shadow-md hover:border-[var(--primary)]/50 transition-all duration-300"
                >
                  <h3 className="font-bold text-lg text-[var(--foreground)] group-hover:text-[var(--primary)] mb-2 transition-colors">
                    {chapter.title}
                  </h3>
                  <p className="text-[var(--muted-foreground)] text-sm line-clamp-3">
                    {chapter.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
