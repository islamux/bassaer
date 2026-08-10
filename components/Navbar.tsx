"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Moon, Sun, Search, Menu } from "lucide-react";
import { ChapterMeta } from "@/lib/contentLoader";
import MobileMenu from "./MobileMenu";
import AuthButton from "./AuthButton";
import UserMenu from "./UserMenu";

interface NavbarProps {
  chapters: ChapterMeta[];
  onSearchOpen?: () => void;
}

function subscribeTheme(notify: () => void) {
  window.addEventListener("basaar-theme-change", notify);
  return () => window.removeEventListener("basaar-theme-change", notify);
}

export default function Navbar({ chapters, onSearchOpen }: NavbarProps) {
  const isDark = useSyncExternalStore(
    subscribeTheme,
    () => document.documentElement.classList.contains("dark"),
    () => false
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark", !isDark);
    localStorage.setItem("theme", isDark ? "light" : "dark");
    window.dispatchEvent(new Event("basaar-theme-change"));
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)] h-16 transition-colors duration-300">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold text-[var(--primary)] font-serif tracking-tight">
              بصائر
            </Link>
            <span className="hidden sm:inline-block text-sm text-[var(--muted-foreground)]">رحلة في الكون والحياة والدين</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onSearchOpen}
              className="p-2 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
              aria-label="بحث في الكتاب"
            >
              <Search className="w-5 h-5" />
            </button>
            <UserMenu />
            <AuthButton />
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
              aria-label={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
              aria-label="فتح القائمة"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>
      
      <MobileMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        chapters={chapters} 
      />
    </>
  );
}
