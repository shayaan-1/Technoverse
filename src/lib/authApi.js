// lib/authApi.js - Updated to use API route
export const registerUser = async (formData) => {
  try {
    console.log('🚀 Starting registration via API with data:', {
      email: formData.email,
      fullName: formData.fullName,
      role: formData.role,
      department: formData.department
    });

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
        department: formData.department,
        phone: formData.phone
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Registration failed');
    }

    console.log('✅ Registration successful:', result);

    return {
      success: true,
      message: result.message,
      userId: result.user?.id,
      emailConfirmed: result.user?.emailConfirmed || true
    };

  } catch (error) {
    console.error('❌ Registration error:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred during registration'
    };
  }
};

// Login function (if you need it)
export const loginUser = async (email, password) => {
  try {
    console.log('🔐 Attempting login for:', email);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Login failed');
    }

    console.log('✅ Login successful:', result);

    return {
      success: true,
      message: result.message,
      user: result.user
    };

  } catch (error) {
    console.error('❌ Login error:', error);
    return {
      success: false,
      message: error.message || 'Login failed'
    };
  }
};

// Check email availability (still uses direct client for read-only operations)
export const checkEmailAvailability = async (email) => {
  try {
    const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
    const result = await response.json();

    return {
      available: result.available,
      message: result.message
    };
  } catch (error) {
    console.error('Email check error:', error);
    return {
      available: true, // Default to available on error
      message: 'Unable to verify email availability'
    };
  }
};

// Get current user session (client-side)
import { supabaseClient } from './supabaseClient';

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    if (error) {
      throw error;
    }

    if (!user) {
      return { user: null, profile: null };
    }

    // Get profile data
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return { user, profile: null, error: profileError.message };
    }

    return { user, profile };

  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null, profile: null, error: error.message };
  }
};

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabaseClient.auth.signOut();
    
    if (error) {
      throw error;
    }

    return { success: true, message: 'Signed out successfully' };

  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, message: error.message };
  }
};