// app/api/auth/session/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ session: null });
    }

    // Return session object that Supabase client can use
    const session = {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'bearer',
    };

    return NextResponse.json({ session });

  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ session: null });
  }
}