import { create } from 'zustand';
import type { Friend } from '@/types';

interface FriendsState {
  friends: Friend[];
  friendRequests: Friend[];
  addFriend: (username: string) => void;
  removeFriend: (friendId: string) => void;
  acceptRequest: (friendId: string) => void;
  declineRequest: (friendId: string) => void;
}

const mockFriends: Friend[] = [
  {
    id: '2',
    username: 'DanSteele',
    displayName: 'DanSteele',
    isOnline: true,
  },
  {
    id: '3',
    username: 'gabemaier',
    displayName: 'gabemaier',
    isOnline: true,
  },
  {
    id: '4',
    username: 'wellzy',
    displayName: 'wellzy',
    isOnline: true,
  },
  {
    id: '5',
    username: 'Avants',
    displayName: 'Avants',
    isOnline: false,
    lastSeen: '3 days ago',
  },
];

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friends: mockFriends,
  friendRequests: [],

  addFriend: (username) => {
    const newFriend: Friend = {
      id: 'friend-' + Date.now(),
      username: username.toLowerCase(),
      displayName: username,
      isOnline: false,
    };
    set({ friends: [...get().friends, newFriend] });
  },

  removeFriend: (friendId) => {
    set({ friends: get().friends.filter(f => f.id !== friendId) });
  },

  acceptRequest: (friendId) => {
    const request = get().friendRequests.find(f => f.id === friendId);
    if (request) {
      set({
        friends: [...get().friends, request],
        friendRequests: get().friendRequests.filter(f => f.id !== friendId),
      });
    }
  },

  declineRequest: (friendId) => {
    set({ friendRequests: get().friendRequests.filter(f => f.id !== friendId) });
  },
}));
