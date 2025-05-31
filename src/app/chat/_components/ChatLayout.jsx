// components/chat/ChatLayout.jsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import UserSearch from './UserSearch';

export default function ChatLayout({ currentUser }) {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  // Load chats
  const loadChats = async () => {
    try {
      const response = await fetch('/api/chats');
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle new chat creation
  const handleNewChat = async (otherUserId) => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otherUserId })
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedChatId(data.chatId);
        loadChats(); // Refresh chat list
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    loadChats();

    // Subscribe to new chats
    const chatsSubscription = supabase
      .channel('chats')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chats',
          filter: `or(user1.eq.${currentUser.id},user2.eq.${currentUser.id})`
        }, 
        () => {
          loadChats();
        }
      )
      .subscribe();

    // Subscribe to new messages (to update latest message in chat list)
    const messagesSubscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages'
        }, 
        () => {
          loadChats(); // Refresh to get latest message
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatsSubscription);
      supabase.removeChannel(messagesSubscription);
    };
  }, [currentUser.id]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-1/3 border-r bg-white">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b">
            <h1 className="text-xl font-semibold">Messages</h1>
          </div>

          {/* User Search */}
          <div className="p-4 border-b">
            <UserSearch onSelectUser={handleNewChat} />
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            <ChatList
              chats={chats}
              selectedChatId={selectedChatId}
              onSelectChat={setSelectedChatId}
              loading={loading}
              currentUserId={currentUser.id}
            />
          </div>
        </div>
      </div>

      {/* Right Chat Window */}
      <div className="flex-1">
        {selectedChatId ? (
          <ChatWindow
            chatId={selectedChatId}
            currentUser={currentUser}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-medium">Select a conversation</h3>
              <p>Choose from your existing conversations or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


