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
  Search,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ChatInterface({ user }) {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);

  // Initialize realtime subscriptions
  useEffect(() => {
    if (!user?.id) return;

    initializeChat();

    return () => {
      // Cleanup subscriptions
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      await fetchChatRooms();
      setupRealtimeSubscriptions();
      setLoading(false);
    } catch (error) {
      console.error('Error initializing chat:', error);
      setLoading(false);
    }
  };

  const fetchChatRooms = async () => {
    try {
      // Build query based on user role and permissions
      let query = supabase
        .from('chat_rooms')
        .select(`
          *,
          latest_message:messages(
            id,
            content,
            created_at,
            sender:profiles!messages_sender_id_fkey(full_name)
          )
        `)
        .eq('is_active', true);

      // Filter based on user role
      if (user.role === 'admin') {
        // Admin sees all rooms
      } else if (user.role === 'department_official' && user.department) {
        // Department officials see public and their department rooms
        query = query.or(`type.eq.public,and(type.eq.department,department.eq.${user.department})`);
      } else {
        // Citizens see only public rooms
        query = query.eq('type', 'public');
      }

      const { data, error } = await query
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Process rooms to get the actual latest message
      const processedRooms = data.map(room => {
        const latestMsg = room.latest_message?.[room.latest_message.length - 1];
        return {
          ...room,
          latest_message: latestMsg || null,
        };
      });

      setRooms(processedRooms);

      // Set first room as active if none selected
      if (!activeRoom && processedRooms.length > 0) {
        setActiveRoom(processedRooms[0]);
        await fetchMessages(processedRooms[0].id);
      }

    } catch (error) {
      console.error('Error fetching chat rooms:', error);
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
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Create a single channel for all realtime events
    const channel = supabase
      .channel('chat_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        handleMessageChange
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms'
        },
        handleRoomChange
      )
      .subscribe();

    channelRef.current = channel;
  };

  const handleMessageChange = async (payload) => {
    if (payload.eventType === 'INSERT') {
      const newMessage = payload.new;
      
      // Only add message if it's for the current active room
      if (activeRoom && newMessage.room_id === activeRoom.id) {
        // Fetch the complete message with sender info
        const { data: completeMessage } = await supabase
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
          .eq('id', newMessage.id)
          .single();

        if (completeMessage) {
          setMessages(prev => [...prev, completeMessage]);
        }
      }

      // Update the room's latest message
      setRooms(prev => prev.map(room => 
        room.id === newMessage.room_id 
          ? { ...room, latest_message: newMessage, updated_at: newMessage.created_at }
          : room
      ));

    } else if (payload.eventType === 'UPDATE') {
      setMessages(prev => prev.map(msg => 
        msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
      ));
    } else if (payload.eventType === 'DELETE') {
      setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
    }
  };

  const handleRoomChange = (payload) => {
    if (payload.eventType === 'INSERT') {
      // Check if user has access to this new room
      const newRoom = payload.new;
      const hasAccess = checkRoomAccess(newRoom);
      
      if (hasAccess) {
        setRooms(prev => [{ ...newRoom, latest_message: null }, ...prev]);
      }
    } else if (payload.eventType === 'UPDATE') {
      setRooms(prev => prev.map(room => 
        room.id === payload.new.id ? { ...room, ...payload.new } : room
      ));
    } else if (payload.eventType === 'DELETE') {
      setRooms(prev => prev.filter(room => room.id !== payload.old.id));
    }
  };

  const checkRoomAccess = (room) => {
    if (user.role === 'admin') return true;
    if (room.type === 'public') return true;
    if (room.type === 'department' && user.role === 'department_official' && user.department === room.department) return true;
    return false;
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

      // Also update the room's updated_at timestamp
      await supabase
        .from('chat_rooms')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeRoom.id);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleRoomSelect = async (room) => {
    setActiveRoom(room);
    await fetchMessages(room.id);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getRoomIcon = (room) => {
    switch (room.type) {
      case 'public': return <Hash className="w-4 h-4" />;
      case 'department': return <Building className="w-4 h-4" />;
      case 'issue': return <AlertCircle className="w-4 h-4" />;
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

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
    <div className="flex h-[700px] bg-white rounded-lg shadow-lg overflow-hidden border">
      {/* Sidebar - Chat Rooms */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => handleRoomSelect(room)}
                className={`p-3 rounded-lg cursor-pointer transition-all mb-2 ${
                  activeRoom?.id === room.id 
                    ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`text-gray-600 ${activeRoom?.id === room.id ? 'text-blue-600' : ''}`}>
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
                    {room.latest_message && (
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(room.latest_message.created_at), { addSuffix: true })}
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
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                {getRoomIcon(activeRoom)}
                <div>
                  <h3 className="font-semibold">{activeRoom.name}</h3>
                  <p className="text-sm text-gray-500">
                    {activeRoom.type === 'department' && `Department: ${activeRoom.department}`}
                    {activeRoom.type === 'public' && 'Public chat room'}
                    {activeRoom.type === 'issue' && 'Issue discussion'}
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
                      <Avatar className="w-8 h-8 flex-shrink-0">
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
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={user?.avatar_url} />
                        <AvatarFallback>
                          {user?.full_name?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${activeRoom.name}...`}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-6"
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
              <p className="text-lg font-medium mb-2">Welcome to Chat</p>
              <p>Select a chat room to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}