import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { Target, Bell, Home, Play, Trophy, Users, BarChart3, LogOut } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
}

export function Navigation({ currentPage }: NavigationProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'play', label: 'Play', icon: Play, path: '/play' },
    { id: 'ranked-divisions', label: 'Ranked Divisions', icon: Trophy, path: '/ranked-divisions' },
    { id: 'leagues', label: 'Leagues', icon: Users, path: '/leagues' },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy, path: '/tournaments' },
    { id: 'stats', label: 'Stats', icon: BarChart3, path: '/stats' },
  ];

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-[#0d1117] border-b border-gray-800">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FIVE01</span>
        </div>

        {/* Season Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-emerald-400 text-xs font-medium">SEASON LIVE</span>
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search players, leagues..."
            className="w-64 px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full text-xs flex items-center justify-center text-white font-medium">
            3
          </span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-medium text-sm">
              {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            <span className="text-white text-sm font-medium">{user?.username || 'User'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
