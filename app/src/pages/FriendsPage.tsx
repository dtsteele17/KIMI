import { useState } from 'react';
import { useFriendsStore } from '@/store';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, UserPlus, Check, X } from 'lucide-react';

export function FriendsPage() {
  const { friends, friendRequests, addFriend, removeFriend, acceptRequest, declineRequest } = useFriendsStore();
  const [activeTab, setActiveTab] = useState<'friends' | 'add' | 'requests'>('friends');
  const [newFriendUsername, setNewFriendUsername] = useState('');

  const handleAddFriend = () => {
    if (newFriendUsername.trim()) {
      addFriend(newFriendUsername);
      setNewFriendUsername('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Navigation currentPage="friends" />
      
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Friends</h1>
            <p className="text-gray-400">Connect with other players</p>
          </div>

          {/* Tabs */}
          <Card className="bg-[#111827] border-gray-800 overflow-hidden">
            <div className="flex border-b border-gray-800">
              <button
                onClick={() => setActiveTab('friends')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
                  activeTab === 'friends'
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                Friends ({friends.length})
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
                  activeTab === 'add'
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                Add Friend
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
                  activeTab === 'requests'
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                Requests ({friendRequests.length})
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'friends' && (
                <div className="space-y-3">
                  {friends.map(friend => (
                    <div 
                      key={friend.id}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                            {friend.displayName.charAt(0).toUpperCase()}
                          </div>
                          {friend.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{friend.displayName}</span>
                            <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
                              —
                            </span>
                          </div>
                          <span className={`text-xs ${friend.isOnline ? 'text-emerald-400' : 'text-gray-500'}`}>
                            {friend.isOnline ? 'Online' : `Offline ${friend.lastSeen ? `• ${friend.lastSeen}` : ''}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                          <MessageCircle className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => removeFriend(friend.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'add' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Username</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newFriendUsername}
                        onChange={(e) => setNewFriendUsername(e.target.value)}
                        placeholder="Enter username..."
                        className="flex-1 py-2 px-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-emerald-500"
                      />
                      <Button 
                        onClick={handleAddFriend}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Friend
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-center py-8">
                    <p className="text-gray-500">Enter a username to send a friend request</p>
                  </div>
                </div>
              )}

              {activeTab === 'requests' && (
                <div className="space-y-3">
                  {friendRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No pending friend requests</p>
                    </div>
                  ) : (
                    friendRequests.map(request => (
                      <div 
                        key={request.id}
                        className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                            {request.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-white font-semibold">{request.displayName}</span>
                            <p className="text-gray-400 text-sm">Wants to be your friend</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => acceptRequest(request.id)}
                            className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => declineRequest(request.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
