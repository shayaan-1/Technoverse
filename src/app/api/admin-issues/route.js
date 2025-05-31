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

    const { data: issues, error } = await supabaseAdmin
      .from('issues')
      .select('*')
      .eq('assigned_department', department);

      console.log("Issues", issues)

    if (error) {
      console.error('Error fetching issues:', error.message);
      return NextResponse.json(
        { error: 'Failed to fetch issues' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, issues }, { status: 200 });
  } catch (error) {
    console.error('GET /api/admin-issues error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}


export async function PUT(req) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get('id');
    const issueId = searchParams.get('selected_issue');

    if (!accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!departmentId || !issueId) {
      return NextResponse.json({ error: 'Department ID and Issue ID are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('issues')
      .update({ assigned_to: departmentId })  // Assign departmentId to assigned_to
      .eq('id', issueId);                      // Update only where issue id matches

    if (error) {
      console.error('Error updating issue:', error.message);
      return NextResponse.json({ error: 'Failed to assign user to issue' }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated: data }, { status: 200 });
  } catch (error) {
    console.error('PUT /api/admin-issues error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

