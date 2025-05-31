// app/api/chats/[chatId]/messages/route.js
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthenticatedUser, createUnauthorizedResponse } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const user = await getAuthenticatedUser();
    const { chatId } = params;

    // Verify user is participant in this chat
    const { data: chat, error: chatError } = await supabaseAdmin
      .from('chats')
      .select('user1, user2')
      .eq('id', chatId)
      .single();

    if (chatError || !chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    if (chat.user1 !== user.id && chat.user2 !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get messages for this chat
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('id, content, sender_id, created_at')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get sender info for each message
    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => {
        const { data: sender } = await supabaseAdmin
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', message.sender_id)
          .single();

        return {
          ...message,
          sender
        };
      })
    );

    return NextResponse.json({ messages: messagesWithSenders });

  } catch (error) {
    console.error('Error in GET /api/chats/[chatId]/messages:', error);
    return createUnauthorizedResponse();
  }
}

export async function POST(req, { params }) {
  try {
    const user = await getAuthenticatedUser();
    const { chatId } = params;
    const { content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    if (content.trim().length > 1000) {
      return NextResponse.json({ error: 'Message too long (max 1000 characters)' }, { status: 400 });
    }

    // Verify user is participant in this chat
    const { data: chat, error: chatError } = await supabaseAdmin
      .from('chats')
      .select('user1, user2')
      .eq('id', chatId)
      .single();

    if (chatError || !chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    if (chat.user1 !== user.id && chat.user2 !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Insert message
    const { data: message, error } = await supabaseAdmin
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: user.id,
        content: content.trim()
      })
      .select('id, content, sender_id, created_at')
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get sender info
    const { data: sender } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', user.id)
      .single();

    const messageWithSender = {
      ...message,
      sender
    };

    return NextResponse.json({ message: messageWithSender });

  } catch (error) {
    console.error('Error in POST /api/chats/[chatId]/messages:', error);
    return createUnauthorizedResponse();
  }
}
