"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Moon, Sun, Search, Menu } from "lucide-react";

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    // Check system pref or localStorage
    if (localStorage.getItem("theme") === "dark" || 
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)] h-16 transition-colors duration-300">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold text-[var(--primary)] font-serif tracking-tight">
            بصائر
          </Link>
          <span className="hidden sm:inline-block text-sm text-[var(--muted-foreground)]">رحلة في الكون والحياة والدين</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          {/* Mobile menu, would have drawer logic here */}
          <button className="md:hidden p-2 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
