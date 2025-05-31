// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Initialize auth from cookies (call this on app start)
export const initializeAuth = async () => {
  try {
    // Check if we have tokens in cookies
    const response = await fetch('/api/auth/session');
    if (response.ok) {
      const { session } = await response.json();
      if (session) {
        await supabase.auth.setSession(session);
      }
    }
  } catch (error) {
    console.error('Failed to initialize auth:', error);
  }
};

// Helper to get current user
export const getCurrentUser = () => {
  return supabase.auth.getUser();
};