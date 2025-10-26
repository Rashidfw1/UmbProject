import { createClient } from '@supabase/supabase-js';

// Hardcoding credentials as process.env is not available in this client-side environment.
const supabaseUrl = "https://pxqcnnxedxwsjflwdpgw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cWNubnhlZHh3c2pmbHdkcGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjYwMTksImV4cCI6MjA3NjkwMjAxOX0.Ek4BtnENUnfUZ68LpWYz1gqz6p1sKD5hbDUlMRfb0Vo";


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Fix for Supabase v2 where localStorage is not available in some environments by default
        storage: typeof window !== 'undefined' ? window.localStorage : undefined as any,
    }
});
