// app/api/users/search/route.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthenticatedUser, createUnauthorizedResponse } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const user = await getAuthenticatedUser();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Sanitize query to prevent injection
    const sanitizedQuery = query.replace(/[%_]/g, '\\$&');

    // Search users by name or email (exclude current user)
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, avatar_url, role, department')
      .neq('id', user.id)
      .or(`full_name.ilike.%${sanitizedQuery}%,email.ilike.%${sanitizedQuery}%`)
      .order('full_name')
      .limit(10);

    if (error) {
      console.error('Error searching users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter out users with missing essential data
    const validUsers = users.filter(u => u.full_name && u.email);

    return NextResponse.json({ users: validUsers });

  } catch (error) {
    console.error('Error in GET /api/users/search:', error);
    return createUnauthorizedResponse();
  }
}
