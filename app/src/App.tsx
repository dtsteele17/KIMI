import { useNavigationStore, useAuthStore } from '@/store';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { PlayPage } from '@/pages/PlayPage';
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

function App() {
  const { currentPage } = useNavigationStore();
  const { isAuthenticated } = useAuthStore();

  // Protected pages that require authentication
  const protectedPages = [
    'dashboard', 'play', 'ranked-divisions', 'leagues', 'league-detail',
    'tournaments', 'tournament-detail', 'stats', 'profile', 'friends', 'game', 'training'
  ];

  // If trying to access protected page without auth, redirect to login
  if (!isAuthenticated && protectedPages.includes(currentPage)) {
    return <LoginPage />;
  }

  // If authenticated and on public page (except home), redirect to dashboard
  if (isAuthenticated && (currentPage === 'login' || currentPage === 'signup')) {
    return <DashboardPage />;
  }

  // Render the appropriate page
  switch (currentPage) {
    case 'home':
      return <HomePage />;
    case 'login':
      return <LoginPage />;
    case 'signup':
      return <SignupPage />;
    case 'dashboard':
      return <DashboardPage />;
    case 'play':
      return <PlayPage />;
    case 'ranked-divisions':
      return <RankedDivisionsPage />;
    case 'leagues':
      return <LeaguesPage />;
    case 'league-detail':
      return <LeagueDetailPage />;
    case 'tournaments':
      return <TournamentsPage />;
    case 'tournament-detail':
      return <TournamentDetailPage />;
    case 'stats':
      return <StatsPage />;
    case 'profile':
      return <ProfilePage />;
    case 'friends':
      return <FriendsPage />;
    case 'game':
      return <GamePage />;
    case 'training':
      return <TrainingPage />;
    default:
      return <HomePage />;
  }
}

export default App;
