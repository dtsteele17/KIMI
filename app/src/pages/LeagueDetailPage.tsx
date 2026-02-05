import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeagueStore } from '@/store';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Calendar, Trophy, UserPlus, Table, List } from 'lucide-react';

type LeagueTab = 'home' | 'table' | 'fixtures' | 'invite';

export function LeagueDetailPage() {
  const navigate = useNavigate();
  const { currentLeague } = useLeagueStore();
  const [activeTab, setActiveTab] = useState<LeagueTab>('home');

  if (!currentLeague) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No league selected</p>
          <Button onClick={() => navigate('/leagues')} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            Back to Leagues
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'home' as LeagueTab, label: 'Home', icon: Trophy },
    { id: 'table' as LeagueTab, label: 'League Table', icon: Table },
    { id: 'fixtures' as LeagueTab, label: 'Fixtures', icon: List },
    { id: 'invite' as LeagueTab, label: 'Invite Players', icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Navigation currentPage="leagues" />
      
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => navigate('/leagues')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{currentLeague.name}</h1>
              <p className="text-gray-400">{currentLeague.mode} • Best of {currentLeague.legs} • Double Out: {currentLeague.doubleOut}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {activeTab === 'home' && (
            <div className="grid grid-cols-3 gap-6">
              {/* League Info */}
              <Card className="bg-[#111827] border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">League Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Game Days</p>
                      <p className="text-white">{currentLeague.gameDays.join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Participants</p>
                      <p className="text-white">{currentLeague.participants.length} players</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Start Date</p>
                      <p className="text-white">{new Date(currentLeague.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Next Fixtures */}
              <Card className="bg-[#111827] border-gray-800 p-6 col-span-2">
                <h3 className="text-lg font-semibold text-white mb-4">Upcoming Fixtures</h3>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-600 mb-3" />
                  <p className="text-gray-400">No upcoming fixtures scheduled</p>
                  <p className="text-gray-500 text-sm">Fixtures will appear here once the league starts</p>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'table' && (
            <Card className="bg-[#111827] border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">League Table</h3>
              {currentLeague.standings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Table className="w-12 h-12 text-gray-600 mb-3" />
                  <p className="text-gray-400">No standings available yet</p>
                  <p className="text-gray-500 text-sm">The league table will update once matches are played</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 text-sm">Pos</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm">Player</th>
                      <th className="text-center py-3 px-4 text-gray-400 text-sm">P</th>
                      <th className="text-center py-3 px-4 text-gray-400 text-sm">W</th>
                      <th className="text-center py-3 px-4 text-gray-400 text-sm">L</th>
                      <th className="text-center py-3 px-4 text-gray-400 text-sm">LF</th>
                      <th className="text-center py-3 px-4 text-gray-400 text-sm">LA</th>
                      <th className="text-center py-3 px-4 text-gray-400 text-sm">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLeague.standings.map((standing, index) => (
                      <tr key={standing.playerId} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-3 px-4 text-white">{index + 1}</td>
                        <td className="py-3 px-4 text-white">{standing.playerId}</td>
                        <td className="py-3 px-4 text-center text-white">{standing.played}</td>
                        <td className="py-3 px-4 text-center text-emerald-400">{standing.won}</td>
                        <td className="py-3 px-4 text-center text-red-400">{standing.lost}</td>
                        <td className="py-3 px-4 text-center text-white">{standing.legsFor}</td>
                        <td className="py-3 px-4 text-center text-white">{standing.legsAgainst}</td>
                        <td className="py-3 px-4 text-center text-emerald-400 font-bold">{standing.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          )}

          {activeTab === 'fixtures' && (
            <Card className="bg-[#111827] border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">All Fixtures</h3>
              {currentLeague.fixtures.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <List className="w-12 h-12 text-gray-600 mb-3" />
                  <p className="text-gray-400">No fixtures scheduled yet</p>
                  <p className="text-gray-500 text-sm">Fixtures will be generated once all players have joined</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentLeague.fixtures.map(fixture => (
                    <div key={fixture.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400 text-sm">{new Date(fixture.scheduledDate).toLocaleDateString()}</span>
                        <span className="text-white">{fixture.player1Id} vs {fixture.player2Id}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        fixture.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                        fixture.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {fixture.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {activeTab === 'invite' && (
            <Card className="bg-[#111827] border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Invite Players</h3>
              <div className="max-w-md">
                <p className="text-gray-400 mb-4">Invite players to join your league by username or email.</p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter username or email..."
                    className="flex-1 py-3 px-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-emerald-500"
                  />
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
