import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Bell, User as UserIcon, LogOut } from 'lucide-react';
import Home from './pages/Home';
import Workout from './pages/Workout';
import History from './pages/History';
import Progress from './pages/Progress';
import Auth from './pages/Auth';
import { storageService } from './services/storage';
import { InteractiveBackground } from './components/InteractiveBackground';

function Navbar({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const navItems = [
    { name: 'HOME', path: '/' },
    { name: 'WORKOUT', path: '/workout' },
    { name: 'HISTORY', path: '/history' },
    { name: 'PROGRESS', path: '/progress' },
  ];

  return (
    <nav className="bg-white text-black h-16 flex items-center justify-between px-8 sticky top-0 z-50 border-b border-gray-100">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <span className="font-black text-sm text-white">M</span>
        </div>
      </div>
      
      <div className="flex gap-12">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`text-[10px] font-black tracking-[0.2em] transition-colors hover:text-black ${
              location.pathname === item.path ? 'text-black border-b-2 border-black pb-1' : 'text-gray-400'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <button className="text-gray-400 hover:text-black transition-colors">
          <Bell size={20} />
        </button>
        <button 
          onClick={onLogout}
          className="text-gray-400 hover:text-black transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
          <img src="https://picsum.photos/seed/user/100/100" alt="Profile" referrerPolicy="no-referrer" />
        </div>
      </div>
    </nav>
  );
}

function AppContent({ user, handleLogout, handleLogin }: { user: any, handleLogout: () => void, handleLogin: (data: any) => void }) {
  const location = useLocation();
  const mode = location.pathname === '/' ? 'home' : 'standard';

  return (
    <div className="min-h-screen flex flex-col relative">
      <InteractiveBackground mode={mode} />
      {user ? (
        <>
          <Navbar onLogout={handleLogout} />
          <main className="flex-1 relative z-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/workout" element={<Workout />} />
              <Route path="/workout/:muscle" element={<Workout />} />
              <Route path="/history" element={<History />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </>
      ) : (
        <main className="flex-1 relative z-10">
          <Routes>
            <Route path="/auth" element={<Auth onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/auth" />} />
          </Routes>
        </main>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = storageService.getAuthUser();
    setUser(storedUser);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    storageService.logout();
    setUser(null);
  };

  const handleLogin = (userData: any) => {
    storageService.setAuthUser(userData);
    setUser(userData);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center relative">
        <InteractiveBackground mode="standard" />
        <div className="animate-pulse flex flex-col items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-indigo-600/10 rounded-[12px] flex items-center justify-center border border-indigo-500/20">
            <span className="font-black text-xl text-indigo-600">M</span>
          </div>
          <p className="tech-label opacity-60">INITIALIZING SYSTEM...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AppContent user={user} handleLogout={handleLogout} handleLogin={handleLogin} />
    </Router>
  );
}
