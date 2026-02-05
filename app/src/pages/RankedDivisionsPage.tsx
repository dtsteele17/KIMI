import { useState } from 'react';
import { useAuthStore } from '@/store';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Shield, Search } from 'lucide-react';

interface RankInfo {
  tier: string;
  division: number;
  entryRp: number;
  relegationRp: number;
  rpRange: string;
  color: string;
}

const ranks: RankInfo[] = [
  // Bronze
  { tier: 'Bronze', division: 4, entryRp: 0, relegationRp: 0, rpRange: '0 - 99', color: 'text-amber-700' },
  { tier: 'Bronze', division: 3, entryRp: 100, relegationRp: 100, rpRange: '100 - 199', color: 'text-amber-700' },
  { tier: 'Bronze', division: 2, entryRp: 200, relegationRp: 200, rpRange: '200 - 299', color: 'text-amber-700' },
  { tier: 'Bronze', division: 1, entryRp: 300, relegationRp: 300, rpRange: '300 - 399', color: 'text-amber-700' },
  // Silver
  { tier: 'Silver', division: 4, entryRp: 400, relegationRp: 400, rpRange: '400 - 499', color: 'text-gray-400' },
  { tier: 'Silver', division: 3, entryRp: 500, relegationRp: 500, rpRange: '500 - 599', color: 'text-gray-400' },
  { tier: 'Silver', division: 2, entryRp: 600, relegationRp: 600, rpRange: '600 - 699', color: 'text-gray-400' },
  { tier: 'Silver', division: 1, entryRp: 700, relegationRp: 700, rpRange: '700 - 799', color: 'text-gray-400' },
  // Gold
  { tier: 'Gold', division: 4, entryRp: 800, relegationRp: 800, rpRange: '800 - 899', color: 'text-yellow-400' },
  { tier: 'Gold', division: 3, entryRp: 900, relegationRp: 900, rpRange: '900 - 999', color: 'text-yellow-400' },
  { tier: 'Gold', division: 2, entryRp: 1000, relegationRp: 1000, rpRange: '1000 - 1099', color: 'text-yellow-400' },
  { tier: 'Gold', division: 1, entryRp: 1100, relegationRp: 1100, rpRange: '1100 - 1199', color: 'text-yellow-400' },
  // Diamond
  { tier: 'Diamond', division: 4, entryRp: 1200, relegationRp: 1200, rpRange: '1200 - 1299', color: 'text-cyan-400' },
  { tier: 'Diamond', division: 3, entryRp: 1300, relegationRp: 1300, rpRange: '1300 - 1399', color: 'text-cyan-400' },
  { tier: 'Diamond', division: 2, entryRp: 1400, relegationRp: 1400, rpRange: '1400 - 1499', color: 'text-cyan-400' },
  { tier: 'Diamond', division: 1, entryRp: 1500, relegationRp: 1500, rpRange: '1500 - 1599', color: 'text-cyan-400' },
  // Champion
  { tier: 'Champion', division: 4, entryRp: 1600, relegationRp: 1600, rpRange: '1600 - 1699', color: 'text-red-400' },
  { tier: 'Champion', division: 3, entryRp: 1700, relegationRp: 1700, rpRange: '1700 - 1799', color: 'text-red-400' },
  { tier: 'Champion', division: 2, entryRp: 1800, relegationRp: 1800, rpRange: '1800 - 1899', color: 'text-red-400' },
  { tier: 'Champion', division: 1, entryRp: 1900, relegationRp: 1900, rpRange: '1900 - 1999', color: 'text-red-400' },
  // Grand Champion
  { tier: 'Grand Champion', division: 4, entryRp: 2000, relegationRp: 2000, rpRange: '2000 - 2099', color: 'text-purple-400' },
  { tier: 'Grand Champion', division: 3, entryRp: 2100, relegationRp: 2100, rpRange: '2100 - 2199', color: 'text-purple-400' },
  { tier: 'Grand Champion', division: 2, entryRp: 2200, relegationRp: 2200, rpRange: '2200 - 2299', color: 'text-purple-400' },
  { tier: 'Grand Champion', division: 1, entryRp: 2300, relegationRp: 2300, rpRange: '2300+', color: 'text-purple-400' },
];

const tierGroups = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Champion', 'Grand Champion'];

export function RankedDivisionsPage() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('All Tiers');
  const [showMyTierOnly, setShowMyTierOnly] = useState(false);

  const currentRank = ranks.find(r => 
    user?.elo && user.elo >= r.entryRp && (r.division === 1 ? true : user.elo < (r.entryRp + 100))
  ) || ranks[0];

  const filteredRanks = ranks.filter(rank => {
    if (showMyTierOnly && rank.tier !== currentRank?.tier) return false;
    if (selectedTier !== 'All Tiers' && rank.tier !== selectedTier) return false;
    if (searchQuery && !`${rank.tier} ${rank.division}`.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const groupedRanks = tierGroups.map(tier => ({
    tier,
    ranks: filteredRanks.filter(r => r.tier === tier),
  })).filter(g => g.ranks.length > 0);

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Navigation currentPage="ranked-divisions" />
      
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Ranked Divisions</h1>
            <p className="text-gray-400">Climb divisions by earning Ranking Points (RP). Promotion and relegation thresholds are shown below.</p>
          </div>

          {/* Current Rank Card */}
          <Card className="bg-[#111827] border-gray-800 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-orange-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Season 2026-01-29</p>
                  <div className="flex items-center gap-3">
                    <h3 className={`text-xl font-bold ${currentRank.color}`}>
                      {currentRank.tier} {currentRank.division}
                    </h3>
                    <span className="px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium">
                      Placements: 0/10
                    </span>
                  </div>
                  <p className="text-orange-400 font-semibold">{user?.elo || 1200} RP</p>
                </div>
              </div>
              <div className="flex gap-8 text-center">
                <div>
                  <p className="text-gray-400 text-sm">Games</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Wins</p>
                  <p className="text-2xl font-bold text-emerald-400">0</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Losses</p>
                  <p className="text-2xl font-bold text-red-400">0</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Filters */}
          <Card className="bg-[#111827] border-gray-800 p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by rank name (e.g., Gold 2)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="py-2 px-4 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option>All Tiers</option>
                {tierGroups.map(tier => (
                  <option key={tier} value={tier}>{tier}</option>
                ))}
              </select>
              <button
                onClick={() => setShowMyTierOnly(!showMyTierOnly)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  showMyTierOnly
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Show My Tier Only
              </button>
            </div>
          </Card>

          {/* Rank List */}
          <div className="space-y-6">
            {groupedRanks.map(({ tier, ranks: tierRanks }) => (
              <div key={tier}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tier === 'Bronze' ? 'bg-amber-700/20' :
                    tier === 'Silver' ? 'bg-gray-400/20' :
                    tier === 'Gold' ? 'bg-yellow-400/20' :
                    tier === 'Diamond' ? 'bg-cyan-400/20' :
                    tier === 'Champion' ? 'bg-red-400/20' :
                    'bg-purple-400/20'
                  }`}>
                    <Shield className={`w-4 h-4 ${
                      tier === 'Bronze' ? 'text-amber-700' :
                      tier === 'Silver' ? 'text-gray-400' :
                      tier === 'Gold' ? 'text-yellow-400' :
                      tier === 'Diamond' ? 'text-cyan-400' :
                      tier === 'Champion' ? 'text-red-400' :
                      'text-purple-400'
                    }`} />
                  </div>
                  <h3 className={`text-lg font-bold ${
                    tier === 'Bronze' ? 'text-amber-700' :
                    tier === 'Silver' ? 'text-gray-400' :
                    tier === 'Gold' ? 'text-yellow-400' :
                    tier === 'Diamond' ? 'text-cyan-400' :
                    tier === 'Champion' ? 'text-red-400' :
                    'text-purple-400'
                  }`}>{tier}</h3>
                </div>

                <Card className="bg-[#111827] border-gray-800 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Division</th>
                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Entry RP</th>
                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Relegation RP</th>
                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">RP Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tierRanks.map((rank) => (
                        <tr 
                          key={`${rank.tier}-${rank.division}`} 
                          className={`border-b border-gray-800 last:border-0 ${
                            currentRank?.tier === rank.tier && currentRank?.division === rank.division
                              ? 'bg-emerald-500/10'
                              : 'hover:bg-gray-800/50'
                          }`}
                        >
                          <td className="py-3 px-4">
                            <span className={`font-semibold ${rank.color}`}>
                              {rank.tier} {rank.division}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white font-semibold">{rank.entryRp}</div>
                            <div className="text-gray-500 text-xs">to enter</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white font-semibold">{rank.relegationRp}</div>
                            <div className="text-gray-500 text-xs">protected</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white font-semibold">{rank.rpRange}</div>
                            <div className="text-gray-500 text-xs">99 RP span</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
