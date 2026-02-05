import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Share2, Edit3, TrendingUp, Trophy, Target, Percent, Calendar } from 'lucide-react';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, stats } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Navigation currentPage="profile" />
      
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="bg-[#111827] border-gray-800 p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.displayName?.charAt(0) || 'U'}
                </div>
                
                {/* Info */}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-white">{user?.displayName || 'Anonymous Player'}</h2>
                    <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                      —
                    </span>
                  </div>
                  <p className="text-gray-400 mb-2">@{user?.username || 'username'}</p>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>Joined Jan 2026</span>
                  </div>
                  
                  {/* Rank Badge */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/20">
                      <Shield className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-400 text-sm font-medium">Unranked</span>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs">
                      Placements: 0/10
                    </span>
                    <span className="text-orange-400 font-semibold">{user?.elo || 1200} Placement RP</span>
                  </div>
                  
                  {/* Mini Stats */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-800">
                      <Trophy className="w-4 h-4 text-emerald-400" />
                      <span className="text-gray-300 text-sm">0W - 0L</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-800">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300 text-sm">0% WR</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </Card>

          {/* Trust Rating */}
          <Card className="bg-[#111827] border-gray-800 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Trust Rating</h3>
                  <p className="text-gray-400 text-sm">Community reputation score</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
                  —
                </span>
                <span className="text-gray-400 text-sm">No ratings yet</span>
              </div>
            </div>
          </Card>

          {/* Ranked Status */}
          <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-orange-500/20 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Ranked Status</h3>
                  <p className="text-gray-400 text-sm">Season 2026-01-29</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/ranked-divisions')}
                className="text-orange-400 text-sm hover:text-orange-300"
              >
                View Ladder
              </button>
            </div>
            
            {/* Placement Progress */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium">
                  Placement Matches: 0/10
                </span>
                <span className="text-orange-400 font-semibold">{user?.elo || 1200} RP</span>
              </div>
              <p className="text-gray-400 text-sm">Complete 10 more matches to receive your official rank</p>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                <TrendingUp className="w-5 h-5 mx-auto mb-2 text-blue-400" />
                <p className="text-2xl font-bold text-white">{stats.totalMatches}</p>
                <p className="text-gray-400 text-sm">Played</p>
              </div>
              <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                <Trophy className="w-5 h-5 mx-auto mb-2 text-emerald-400" />
                <p className="text-2xl font-bold text-white">{stats.wins}</p>
                <p className="text-gray-400 text-sm">Wins</p>
              </div>
              <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                <Target className="w-5 h-5 mx-auto mb-2 text-red-400" />
                <p className="text-2xl font-bold text-white">{stats.losses}</p>
                <p className="text-gray-400 text-sm">Losses</p>
              </div>
              <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                <Percent className="w-5 h-5 mx-auto mb-2 text-yellow-400" />
                <p className="text-2xl font-bold text-white">{stats.winRate > 0 ? `${stats.winRate.toFixed(0)}%` : '0%'}</p>
                <p className="text-gray-400 text-sm">Win Rate</p>
              </div>
            </div>
          </Card>

          {/* Ranked Section */}
          <Card className="bg-[#111827] border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-orange-400" />
              <h3 className="text-white font-semibold">Ranked</h3>
            </div>
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-500">Complete placement matches to see your rank</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
