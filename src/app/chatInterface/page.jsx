'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Users, 
  Hash, 
  Building, 
  MessageCircle,
  Plus,
  Search 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ChatInterface({ user }) {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Fetch chat rooms on component mount
  useEffect(() => {
    fetchChatRooms();
    // Set up real-time subscription for rooms
    const roomsSubscription = supabase
      .channel('chat_rooms')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chat_rooms' },
        fetchChatRooms
      )
      .subscribe();

    return () => {
      roomsSubscription.unsubscribe();
    };
  }, [user]);

  // Fetch messages when active room changes
  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom.id);
      // Set up real-time subscription for messages
      const messagesSubscription = supabase
        .channel(`messages_${activeRoom.id}`)
        .on('postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'messages',
            filter: `room_id=eq.${activeRoom.id}`
          },
          handleMessageChange
        )
        .subscribe();

      return () => {
        messagesSubscription.unsubscribe();
      };
    }
  }, [activeRoom]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          messages (
            id,
            content,
            created_at,
            sender:profiles!messages_sender_id_fkey (
              full_name
            )
          )
        `)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Get the latest message for each room
      const roomsWithLatestMessage = data.map(room => ({
        ...room,
        latest_message: room.messages?.[room.messages.length - 1] || null,
        messages: undefined // Remove messages array to avoid confusion
      }));

      setRooms(roomsWithLatestMessage);
      
      // Set first room as active if none selected
      if (!activeRoom && roomsWithLatestMessage.length > 0) {
        setActiveRoom(roomsWithLatestMessage[0]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (
            id,
            full_name,
            avatar_url,
            role
          )
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleMessageChange = (payload) => {
    if (payload.eventType === 'INSERT') {
      // Fetch sender details for new message
      fetchMessageWithSender(payload.new.id);
    } else if (payload.eventType === 'UPDATE') {
      setMessages(prev => prev.map(msg => 
        msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
      ));
    } else if (payload.eventType === 'DELETE') {
      setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
    }
  };

  const fetchMessageWithSender = async (messageId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (
            id,
            full_name,
            avatar_url,
            role
          )
        `)
        .eq('id', messageId)
        .single();

      if (error) throw error;
      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error('Error fetching new message:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeRoom || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          room_id: activeRoom.id,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getRoomIcon = (room) => {
    switch (room.type) {
      case 'public': return <Hash className="w-4 h-4" />;
      case 'department': return <Building className="w-4 h-4" />;
      case 'issue': return <MessageCircle className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoomBadgeColor = (room) => {
    switch (room.type) {
      case 'public': return 'bg-blue-100 text-blue-800';
      case 'department': return 'bg-green-100 text-green-800';
      case 'issue': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Sidebar - Chat Rooms */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Chat Rooms</h2>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search rooms..."
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => setActiveRoom(room)}
                className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                  activeRoom?.id === room.id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-gray-600">
                    {getRoomIcon(room)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {room.name}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getRoomBadgeColor(room)}`}
                      >
                        {room.type}
                      </Badge>
                    </div>
                    {room.latest_message && (
                      <p className="text-xs text-gray-500 truncate">
                        {room.latest_message.sender?.full_name}: {room.latest_message.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {getRoomIcon(activeRoom)}
                <div>
                  <h3 className="font-semibold">{activeRoom.name}</h3>
                  <p className="text-sm text-gray-500">
                    {activeRoom.type === 'department' && `Department: ${activeRoom.department}`}
                    {activeRoom.type === 'public' && 'Public chat room'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender_id !== user?.id && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.sender?.avatar_url} />
                        <AvatarFallback>
                          {message.sender?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[70%] ${
                      message.sender_id === user?.id ? 'order-first' : ''
                    }`}>
                      {message.sender_id !== user?.id && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {message.sender?.full_name || 'Unknown User'}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {message.sender?.role}
                          </Badge>
                        </div>
                      )}
                      
                      <div className={`p-3 rounded-lg ${
                        message.sender_id === user?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </p>
                    </div>

                    {message.sender_id === user?.id && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.avatar_url} />
                        <AvatarFallback>
                          {user?.fullName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Select a chat room to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}