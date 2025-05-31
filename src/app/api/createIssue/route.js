import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';


export async function POST(req) {
  try {
    // Get the access token from cookies
    const cookieStore = cookies();
    const accessToken = await cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Verify the token and get user info
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' }, 
        { status: 401 }
      );
    }

    // Parse form data (handle both JSON and FormData for image uploads)
    let formData;
    const contentType = req.headers.get('content-type');
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData (with image)
      const data = await req.formData();
      formData = {
        title: data.get('title'),
        description: data.get('description'),
        category: data.get('category'),
        priority: data.get('priority'),
        address: data.get('address'),
        image: data.get('image'),
        department: data.get('department'), // ADD THIS LINE
      };
    } else {
      // Handle JSON data
      formData = await req.json();
    }

    // Validate required fields
    if (!formData.title || !formData.description || !formData.category) {
      return NextResponse.json(
        { error: 'Title, description, and category are required' }, 
        { status: 400 }
      );
    }

    let imageUrl = null;

    // Handle image upload if present
    if (formData.image && formData.image instanceof File) {
      const file = formData.image;
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      // Upload image to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('issue-images')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload image' }, 
          { status: 500 }
        );
      }

      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('issue-images')
        .getPublicUrl(fileName);
      
      imageUrl = publicUrl;
    }

    // Insert issue into database
    const { data: issue, error: insertError } = await supabaseAdmin
      .from('issues')
      .insert({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority || 'medium',
        address: formData.address || null,
        image_url: imageUrl,
        reported_by: user.id,
        status: 'pending',
        created_at: new Date().toISOString(),
        assigned_department: formData.department || null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create issue' }, 
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Issue created successfully',
        issue: {
          id: issue.id,
          title: issue.title,
          description: issue.description,
          category: issue.category,
          priority: issue.priority,
          address: issue.address,
          imageUrl: issue.image_url,
          status: issue.status,
          createdAt: issue.created_at
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Issue creation API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating the issue' }, 
      { status: 500 }
    );
  }
}