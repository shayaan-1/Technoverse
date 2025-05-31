import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Authenticate user
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Fetch user profile with role and department info
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("full_name, role, department, phone")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // Create response with user data
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: data.user.id,
          email: data.user.email,
          fullName: profile.full_name,
          role: profile.role,
          department: profile.department,
          phone: profile.phone,
        },
      },
      { status: 200 }
    );

    // ... inside your POST handler, after getting profile

    const userObj = {
      id: data.user.id,
      email: data.user.email,
      fullName: profile.full_name,
      role: profile.role,
      department: profile.department,
      phone: profile.phone,
    };

    // Set access and refresh tokens (HTTP-only)
    response.cookies.set("access_token", data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set("refresh_token", data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    // Set user info cookie (not HTTP-only so accessible by client-side if needed)
    response.cookies.set("user", JSON.stringify(userObj), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login" },
      { status: 500 }
    );
  }
}
