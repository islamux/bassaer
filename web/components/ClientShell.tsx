"use client";

import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import SearchDialog from "./SearchDialog";
import type { ChapterMeta } from "@/lib/contentLoader";

interface ClientShellProps {
  chapters: ChapterMeta[];
  children: React.ReactNode;
}

export default function ClientShell({ chapters, children }: ClientShellProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(s => !s);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <Navbar chapters={chapters} onSearchOpen={() => setIsSearchOpen(true)} />
      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <main className="min-h-screen pt-16">
        {children}
      </main>
    </>
  );
}
