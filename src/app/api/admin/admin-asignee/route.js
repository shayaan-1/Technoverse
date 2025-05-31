import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!department) {
      return NextResponse.json(
        { error: 'Department is required in query parameters' },
        { status: 400 }
      );
    }

    const { data: workers, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('department', department);

      console.log("Departments", workers)

    if (error) {
      console.error('Error fetching issues:', error.message);
      return NextResponse.json(
        { error: 'Failed to fetch issues' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, workers }, { status: 200 });
  } catch (error) {
    console.error('GET /api/admin-issues error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
