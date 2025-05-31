// app/api/chats/route.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthenticatedUser, createUnauthorizedResponse } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    // Get all chats where user is participant
    const { data: chats, error } = await supabaseAdmin
      .from('chats')
      .select('*')
      .or(`user1.eq.${user.id},user2.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching chats:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Process chats to get other user info and latest message
    const processedChats = await Promise.all(
      chats.map(async (chat) => {
        const otherUserId = chat.user1 === user.id ? chat.user2 : chat.user1;
        
        // Get other user's profile
        const { data: otherUser, error: userError } = await supabaseAdmin
          .from('profiles')
          .select('id, full_name, avatar_url, role, department, email')
          .eq('id', otherUserId)
          .single();

        if (userError) {
          console.error('Error fetching other user:', userError);
          return null;
        }

        // Get latest message for this chat
        const { data: latestMessage } = await supabaseAdmin
          .from('messages')
          .select('id, content, sender_id, created_at')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          id: chat.id,
          otherUser,
          latestMessage,
          created_at: chat.created_at
        };
      })
    );

    // Filter out null entries and sort by latest message time
    const validChats = processedChats.filter(chat => chat !== null);
    validChats.sort((a, b) => {
      const aTime = a.latestMessage?.created_at || a.created_at;
      const bTime = b.latestMessage?.created_at || b.created_at;
      return new Date(bTime) - new Date(aTime);
    });

    return NextResponse.json({ chats: validChats });

  } catch (error) {
    console.error('Error in GET /api/chats:', error);
    return createUnauthorizedResponse();
  }
}

export async function POST(req) {
  try {
    const user = await getAuthenticatedUser();
    const { otherUserId } = await req.json();

    if (!otherUserId) {
      return NextResponse.json({ error: 'Other user ID is required' }, { status: 400 });
    }

    if (otherUserId === user.id) {
      return NextResponse.json({ error: 'Cannot chat with yourself' }, { status: 400 });
    }

    // Verify other user exists
    const { data: otherUserExists } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', otherUserId)
      .single();

    if (!otherUserExists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if chat already exists (both directions)
    const { data: existingChat } = await supabaseAdmin
      .from('chats')
      .select('id')
      .or(and(`user1.eq.${user.id},user2.eq.${otherUserId}),and(user1.eq.${otherUserId},user2.eq.${user.id}`))
      .maybeSingle();

    if (existingChat) {
      return NextResponse.json({ chatId: existingChat.id });
    }

    // Create new chat (ensure user1 < user2 for consistency)
    const [user1, user2] = [user.id, otherUserId].sort();
    
    const { data: newChat, error } = await supabaseAdmin
      .from('chats')
      .insert({ user1, user2 })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating chat:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ chatId: newChat.id });

  } catch (error) {
    console.error('Error in POST /api/chats:', error);
    return createUnauthorizedResponse();
 }
}
