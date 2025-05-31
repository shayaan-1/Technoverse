import { supabaseClient } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    
    const {
      title,
      description,
      category,
      priority,
      latitude,
      longitude,
      address,
      image_url,
      reported_by
    } = body

    // Validate required fields
    if (!title || !description || !reported_by) {
      return NextResponse.json(
        { error: 'Title, description, and reporter are required' },
        { status: 400 }
      )
    }

    // Insert the issue into Supabase
    const { data, error } = await supabaseClient
      .from('issues')
      .insert([
        {
          title,
          description,
          category: category || 'general',
          priority: priority || 'medium',
          latitude: latitude || null,
          longitude: longitude || null,
          address: address || null,
          image_url: image_url || null,
          reported_by,
          status: 'pending'
        }
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to create issue' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Issue created successfully', issue: data[0] },
      { status: 201 }
    )

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req) {
  try {
    // Get department from cookies
    const cookieStore = cookies();
    const department = cookieStore.get('department')?.value;
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found in cookies' },
        { status: 400 }
      );
    }

    // Fetch issues that belong to the department
    const { data: issues, error } = await supabaseAdmin
      .from('issues')
      .select('*')
      .eq('assigned_department', department)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching issues:', error);
      return NextResponse.json(
        { error: 'Failed to fetch issues' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, issues }, { status: 200 });

  } catch (error) {
    console.error('GET /api/issues error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
