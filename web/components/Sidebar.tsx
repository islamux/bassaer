import Link from "next/link";
import { getAllChapters } from "@/lib/contentLoader";

export default function Sidebar() {
  const chapters = getAllChapters();

  return (
    <aside 
      className="w-72 fixed right-0 top-16 bottom-0 hidden lg:block overflow-y-auto bg-[var(--background)] border-l border-[var(--border)] p-6 transition-colors duration-300"
      aria-label="فهرس المحتويات الجانبي"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-[var(--primary)] mb-4">فهرس المحتويات</h3>
          <ul className="space-y-4">
            {chapters.map((chapter) => (
              <li key={chapter.id}>
                <Link
                  href={`/chapter/${chapter.id}`}
                  className="group flex flex-col items-start"
                >
                  <span className="text-[var(--foreground)] font-medium group-hover:text-[var(--primary)] transition-colors leading-relaxed">
                    {chapter.title}
                  </span>
                </Link>
                {/* Optional: we could load subheadings but here we just list chapters */}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
