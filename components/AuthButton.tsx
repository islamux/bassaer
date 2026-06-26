"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/supabase/auth-context";
import { LogIn, Mail, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AuthButton() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleMagicLink = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({ email });
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  }, [email]);

  if (loading) {
    return (
      <button className="p-2 rounded-full text-[var(--muted-foreground)]" disabled>
        <Loader2 className="w-5 h-5 animate-spin" />
      </button>
    );
  }

  if (user) return null;

  return (
    <>
      <button
        onClick={() => setShowLogin(true)}
        className="p-2 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
        aria-label="تسجيل الدخول"
      >
        <LogIn className="w-5 h-5" />
      </button>

      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowLogin(false)}>
          <div className="bg-[var(--background)] rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl border border-[var(--border)]" onClick={e => e.stopPropagation()}>
            {sent ? (
              <div className="text-center py-6">
                <Mail className="w-12 h-12 mx-auto mb-3 text-[var(--primary)]" />
                <p className="text-[var(--foreground)] font-medium">تحقق من بريدك الإلكتروني</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">تم إرسال رابط تسجيل الدخول إلى {email}</p>
                <button onClick={() => { setSent(false); setEmail(""); }} className="mt-4 text-sm text-[var(--primary)] hover:underline">
                  إرسال مرة أخرى
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">تسجيل الدخول</h3>
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="بريدك الإلكتروني"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--primary)] transition-colors"
                  />
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    إرسال رابط الدخول
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
