// app/api/auth/register/route.js - Simplified Version
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { email, password, fullName, role, department, phone } = await req.json();

    console.log('📝 Registration request received for:', email);

    // Basic validation
    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, fullName, and role are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['citizen', 'department_official', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Validate department for officials
    if (role === 'department_official' && !department) {
      return NextResponse.json(
        { error: 'Department is required for department officials' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Step 1: Check if email already exists in profiles table
    console.log('🔍 Checking if user already exists...');
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', normalizedEmail)
      .single();

    if (existingProfile) {
      console.log('❌ User already exists');
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    console.log('✅ Email is available');

    // Step 2: Create user via Supabase Auth Admin
    console.log('👤 Creating auth user...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        full_name: fullName.trim(),
        role: role
      }
    });

    if (authError) {
      console.error('❌ Auth creation error:', authError);
      return NextResponse.json(
        { error: `Failed to create user: ${authError.message}` },
        { status: 400 }
      );
    }

    if (!authData.user?.id) {
      console.error('❌ No user ID returned');
      return NextResponse.json(
        { error: 'Failed to create user - no user ID returned' },
        { status: 500 }
      );
    }

    console.log('✅ Auth user created with ID:', authData.user.id);

    // Step 3: Create profile
    const profileData = {
      id: authData.user.id,
      email: normalizedEmail,
      full_name: fullName.trim(),
      role: role,
      department: role === 'department_official' ? department : null,
      phone: phone?.trim() || null
    };

    console.log('📋 Creating profile...');
    const { data: profileResult, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert(profileData)
      .select('*')
      .single();

    if (profileError) {
      console.error('❌ Profile creation error:', profileError);
      
      // Clean up: delete the auth user if profile creation fails
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        console.log('🧹 Cleaned up auth user after profile creation failure');
      } catch (cleanupError) {
        console.error('❌ Failed to cleanup auth user:', cleanupError);
      }

      return NextResponse.json(
        { error: `Failed to create user profile: ${profileError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Profile created successfully');
    console.log('🎉 Registration completed for:', normalizedEmail);

    // Return success
    return NextResponse.json({
      message: 'User registered successfully! You can now sign in.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        emailConfirmed: true
      },
      profile: profileResult
    }, { status: 201 });

  } catch (error) {
    console.error('💥 Unexpected registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration' },
      { status: 500 }
    );
  }
}

// GET method for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'Registration API is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}