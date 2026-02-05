import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Target, Bot, Check, Trophy } from 'lucide-react';

// DartBot AI - generates realistic scores based on difficulty level
class DartBot {
  level: number;
  
  constructor(level: number) {
    this.level = level;
  }

  // Generate a score for a single dart throw
  private throwDart(): number {
    const baseAccuracy = this.level / 100;
    const variance = (Math.random() - 0.5) * 0.3;
    const accuracy = Math.max(0.1, Math.min(0.95, baseAccuracy + variance));
    
    const targets = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    const targetIndex = Math.floor(Math.random() * targets.length * (1 - accuracy));
    const targetNumber = targets[Math.min(targetIndex, targets.length - 1)];
    
    const rand = Math.random();
    let multiplier = 1;
    if (rand < accuracy * 0.3) {
      multiplier = 3;
    } else if (rand < accuracy * 0.6) {
      multiplier = 2;
    }
    
    if (Math.random() < 0.05 * this.level / 50) {
      return Math.random() < 0.7 ? 25 : 50;
    }
    
    return targetNumber * multiplier;
  }

  // Generate a full visit (3 darts)
  generateVisit(remainingScore: number): { darts: number[]; total: number; remaining: number } {
    const darts: number[] = [];
    let total = 0;
    
    for (let i = 0; i < 3; i++) {
      if (remainingScore - total <= 170 && remainingScore - total > 0) {
        const checkout = this.attemptCheckout(remainingScore - total);
        if (checkout > 0) {
          darts.push(checkout);
          total += checkout;
          break;
        }
      }
      
      const score = this.throwDart();
      const newTotal = total + score;
      
      if (remainingScore - newTotal < 0 || remainingScore - newTotal === 1) {
        break;
      }
      
      darts.push(score);
      total += score;
      
      if (remainingScore - total === 0) {
        break;
      }
    }
    
    return {
      darts,
      total,
      remaining: remainingScore - total
    };
  }

  // Attempt a checkout when close to finishing
  private attemptCheckout(remaining: number): number {
    const checkoutChance = this.level / 100;
    if (Math.random() > checkoutChance) {
      return 0;
    }
    
    if (remaining <= 40 && remaining % 2 === 0) {
      return remaining;
    }
    
    if (remaining === 50) return 50;
    if (remaining === 25) return 25;
    
    if (remaining <= 120) {
      const treble = Math.floor(remaining / 3);
      if (treble >= 1 && treble <= 20 && remaining - treble * 3 <= 40 && (remaining - treble * 3) % 2 === 0) {
        return treble * 3;
      }
    }
    
    return 0;
  }
}

export function TrainingPage() {
  const navigate = useNavigate();
  const { trainingSettings } = useGameStore();
  
  const [playerScore, setPlayerScore] = useState(parseInt(trainingSettings.mode));
  const [botScore, setBotScore] = useState(parseInt(trainingSettings.mode));
  const [playerLegs, setPlayerLegs] = useState(0);
  const [botLegs, setBotLegs] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [currentVisit, setCurrentVisit] = useState<number[]>([]);
  const [playerDartsThrown, setPlayerDartsThrown] = useState(0);
  const [botDartsThrown, setBotDartsThrown] = useState(0);
  const [playerTotalScore, setPlayerTotalScore] = useState(0);
  const [botTotalScore, setBotTotalScore] = useState(0);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [winner, setWinner] = useState<'player' | 'bot' | null>(null);
  const [botThinking, setBotThinking] = useState(false);
  
  const dartBot = new DartBot(trainingSettings.botLevel);
  const startingScore = parseInt(trainingSettings.mode);
  const legsNeeded = Math.ceil(trainingSettings.legs / 2);

  // Calculate averages
  const playerAvg = playerDartsThrown > 0 ? (playerTotalScore / (playerDartsThrown / 3)).toFixed(1) : '0.0';
  const botAvg = botDartsThrown > 0 ? (botTotalScore / (botDartsThrown / 3)).toFixed(1) : '0.0';

  // Bot turn
  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      setBotThinking(true);
      const timer = setTimeout(() => {
        const visit = dartBot.generateVisit(botScore);
        setBotScore(visit.remaining);
        setBotDartsThrown(prev => prev + visit.darts.length);
        setBotTotalScore(prev => prev + visit.total);
        
        if (visit.remaining === 0) {
          const newBotLegs = botLegs + 1;
          setBotLegs(newBotLegs);
          
          if (newBotLegs >= legsNeeded) {
            setWinner('bot');
            setShowResultDialog(true);
          } else {
            setPlayerScore(startingScore);
            setBotScore(startingScore);
            setCurrentVisit([]);
          }
        }
        
        setBotThinking(false);
        setIsPlayerTurn(true);
      }, 1500 + Math.random() * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, botScore, botLegs, winner, legsNeeded, startingScore, dartBot]);

  const handleNumberClick = (num: number) => {
    if (!isPlayerTurn || currentVisit.length >= 3) return;
    
    const newVisit = [...currentVisit, num];
    setCurrentVisit(newVisit);
  };

  const handleSubmitVisit = () => {
    if (currentVisit.length === 0) return;
    
    const total = currentVisit.reduce((a, b) => a + b, 0);
    const newScore = playerScore - total;
    
    // Check for bust
    if (newScore < 0 || newScore === 1) {
      setPlayerDartsThrown(prev => prev + currentVisit.length);
      setCurrentVisit([]);
      setIsPlayerTurn(false);
      return;
    }
    
    setPlayerScore(newScore);
    setPlayerDartsThrown(prev => prev + currentVisit.length);
    setPlayerTotalScore(prev => prev + total);
    
    if (newScore === 0) {
      const newPlayerLegs = playerLegs + 1;
      setPlayerLegs(newPlayerLegs);
      
      if (newPlayerLegs >= legsNeeded) {
        setWinner('player');
        setShowResultDialog(true);
      } else {
        setPlayerScore(startingScore);
        setBotScore(startingScore);
        setCurrentVisit([]);
      }
    }
    
    setCurrentVisit([]);
    setIsPlayerTurn(false);
  };

  const handleClear = () => {
    setCurrentVisit([]);
  };

  const handleBust = () => {
    setPlayerDartsThrown(prev => prev + currentVisit.length);
    setCurrentVisit([]);
    setIsPlayerTurn(false);
  };

  const handleEndTraining = () => {
    navigate('/play');
  };

  const handlePlayAgain = () => {
    setPlayerScore(startingScore);
    setBotScore(startingScore);
    setPlayerLegs(0);
    setBotLegs(0);
    setPlayerDartsThrown(0);
    setBotDartsThrown(0);
    setPlayerTotalScore(0);
    setBotTotalScore(0);
    setCurrentVisit([]);
    setWinner(null);
    setShowResultDialog(false);
    setIsPlayerTurn(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0d1117] border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold">FIVE01</span>
          </div>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium">
            TRAINING
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-sm">
            Best of {trainingSettings.legs}
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-sm">
            Double Out: {trainingSettings.doubleOut === 'on' ? 'ON' : 'OFF'}
          </span>
        </div>
        
        <Button 
          onClick={handleEndTraining}
          variant="outline"
          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
        >
          End Training
        </Button>
      </div>

      {/* Main Game Area */}
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {/* Scoreboard */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Match Score */}
            <Card className="bg-[#111827] border-gray-800 p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm">Match Score</span>
                <span className="text-gray-400 text-sm">Leg {playerLegs + botLegs + 1}</span>
              </div>
              <div className="flex items-center justify-center gap-8 mb-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-white">{playerLegs}</p>
                  <p className="text-gray-400 text-sm">You</p>
                </div>
                <span className="text-2xl text-gray-500">-</span>
                <div className="text-center">
                  <p className="text-4xl font-bold text-white">{botLegs}</p>
                  <p className="text-gray-400 text-sm">Bot</p>
                </div>
              </div>
              <div className={`text-center py-2 rounded-lg ${isPlayerTurn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
                {isPlayerTurn ? 'Your Turn' : botThinking ? 'DartBot is thinking...' : "DartBot's Turn"}
              </div>
            </Card>

            {/* Player Score */}
            <Card className={`bg-[#111827] border-2 ${isPlayerTurn ? 'border-emerald-500' : 'border-gray-800'} p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                  Y
                </div>
                <span className="text-white font-medium">You</span>
                <span className="text-gray-400 text-sm">Legs: {playerLegs}</span>
              </div>
              <div className="text-center py-4">
                <p className="text-6xl font-bold text-white">{playerScore}</p>
                <p className="text-gray-400 text-sm">Remaining</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-center">
                <div className="bg-gray-800/50 rounded p-2">
                  <p className="text-gray-400 text-xs">Avg</p>
                  <p className="text-emerald-400 font-semibold">{playerAvg}</p>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <p className="text-gray-400 text-xs">High</p>
                  <p className="text-emerald-400 font-semibold">{playerTotalScore > 0 ? Math.floor(playerTotalScore / Math.max(1, Math.floor(playerDartsThrown / 3))) : 0}</p>
                </div>
              </div>
            </Card>

            {/* Bot Score */}
            <Card className={`bg-[#111827] border-2 ${!isPlayerTurn ? 'border-blue-500' : 'border-gray-800'} p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="text-white font-medium">DartBot ({trainingSettings.botLevel})</span>
                <span className="text-gray-400 text-sm">Legs: {botLegs}</span>
              </div>
              <div className="text-center py-4">
                <p className="text-6xl font-bold text-white">{botScore}</p>
                <p className="text-gray-400 text-sm">Remaining</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-center">
                <div className="bg-gray-800/50 rounded p-2">
                  <p className="text-gray-400 text-xs">Avg</p>
                  <p className="text-blue-400 font-semibold">{botAvg}</p>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <p className="text-gray-400 text-xs">High</p>
                  <p className="text-blue-400 font-semibold">{botTotalScore > 0 ? Math.floor(botTotalScore / Math.max(1, Math.floor(botDartsThrown / 3))) : 0}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Game Area */}
          <div className="grid grid-cols-3 gap-4">
            {/* Dartboard */}
            <Card className="bg-[#111827] border-gray-800 p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm">Dartbot Board</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded bg-gray-800 text-gray-400 text-sm">Rings</button>
                  <button className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 text-sm">Debug</button>
                </div>
              </div>
              <div className="aspect-square flex items-center justify-center">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  <circle cx="200" cy="200" r="190" fill="#1a1a2e" stroke="#333" strokeWidth="2"/>
                  
                  {[20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5].map((num, i) => {
                    const angle = (i * 18 - 9) * Math.PI / 180;
                    const x = 200 + 170 * Math.sin(angle);
                    const y = 200 - 170 * Math.cos(angle);
                    return (
                      <text 
                        key={num} 
                        x={x} 
                        y={y} 
                        textAnchor="middle" 
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="16"
                        fontWeight="bold"
                      >
                        {num}
                      </text>
                    );
                  })}
                  
                  {[...Array(20)].map((_, i) => {
                    const isRed = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18].includes(i);
                    return (
                      <path
                        key={i}
                        d={`M 200 200 L ${200 + 150 * Math.sin((i * 18 - 9) * Math.PI / 180)} ${200 - 150 * Math.cos((i * 18 - 9) * Math.PI / 180)} A 150 150 0 0 1 ${200 + 150 * Math.sin(((i + 1) * 18 - 9) * Math.PI / 180)} ${200 - 150 * Math.cos(((i + 1) * 18 - 9) * Math.PI / 180)} Z`}
                        fill={isRed ? '#c41e3a' : '#2d5a27'}
                        stroke="#333"
                        strokeWidth="1"
                        opacity="0.8"
                      />
                    );
                  })}
                  
                  <circle cx="200" cy="200" r="140" fill="none" stroke="#c41e3a" strokeWidth="15" opacity="0.6"/>
                  <circle cx="200" cy="200" r="90" fill="none" stroke="#2d5a27" strokeWidth="15" opacity="0.6"/>
                  
                  <circle cx="200" cy="200" r="25" fill="#c41e3a"/>
                  <circle cx="200" cy="200" r="10" fill="#2d5a27"/>
                </svg>
              </div>
            </Card>

            {/* Visit History */}
            <Card className="bg-[#111827] border-gray-800 p-4">
              <h3 className="text-gray-400 text-sm mb-4">Visit History</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                <p className="text-gray-500 text-center py-8">No visits yet</p>
              </div>
            </Card>

            {/* Scoring */}
            <Card className="bg-[#111827] border-gray-800 p-4">
              {/* Score Input */}
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Type score (0-180)</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="0-180"
                    className="flex-1 py-2 px-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-emerald-500"
                    disabled={!isPlayerTurn}
                  />
                  <Button 
                    disabled={!isPlayerTurn}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    Submit
                  </Button>
                </div>
              </div>

              {/* Quick Score */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-emerald-400 text-sm">Quick Score</span>
                  <span className="text-emerald-400 font-bold">Total: {currentVisit.reduce((a, b) => a + b, 0)}</span>
                </div>
                <div className="flex gap-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="flex-1 py-3 rounded-lg bg-gray-800 border border-dashed border-gray-600 text-center">
                      <span className="text-gray-500">{currentVisit[i] || '-'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multipliers */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <button className="py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium">Singles</button>
                <button className="py-2 rounded-lg bg-gray-800 text-gray-400 text-sm hover:bg-gray-700">Doubles</button>
                <button className="py-2 rounded-lg bg-gray-800 text-gray-400 text-sm hover:bg-gray-700">Triples</button>
                <button className="py-2 rounded-lg bg-gray-800 text-gray-400 text-sm hover:bg-gray-700">Bulls</button>
              </div>

              {/* Number Pad */}
              <div className="grid grid-cols-5 gap-2">
                {[...Array(20)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handleNumberClick(i + 1)}
                    disabled={!isPlayerTurn || currentVisit.length >= 3}
                    className="py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <span className="block font-bold">S{i + 1}</span>
                    <span className="text-xs text-gray-500">({i + 1})</span>
                  </button>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <button 
                  onClick={handleClear}
                  disabled={!isPlayerTurn}
                  className="py-3 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Clear</span>
                </button>
                <button 
                  onClick={handleSubmitVisit}
                  disabled={!isPlayerTurn || currentVisit.length === 0}
                  className="py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit</span>
                </button>
                <button 
                  onClick={handleBust}
                  disabled={!isPlayerTurn}
                  className="py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                >
                  Bust
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="bg-[#111827] border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {winner === 'player' ? 'Victory!' : 'Defeat'}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              winner === 'player' ? 'bg-emerald-500/20' : 'bg-red-500/20'
            }`}>
              {winner === 'player' ? (
                <Trophy className="w-10 h-10 text-emerald-400" />
              ) : (
                <Bot className="w-10 h-10 text-red-400" />
              )}
            </div>
            <p className="text-xl font-semibold text-white mb-2">
              {winner === 'player' ? 'You Won!' : 'DartBot Won!'}
            </p>
            <p className="text-gray-400 mb-6">{playerLegs} - {botLegs}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Your Average</p>
                <p className="text-emerald-400 font-bold text-xl">{playerAvg}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Bot Average</p>
                <p className="text-blue-400 font-bold text-xl">{botAvg}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handlePlayAgain}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Play Again
              </Button>
              <Button 
                onClick={() => navigate('/play')}
                variant="outline"
                className="flex-1 border-gray-700 text-white hover:bg-gray-800"
              >
                Back to Play
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
