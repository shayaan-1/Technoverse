import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
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
    const user = JSON.parse(decodeURIComponent(userCookie));
    const userId = user.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in cookie' },
        { status: 400 }
      );
    }

    // ✅ Fetch issues where assigned_to = user.id
    const { data: issues, error } = await supabaseAdmin
      .from('issues')
      .select('*')
      .eq('assigned_to', userId);

    if (error) {
      console.error('Error fetching issues:', error.message);
      return NextResponse.json(
        { error: 'Failed to fetch issues' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, issues }, { status: 200 });

  } catch (error) {
    console.error('GET /api/assigned-issues error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
