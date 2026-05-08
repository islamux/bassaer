"use client";

import { useState } from "react";
import { useAuth } from "@/lib/supabase/auth-context";
import { User, LogOut } from "lucide-react";
import { mergeLocalToSupabase } from "@/lib/bookmarks";

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  const handleOpen = () => {
    mergeLocalToSupabase();
    setOpen(!open);
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="p-2 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
        aria-label="قائمة المستخدم"
      >
        <User className="w-5 h-5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 z-50 w-64 rounded-xl bg-[var(--background)] border border-[var(--border)] shadow-lg p-4">
            <p className="text-sm text-[var(--foreground)] font-medium truncate" dir="ltr">
              {user.email}
            </p>
            <hr className="my-3 border-[var(--border)]" />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </button>
          </div>
        </>
      )}
    </div>
  );
}
