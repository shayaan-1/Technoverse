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