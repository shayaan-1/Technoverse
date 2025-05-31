// components/chat/ChatList.jsx
"use client";

import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function ChatList({
  chats,
  selectedChatId,
  onSelectChat,
  loading,
  currentUserId,
}) {
  if (loading) {
    return (
      <div className="p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3 mb-2">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No conversations yet</p>
        <p className="text-sm">Search for users above to start chatting</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {chats.map((chat) => (
        <div
          key={chat.id}
          className={cn(
            "flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors",
            selectedChatId === chat.id &&
              "bg-blue-50 border-r-2 border-blue-500"
          )}
          onClick={() => onSelectChat(chat.id)}
        >
          <Avatar>
            <AvatarImage src={chat.otherUser.avatar_url} />
            <AvatarFallback>
              {chat.otherUser.full_name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900 truncate">
                {chat.otherUser.full_name || "Unknown User"}
              </p>
              {chat.latestMessage && (
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(
                    new Date(chat.latestMessage.created_at),
                    { addSuffix: true }
                  )}
                </p>
              )}
            </div>

            {chat.latestMessage && (
              <p className="text-sm text-gray-600 truncate">
                {chat.latestMessage.sender_id === currentUserId ? "You: " : ""}
                {chat.latestMessage.content}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
