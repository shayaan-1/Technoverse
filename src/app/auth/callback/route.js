import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  // Read cookies from incoming request
  const cookieStore = cookies()

  // Create Supabase client, only with cookie getter (no set/remove)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // Exchange the OAuth code for session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data?.user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  // Check if user profile exists, if not create default profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .single()

  if (!profile) {
    const username =
      data.user.user_metadata?.full_name ||
      data.user.user_metadata?.name ||
      data.user.email?.split('@')[0] ||
      'User'

    await supabase.from('profiles').insert({
      id: data.user.id,
      username,
      role: 'user',
    })
  }

  // Get the session again to retrieve tokens for cookies
  const sessionData = await supabase.auth.getSession()
  const session = sessionData?.data?.session

  // Prepare redirect response and set cookies manually
  const response = NextResponse.redirect(`${origin}${next}`)

  if (session) {
    response.cookies.set('sb-access-token', session.access_token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    })

    response.cookies.set('sb-refresh-token', session.refresh_token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    })
  }

  return response
}
