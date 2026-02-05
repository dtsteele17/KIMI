import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournamentStore } from '@/store';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Calendar, UserPlus, Settings, Swords } from 'lucide-react';

type TournamentTab = 'players' | 'bracket' | 'invite' | 'settings';

export function TournamentDetailPage() {
  const navigate = useNavigate();
  const { currentTournament } = useTournamentStore();
  const [activeTab, setActiveTab] = useState<TournamentTab>('players');

  if (!currentTournament) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No tournament selected</p>
          <Button onClick={() => navigate('/tournaments')} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            Back to Tournaments
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'players' as TournamentTab, label: 'Players', icon: Users },
    { id: 'bracket' as TournamentTab, label: 'Bracket', icon: Swords },
    { id: 'invite' as TournamentTab, label: 'Invite', icon: UserPlus },
    { id: 'settings' as TournamentTab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Navigation currentPage="tournaments" />
      
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => navigate('/tournaments')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{currentTournament.name}</h1>
              <p className="text-gray-400">{currentTournament.mode} • Best of {currentTournament.legs} • {currentTournament.maxParticipants} players max</p>
            </div>
          </div>

          {/* Tournament Info Bar */}
          <Card className="bg-[#111827] border-gray-800 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  <span className="text-gray-400">{new Date(currentTournament.startDate).toLocaleDateString()}</span>
                  <span className="text-gray-400">at {currentTournament.startTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span className="text-white">{currentTournament.participants.length}/{currentTournament.maxParticipants} players</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentTournament.status === 'open' ? 'bg-emerald-500/20 text-emerald-400' :
                currentTournament.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                currentTournament.status === 'completed' ? 'bg-gray-700 text-gray-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {currentTournament.status === 'open' ? 'Registration Open' :
                 currentTournament.status === 'in_progress' ? 'In Progress' :
                 currentTournament.status === 'completed' ? 'Completed' : 'Closed'}
              </span>
            </div>
          </Card>

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
          {activeTab === 'players' && (
            <Card className="bg-[#111827] border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Registered Players</h3>
              {currentTournament.participants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="w-12 h-12 text-gray-600 mb-3" />
                  <p className="text-gray-400">No players registered yet</p>
                  <p className="text-gray-500 text-sm">Players will appear here once they register</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {currentTournament.participants.map((playerId, index) => (
                    <div key={playerId} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-white">Player {playerId}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Registration Progress</span>
                  <span className="text-emerald-400 text-sm">{currentTournament.participants.length}/{currentTournament.maxParticipants}</span>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${(currentTournament.participants.length / currentTournament.maxParticipants) * 100}%` }}
                  />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'bracket' && (
            <Card className="bg-[#111827] border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Tournament Bracket</h3>
              {currentTournament.bracket.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Swords className="w-12 h-12 text-gray-600 mb-3" />
                  <p className="text-gray-400">Bracket not generated yet</p>
                  <p className="text-gray-500 text-sm">The bracket will be created when registration closes</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Round 1 */}
                  <div>
                    <h4 className="text-gray-400 text-sm mb-3">Round 1</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {currentTournament.bracket.filter(m => m.round === 1).map(match => (
                        <div key={match.id} className="p-4 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-white">{match.player1Id || 'TBD'}</span>
                            <span className="text-gray-500">vs</span>
                            <span className="text-white">{match.player2Id || 'TBD'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'invite' && (
            <Card className="bg-[#111827] border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Invite Players</h3>
              <div className="max-w-md">
                <p className="text-gray-400 mb-4">Invite players to join this tournament by username or email.</p>
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

          {activeTab === 'settings' && (
            <Card className="bg-[#111827] border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Tournament Settings</h3>
              <div className="grid grid-cols-2 gap-6 max-w-2xl">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Game Mode</label>
                  <p className="text-white">{currentTournament.mode}</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Legs per Match</label>
                  <p className="text-white">Best of {currentTournament.legs}</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Double Out</label>
                  <p className="text-white">{currentTournament.doubleOut === 'on' ? 'Enabled' : 'Disabled'}</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Entry Type</label>
                  <p className="text-white">{currentTournament.isPrivate ? 'Invite Only' : 'Open'}</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Max Participants</label>
                  <p className="text-white">{currentTournament.maxParticipants}</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Start Time</label>
                  <p className="text-white">{currentTournament.startTime}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
