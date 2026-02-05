import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Target, Users, Trophy } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleJoinNow = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FIVE01</span>
        </div>
        <div className="flex items-center gap-8">
          <button className="text-gray-300 hover:text-white transition-colors">Home</button>
          <button className="text-gray-300 hover:text-white transition-colors">How It Works</button>
          <button className="text-gray-300 hover:text-white transition-colors">Features</button>
          <button className="text-gray-300 hover:text-white transition-colors">Pricing</button>
          <button className="text-gray-300 hover:text-white transition-colors">FAQ</button>
          <button className="text-gray-300 hover:text-white transition-colors">Contact</button>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="text-white hover:text-emerald-400 transition-colors"
          >
            Log In
          </button>
          <Button 
            onClick={handleJoinNow}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            Join League
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="px-8 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-400 text-sm font-medium">SEASON LIVE</span>
            </div>
            
            <h1 className="text-6xl font-bold text-white leading-tight">
              FIVE01<br />
              <span className="text-emerald-400">Online Darts League</span>
            </h1>
            
            <p className="text-xl text-gray-400">
              Compete in weekly matches, track stats, earn rankings, and win prizes — all online.
            </p>
            
            <div className="flex gap-4">
              <Button 
                onClick={handleJoinNow}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 text-lg"
              >
                Join Now
              </Button>
              <Button 
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800 px-8 py-6 text-lg"
              >
                Watch How It Works
              </Button>
            </div>
          </div>

          {/* Right Column - Stats Card */}
          <div className="space-y-6">
            <Card className="bg-[#111827] border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-400 text-sm">Player Rating</p>
                  <p className="text-4xl font-bold text-white">1847</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-emerald-500/10 rounded-lg p-4">
                  <p className="text-emerald-400 text-sm">Wins</p>
                  <p className="text-2xl font-bold text-white">24</p>
                </div>
                <div className="bg-red-500/10 rounded-lg p-4">
                  <p className="text-red-400 text-sm">Losses</p>
                  <p className="text-2xl font-bold text-white">8</p>
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                <p className="text-gray-400 text-sm">Current Division</p>
                <p className="text-emerald-400 font-semibold">Elite Division</p>
              </div>
              
              <div className="bg-emerald-500/10 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Next Match</p>
                  <p className="text-white font-semibold">2d 14h 32m</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Target className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Game Mode Cards */}
      <div className="px-8 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/20 p-6 card-hover cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Play Local</h3>
            <p className="text-gray-400">Create leagues with friends at home or your local venue.</p>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 p-6 card-hover cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Play Online</h3>
            <p className="text-gray-400">Find opponents worldwide and play ranked matches.</p>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/20 p-6 card-hover cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Online Tournaments</h3>
            <p className="text-gray-400">Join weekly tournaments and seasonal finals.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
