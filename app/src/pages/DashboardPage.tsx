import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';
import { Trophy, TrendingUp, Flame, Play, Target } from 'lucide-react';

export function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Navigation currentPage="dashboard" />
      
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Welcome back! Here's your overview.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Ranked Points */}
            <Card className="bg-[#111827] border-gray-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-orange-400" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">1200</p>
                  <p className="text-gray-400 text-sm">Ranked Points</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-white font-medium">Placements: 0/10</p>
                <p className="text-gray-400 text-sm">10 matches remaining</p>
              </div>
            </Card>

            {/* Match Record */}
            <Card className="bg-[#111827] border-gray-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">0-0</p>
                  <p className="text-gray-400 text-sm">0% win rate</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-white font-medium">Match Record</p>
                <p className="text-gray-400 text-sm">No matches yet</p>
              </div>
            </Card>

            {/* Win Streak */}
            <Card className="bg-[#111827] border-gray-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-red-400" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">0</p>
                  <p className="text-orange-400 text-sm">Best: 0</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-white font-medium">Win Streak</p>
                <p className="text-gray-400 text-sm">No active streak</p>
              </div>
            </Card>
          </div>

          {/* Middle Section */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Upcoming Matches */}
            <Card className="bg-[#111827] border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Upcoming Matches</h3>
                <button className="text-emerald-400 text-sm hover:text-emerald-300">View All</button>
              </div>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400 mb-2">No upcoming matches</p>
                <p className="text-gray-500 text-sm">Join a league or tournament to schedule matches</p>
              </div>
            </Card>

            {/* Recent Achievements */}
            <Card className="bg-[#111827] border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Recent Achievements</h3>
                <button className="text-emerald-400 text-sm hover:text-emerald-300">View All</button>
              </div>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                  <Trophy className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400 mb-2">No achievements yet</p>
                <p className="text-gray-500 text-sm">Start playing to earn your first achievement</p>
              </div>
            </Card>
          </div>

          {/* Ready to Play */}
          <Card className="bg-gradient-to-r from-emerald-900/50 to-emerald-800/30 border-emerald-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Ready to Play?</h3>
                <p className="text-gray-300 mb-4">Start a new match or join a tournament to compete with others.</p>
                <Button 
                  onClick={() => navigate('/play')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Playing
                </Button>
              </div>
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Target className="w-12 h-12 text-emerald-400" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
