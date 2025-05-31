// lib/auth.js
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function getAuthenticatedUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('access_token')?.value;
    
    if (!token) {
      throw new Error('No access token found');
    }
    
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      throw new Error('Invalid token');
    }
    
    // Get user profile from our profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      throw new Error('Profile not found');
    }
    
    return {
      ...user,
      profile
    };
  } catch (error) {
    console.error('Auth error:', error);
    throw error;
  }
}

export function createUnauthorizedResponse() {
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }), 
    { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
