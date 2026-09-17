// ============================================================
// ROPHIM — Supabase Client
// Lazy-loads the supabase-js v2 library from CDN and exposes
// a single window.sb client for the rest of the app.
// ============================================================
(function () {
  if (!window.sb) {
    window.sbReady = (async function () {
      if (window.ROPHIM_DEMO_MODE) return null;

      // Inject script tag if not yet loaded
      if (!window.supabase) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }

      const client = window.supabase.createClient(
        window.ROPHIM_CONFIG.SUPABASE_URL,
        window.ROPHIM_CONFIG.SUPABASE_ANON_KEY,
        { auth: { persistSession: true, autoRefreshToken: true } }
      );
      window.sb = client;
      return client;
    })();
  }
})();

// ============================================================
// Auth helpers
// ============================================================
window.RophimAuth = {
  async signIn(email, password) {
    if (!window.sb) await window.sbReady;
    if (!window.sb) throw new Error('Supabase chưa được cấu hình.');
    const { data, error } = await window.sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signUp(email, password) {
    if (!window.sb) await window.sbReady;
    if (!window.sb) throw new Error('Supabase chưa được cấu hình.');
    const { data, error } = await window.sb.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!window.sb) return;
    await window.sb.auth.signOut();
  },

  async user() {
    if (!window.sb) return null;
    const { data } = await window.sb.auth.getUser();
    return data?.user || null;
  },

  onChange(cb) {
    if (!window.sb) return;
    window.sb.auth.onAuthStateChange((_event, session) => cb(session?.user || null));
  },
};
