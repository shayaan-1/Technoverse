// components/chat/UserSearch.jsx
'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function UserSearch({ onSelectUser }) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setUsers([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectUser = (user) => {
    onSelectUser(user.id);
    setQuery('');
    setShowResults(false);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'department_official': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search users to chat with..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
          onFocus={() => query.length >= 2 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No users found</div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleSelectUser(user)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>
                    {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.full_name || 'Unknown User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                
                <div className="flex flex-col items-end space-y-1">
                  <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </Badge>
                  {user.department && (
                    <span className="text-xs text-gray-500">{user.department}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}