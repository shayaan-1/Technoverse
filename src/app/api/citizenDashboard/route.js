import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req) {
  try {
    // Get user data from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const userCookie = cookieStore.get('user')?.value;

    if (!accessToken || !userCookie) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // ✅ Decode and parse the user JSON from the cookie
    const users = JSON.parse(decodeURIComponent(userCookie));
    const userId = users.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in cookie' },
        { status: 400 }
      );
    }
    // Verify the token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' }, 
        { status: 401 }
      );
    }

    // Get URL search params for pagination and filtering
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseAdmin
      .from('issues')
      .select('*', { count: 'exact' })
      .eq('reported_by', userId)
      .order('created_at', { ascending: false });

    // Add filters if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    const { data: issues, error: fetchError, count } = await query;

    if (fetchError) {
      console.error('Database fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch issues' }, 
        { status: 500 }
      );
    }

    // Calculate total pages
    const totalPages = Math.ceil(count / limit);

    return NextResponse.json({
      success: true,
      issues: issues || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get issues API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching issues' }, 
      { status: 500 }
    );
  }
}