"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "./client";
import { stageLocalBookmarksForSync, syncPendingBookmarks } from "../bookmarks";
import type { User, Session } from "@supabase/supabase-js";

type SupabaseClient = ReturnType<typeof createClient>;

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  loading: true,
  signInWithMagicLink: async () => ({}),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState<SupabaseClient | null>(() =>
    typeof window === "undefined" ? null : createClient()
  );

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN") {
        stageLocalBookmarksForSync();
        syncPendingBookmarks();
      }
    });

    const handleOnline = () => syncPendingBookmarks();
    window.addEventListener("online", handleOnline);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("online", handleOnline);
    };
  }, [supabase]);

  const signInWithMagicLink = useCallback(async (email: string) => {
    if (!supabase) return {};
    const { error } = await supabase.auth.signInWithOtp({ email });
    return error ? { error: error.message } : {};
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithMagicLink, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
