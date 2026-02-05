import { useAuthStore } from '@/store';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Target, TrendingUp, Activity } from 'lucide-react';

export function StatsPage() {
  const { stats } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Navigation currentPage="stats" />
      
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Stats</h1>
              <p className="text-gray-400">Track your performance and progress.</p>
            </div>
            <div className="flex gap-4">
              <select className="py-2 px-4 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500">
                <option>All Modes</option>
                <option>301</option>
                <option>501</option>
                <option>Ranked</option>
                <option>Casual</option>
              </select>
              <select className="py-2 px-4 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500">
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
                <option>Last 90 Days</option>
                <option>All Time</option>
              </select>
            </div>
          </div>

          {/* Main Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Avg Score */}
            <Card className="bg-[#111827] border-gray-800 p-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-gray-400 text-sm mb-1">Avg Score</p>
              <p className="text-3xl font-bold text-white mb-1">
                {stats.avgScore > 0 ? stats.avgScore.toFixed(1) : '—'}
              </p>
              <p className="text-gray-500 text-sm">Weighted average</p>
            </Card>

            {/* Win Rate */}
            <Card className="bg-[#111827] border-gray-800 p-6">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
              <p className="text-gray-400 text-sm mb-1">Win Rate</p>
              <p className="text-3xl font-bold text-white mb-1">
                {stats.winRate > 0 ? `${stats.winRate.toFixed(0)}%` : '0%'}
              </p>
              <p className="text-gray-500 text-sm">{stats.wins}-{stats.losses} record</p>
            </Card>

            {/* Matches */}
            <Card className="bg-[#111827] border-gray-800 p-6">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-gray-400 text-sm mb-1">Matches</p>
              <p className="text-3xl font-bold text-white mb-1">{stats.totalMatches}</p>
              <p className="text-gray-500 text-sm">Selected period</p>
            </Card>
          </div>

          {/* Performance Overview */}
          <Card className="bg-[#111827] border-gray-800 p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-6">Performance Overview</h3>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-gray-500">No data available for this period</p>
            </div>
          </Card>

          {/* Bottom Section */}
          <div className="grid grid-cols-2 gap-6">
            {/* Detailed Stats */}
            <Card className="bg-[#111827] border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Detailed Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400">Total Matches</span>
                  <span className="text-white font-semibold">{stats.totalMatches}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400">Wins</span>
                  <span className="text-emerald-400 font-semibold">{stats.wins}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400">Losses</span>
                  <span className="text-red-400 font-semibold">{stats.losses}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400">Darts Thrown</span>
                  <span className="text-white font-semibold">{stats.dartsThrown}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400">Checkout %</span>
                  <span className="text-white font-semibold">{stats.checkoutPercentage > 0 ? `${stats.checkoutPercentage.toFixed(1)}%` : '—'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400">Highest Checkout</span>
                  <span className="text-white font-semibold">{stats.highestCheckout > 0 ? stats.highestCheckout : '—'}</span>
                </div>
              </div>
            </Card>

            {/* Recent Matches */}
            <Card className="bg-[#111827] border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Recent Matches</h3>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-gray-500">No recent matches</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
