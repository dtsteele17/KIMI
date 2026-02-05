import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeagueStore } from '@/store';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trophy, Lock, Globe } from 'lucide-react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const legsOptions = [1, 3, 5, 7, 9, 11, 13, 15];

export function LeaguesPage() {
  const navigate = useNavigate();
  const { leagues, userLeagues, createLeague, setCurrentLeague } = useLeagueStore();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Create league form state
  const [leagueName, setLeagueName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(16);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday']);
  const [startDate, setStartDate] = useState('');
  const [gameMode, setGameMode] = useState<'301' | '501'>('501');
  const [legs, setLegs] = useState(3);
  const [doubleOut, setDoubleOut] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreateLeague = () => {
    createLeague({
      name: leagueName,
      gameDays: selectedDays,
      startDate: startDate || new Date().toISOString(),
      mode: gameMode,
      legs: legs as 1 | 3 | 5 | 7 | 9 | 11 | 13 | 15,
      doubleOut: doubleOut ? 'on' : 'off',
      isPrivate,
    });
    setShowCreateDialog(false);
    // Reset form
    setLeagueName('');
    setSelectedDays(['Monday']);
    setStartDate('');
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleLeagueClick = (league: typeof leagues[0]) => {
    setCurrentLeague(league);
    navigate(`/league/${league.id}`);
  };

  const userLeaguesList = leagues.filter(l => userLeagues.includes(l.id));

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Navigation currentPage="leagues" />
      
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Leagues</h1>
              <p className="text-gray-400">Join or create leagues and compete with others.</p>
            </div>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create League
            </Button>
          </div>

          {/* Your Leagues */}
          <Card className="bg-[#111827] border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Your Leagues</h3>
            
            {userLeaguesList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                  <Trophy className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400 mb-2">You haven't joined any leagues yet</p>
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white mt-4"
                >
                  Create Your First League
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userLeaguesList.map(league => (
                  <div 
                    key={league.id}
                    onClick={() => handleLeagueClick(league)}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <div>
                      <h4 className="text-white font-semibold">{league.name}</h4>
                      <p className="text-gray-400 text-sm">{league.mode} • Best of {league.legs}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400 text-sm">{league.participants.length} players</span>
                      {league.isPrivate && <Lock className="w-4 h-4 text-gray-500" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Create League Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#111827] border-gray-800 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create League</DialogTitle>
            <p className="text-gray-400 text-sm">Configure your season settings</p>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* League Name */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">League Name *</label>
              <input
                type="text"
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
                placeholder="Enter league name..."
                className="w-full py-2 px-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Max Participants */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Max Participants</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="4"
                  max="32"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-white font-semibold w-8">{maxParticipants}</span>
              </div>
            </div>

            {/* Access Type */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Access Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setIsPrivate(false)}
                  className={`p-4 rounded-lg border transition-all ${
                    !isPrivate
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <Globe className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
                  <p className="text-white font-medium">Open</p>
                  <p className="text-gray-400 text-sm">Anyone can join</p>
                </button>
                <button
                  onClick={() => setIsPrivate(true)}
                  className={`p-4 rounded-lg border transition-all ${
                    isPrivate
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <Lock className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
                  <p className="text-white font-medium">Invite Only</p>
                  <p className="text-gray-400 text-sm">Requires invitation</p>
                </button>
              </div>
            </div>

            {/* Game Days */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Game Days</label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedDays.includes(day)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full py-2 px-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Game Mode */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Game Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setGameMode('301')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    gameMode === '301'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  301
                </button>
                <button
                  onClick={() => setGameMode('501')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    gameMode === '501'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  501
                </button>
              </div>
            </div>

            {/* Legs */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Legs per Match</label>
              <select
                value={legs}
                onChange={(e) => setLegs(parseInt(e.target.value))}
                className="w-full py-2 px-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-emerald-500"
              >
                {legsOptions.map(l => (
                  <option key={l} value={l}>Best of {l}</option>
                ))}
              </select>
            </div>

            {/* Double Out */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Double Out</label>
              <button
                onClick={() => setDoubleOut(!doubleOut)}
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  doubleOut
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {doubleOut ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="flex-1 border-gray-700 text-white hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateLeague}
                disabled={!leagueName}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Create League
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
