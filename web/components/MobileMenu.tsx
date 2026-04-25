"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { ChapterMeta } from "@/lib/contentLoader";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: ChapterMeta[];
}

export default function MobileMenu({ isOpen, onClose, chapters }: MobileMenuProps) {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 bottom-0 z-[70] w-80 bg-[var(--background)] shadow-2xl transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--primary)]">فهرس المحتويات</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto h-[calc(100vh-4rem)]">
          <ul className="space-y-4">
            {chapters.map((chapter) => (
              <li key={chapter.id}>
                <Link
                  href={`/chapter/${chapter.id}`}
                  onClick={onClose}
                  className="block p-2 text-[var(--foreground)] font-medium hover:text-[var(--primary)] transition-colors"
                >
                  {chapter.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
