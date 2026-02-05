import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournamentStore } from '@/store';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Calendar, Clock, Users, Lock, Globe } from 'lucide-react';

const legsOptions = [1, 3, 5, 7, 9, 11, 13, 15];
const participantOptions = [4, 8, 16, 32];

export function TournamentsPage() {
  const navigate = useNavigate();
  const { tournaments, joinTournament, setCurrentTournament } = useTournamentStore();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sizeFilter, setSizeFilter] = useState('All Sizes');

  // Create tournament form state
  const [tournamentName, setTournamentName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [maxParticipants, setMaxParticipants] = useState(16);
  const [roundScheduling, setRoundScheduling] = useState<'one-day' | 'multi-day'>('one-day');
  const [entryType, setEntryType] = useState<'open' | 'invite'>('open');
  const [legs, setLegs] = useState(5);
  const [description, setDescription] = useState('');

  const handleCreateTournament = () => {
    // In a real app, this would create the tournament
    setShowCreateDialog(false);
    // Reset form
    setTournamentName('');
    setStartDate('');
    setStartTime('18:00');
    setMaxParticipants(16);
    setDescription('');
  };

  const handleTournamentClick = (tournament: typeof tournaments[0]) => {
    setCurrentTournament(tournament);
    navigate(`/tournament/${tournament.id}`);
  };

  const filteredTournaments = tournaments.filter(t => {
    if (statusFilter !== 'All Status' && t.status !== statusFilter.toLowerCase()) return false;
    if (sizeFilter !== 'All Sizes') {
      const size = parseInt(sizeFilter);
      if (t.maxParticipants !== size) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Navigation currentPage="tournaments" />
      
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Tournaments</h1>
              <p className="text-gray-400">Compete in tournaments and win prizes.</p>
            </div>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Tournament
            </Button>
          </div>

          {/* Filters */}
          <Card className="bg-[#111827] border-gray-800 p-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search tournaments..."
                  className="w-full py-2 pl-10 pr-4 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 px-4 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option>All Status</option>
                <option>Open</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="py-2 px-4 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option>All Sizes</option>
                <option>4</option>
                <option>8</option>
                <option>16</option>
                <option>32</option>
              </select>
            </div>
          </Card>

          {/* Tournaments Grid */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Tournaments</h3>
            <p className="text-gray-400 text-sm mb-6">Browse and join active tournaments.</p>
            
            <div className="grid grid-cols-3 gap-6">
              {filteredTournaments.map(tournament => (
                <Card 
                  key={tournament.id} 
                  onClick={() => handleTournamentClick(tournament)}
                  className="bg-[#111827] border-gray-800 p-6 cursor-pointer hover:border-emerald-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-white font-semibold">{tournament.name}</h4>
                    {tournament.creatorId === 'admin' && (
                      <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                        Official
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{tournament.startTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{tournament.participants.length}/{tournament.maxParticipants} players</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-gray-700 rounded-full mb-4 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(tournament.participants.length / tournament.maxParticipants) * 100}%` }}
                    />
                  </div>

                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      joinTournament(tournament.id);
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    Register Now
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Tournament Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#111827] border-gray-800 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create Tournament</DialogTitle>
            <p className="text-gray-400 text-sm">Set your format and schedule.</p>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Tournament Name */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Tournament Name *</label>
              <input
                type="text"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                placeholder="Enter tournament name"
                className="w-full py-2 px-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Start Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Start Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full py-2 pl-10 pr-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Start Time *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full py-2 pl-10 pr-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Max Participants */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Max Participants *</label>
              <select
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                className="w-full py-2 px-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-emerald-500"
              >
                {participantOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <p className="text-gray-500 text-xs mt-1">Bracket size must match max participants.</p>
            </div>

            {/* Round Scheduling */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Round Scheduling</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setRoundScheduling('one-day')}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    roundScheduling === 'one-day'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  One Day
                </button>
                <button
                  onClick={() => setRoundScheduling('multi-day')}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    roundScheduling === 'multi-day'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Multi-Day
                </button>
              </div>
            </div>

            {/* Entry Type */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Entry Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setEntryType('open')}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    entryType === 'open'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <Globe className="w-4 h-4 mx-auto mb-1" />
                  Open
                </button>
                <button
                  onClick={() => setEntryType('invite')}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    entryType === 'invite'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <Lock className="w-4 h-4 mx-auto mb-1" />
                  Invite Only
                </button>
              </div>
            </div>

            {/* Legs per Match */}
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

            {/* Description */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your tournament..."
                rows={3}
                className="w-full py-2 px-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-emerald-500 resize-none"
              />
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
                onClick={handleCreateTournament}
                disabled={!tournamentName || !startDate}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Create Tournament
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
