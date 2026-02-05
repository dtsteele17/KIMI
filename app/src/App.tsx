import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { PlayPage } from '@/pages/PlayPage';
import { QuickMatchBrowser } from '@/pages/QuickMatchBrowser';
import { QuickMatchLobby } from '@/pages/QuickMatchLobby';
import { RankedDivisionsPage } from '@/pages/RankedDivisionsPage';
import { LeaguesPage } from '@/pages/LeaguesPage';
import { LeagueDetailPage } from '@/pages/LeagueDetailPage';
import { TournamentsPage } from '@/pages/TournamentsPage';
import { TournamentDetailPage } from '@/pages/TournamentDetailPage';
import { StatsPage } from '@/pages/StatsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { FriendsPage } from '@/pages/FriendsPage';
import { GamePage } from '@/pages/GamePage';
import { TrainingPage } from '@/pages/TrainingPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/play" element={<ProtectedRoute><PlayPage /></ProtectedRoute>} />
        <Route path="/quick-match" element={<ProtectedRoute><QuickMatchBrowser /></ProtectedRoute>} />
        <Route path="/lobby-create" element={<ProtectedRoute><QuickMatchLobby /></ProtectedRoute>} />
        <Route path="/ranked-divisions" element={<ProtectedRoute><RankedDivisionsPage /></ProtectedRoute>} />
        <Route path="/leagues" element={<ProtectedRoute><LeaguesPage /></ProtectedRoute>} />
        <Route path="/league/:id" element={<ProtectedRoute><LeagueDetailPage /></ProtectedRoute>} />
        <Route path="/tournaments" element={<ProtectedRoute><TournamentsPage /></ProtectedRoute>} />
        <Route path="/tournament/:id" element={<ProtectedRoute><TournamentDetailPage /></ProtectedRoute>} />
        <Route path="/stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
        <Route path="/game/:id" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
        <Route path="/training" element={<ProtectedRoute><TrainingPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
