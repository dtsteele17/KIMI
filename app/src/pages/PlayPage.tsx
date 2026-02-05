import { useState } from 'react';
import { useNavigationStore, useGameStore } from '@/store';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Users, GraduationCap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function PlayPage() {
  const { navigateTo } = useNavigationStore();
  const { 
    quickPlaySettings, 
    trainingSettings, 
    setQuickPlaySettings, 
    setTrainingSettings,
    startSearching 
  } = useGameStore();
  
  const [showQuickMatchDialog, setShowQuickMatchDialog] = useState(false);
  const [showPrivateMatchDialog, setShowPrivateMatchDialog] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const legsOptions = [1, 3, 5, 7, 9, 11, 13, 15];
  const botLevels = [25, 35, 45, 55, 65, 75, 85];

  const handleFindRankedMatch = () => {
    setIsSearching(true);
    startSearching('ranked');
    setTimeout(() => {
      navigateTo('game');
    }, 3000);
  };

  const handleQuickMatch = () => {
    setShowQuickMatchDialog(true);
  };

  const startQuickMatch = () => {
    setShowQuickMatchDialog(false);
    setIsSearching(true);
    startSearching('quick');
    setTimeout(() => {
      navigateTo('game');
    }, 3000);
  };

  const handleStartTraining = () => {
    navigateTo('training');
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Navigation currentPage="play" />
      
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Play</h1>
            <p className="text-gray-400">Choose your game mode and start playing.</p>
          </div>

          {/* Game Mode Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Ranked Match */}
            <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-orange-500/20 p-6">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Ranked Match</h3>
              <p className="text-gray-400 mb-6">Compete in ranked matches to climb the leaderboard and prove your skills.</p>
              <Button 
                onClick={handleFindRankedMatch}
                disabled={isSearching}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              >
                {isSearching ? 'Searching...' : 'Find Ranked Match'}
              </Button>
            </Card>

            {/* Quick Match */}
            <Card className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border-emerald-500/20 p-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Quick Match</h3>
              <p className="text-gray-400 mb-6">Jump into a casual match with players worldwide. No rank affected.</p>
              <Button 
                onClick={handleQuickMatch}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
              >
                Quick Match
              </Button>
            </Card>

            {/* Private Match */}
            <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/20 p-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Private Match</h3>
              <p className="text-gray-400 mb-6">Create a private match and invite friends or play locally.</p>
              <Button 
                onClick={() => setShowPrivateMatchDialog(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                Create Private Match
              </Button>
            </Card>
          </div>

          {/* Training Section */}
          <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border-emerald-500/10 p-6 mb-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Training</h3>
                    <p className="text-gray-400 text-sm">Practice vs DartBot or solo drills</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm border border-emerald-500/20">
                    301/501 vs Bot
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm border border-emerald-500/20">
                    Practice Games
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Mode Selection */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Mode</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTrainingSettings({ mode: '301' })}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        trainingSettings.mode === '301'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      301
                    </button>
                    <button
                      onClick={() => setTrainingSettings({ mode: '501' })}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        trainingSettings.mode === '501'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      501
                    </button>
                    <button
                      className="flex-1 py-2 px-4 rounded-lg text-sm font-medium bg-gray-800 text-gray-400 hover:bg-gray-700"
                    >
                      Practice Games
                    </button>
                  </div>
                </div>

                {/* Bot Difficulty & Best Of */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Bot Difficulty</label>
                    <select
                      value={trainingSettings.botLevel}
                      onChange={(e) => setTrainingSettings({ botLevel: parseInt(e.target.value) as any })}
                      className="w-full py-2 px-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-emerald-500"
                    >
                      {botLevels.map((level) => (
                        <option key={level} value={level}>
                          {level === 25 ? 'Beginner' : level === 35 ? 'Easy' : level === 45 ? 'Novice' : level === 55 ? 'Intermediate' : level === 65 ? 'Advanced' : level === 75 ? 'Expert' : 'Master'} ({level})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Best Of</label>
                    <select
                      value={trainingSettings.legs}
                      onChange={(e) => setTrainingSettings({ legs: parseInt(e.target.value) as any })}
                      className="w-full py-2 px-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-emerald-500"
                    >
                      {legsOptions.map((legs) => (
                        <option key={legs} value={legs}>Best of {legs}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Double Out Toggle */}
                <button
                  onClick={() => setTrainingSettings({ doubleOut: trainingSettings.doubleOut === 'on' ? 'off' : 'on' })}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    trainingSettings.doubleOut === 'on'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Double Out: {trainingSettings.doubleOut === 'on' ? 'ON' : 'OFF'}
                </button>

                <Button 
                  onClick={handleStartTraining}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Start Training
                </Button>
              </div>
            </div>
          </Card>

          {/* Last 3 Games */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Last 3 Games</h3>
            <Card className="bg-[#111827] border-gray-800 p-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-gray-500">No recent games</p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Quick Match Dialog */}
      <Dialog open={showQuickMatchDialog} onOpenChange={setShowQuickMatchDialog}>
        <DialogContent className="bg-[#111827] border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Quick Match Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Game Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setQuickPlaySettings({ mode: '301' })}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    quickPlaySettings.mode === '301'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  301
                </button>
                <button
                  onClick={() => setQuickPlaySettings({ mode: '501' })}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    quickPlaySettings.mode === '501'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  501
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Best Of</label>
              <select
                value={quickPlaySettings.legs}
                onChange={(e) => setQuickPlaySettings({ legs: parseInt(e.target.value) as any })}
                className="w-full py-2 px-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-emerald-500"
              >
                {legsOptions.map((legs) => (
                  <option key={legs} value={legs}>Best of {legs}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Double Out</label>
              <button
                onClick={() => setQuickPlaySettings({ doubleOut: quickPlaySettings.doubleOut === 'on' ? 'off' : 'on' })}
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  quickPlaySettings.doubleOut === 'on'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {quickPlaySettings.doubleOut === 'on' ? 'ON' : 'OFF'}
              </button>
            </div>
            <Button 
              onClick={startQuickMatch}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Find Match
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Private Match Dialog */}
      <Dialog open={showPrivateMatchDialog} onOpenChange={setShowPrivateMatchDialog}>
        <DialogContent className="bg-[#111827] border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create Private Match</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Game Mode</label>
              <div className="flex gap-2">
                <button className="flex-1 py-2 px-4 rounded-lg text-sm font-medium bg-emerald-500 text-white">
                  301
                </button>
                <button className="flex-1 py-2 px-4 rounded-lg text-sm font-medium bg-gray-800 text-gray-400 hover:bg-gray-700">
                  501
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Best Of</label>
              <select className="w-full py-2 px-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-emerald-500">
                {legsOptions.map((legs) => (
                  <option key={legs} value={legs}>Best of {legs}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Invite Player</label>
              <input
                type="text"
                placeholder="Enter username..."
                className="w-full py-2 px-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <Button 
              onClick={() => {
                setShowPrivateMatchDialog(false);
                navigateTo('game');
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              Create Lobby
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
