import React, { useState, useEffect, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Bell, User as UserIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Home from './pages/Home';
import Workout from './pages/Workout';
import History from './pages/History';
import Progress from './pages/Progress';
import Auth from './pages/Auth';
import { storageService } from './services/storage';
import { InteractiveBackground } from './components/InteractiveBackground';
import ThemeToggle from './components/ThemeToggle';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDocFromServer } from 'firebase/firestore';

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

testConnection();

function Navbar({ onLogout, userPhoto }: { onLogout: () => void, userPhoto?: string | null }) {
  const location = useLocation();
  const navItems = [
    { name: 'HOME', path: '/' },
    { name: 'WORKOUT', path: '/workout' },
    { name: 'HISTORY', path: '/history' },
    { name: 'PROGRESS', path: '/progress' },
  ];

  return (
    <nav className="glass-liquid-nav text-black dark:text-white h-16 flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
          <span className="font-black text-sm text-white dark:text-black">M</span>
        </div>
      </div>
      
      <div className="flex gap-12">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`text-[10px] font-black tracking-[0.2em] transition-colors hover:text-black dark:hover:text-white ${
              location.pathname === item.path ? 'text-black dark:text-white border-b-2 border-black dark:border-white pb-1' : 'text-gray-400 dark:text-slate-400'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <ThemeToggle />
        <button className="text-gray-400 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors">
          <Bell size={20} />
        </button>
        <button 
          onClick={onLogout}
          className="text-gray-400 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
          {userPhoto ? (
            <img src={userPhoto} alt="Profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          ) : (
            <UserIcon size={16} className="text-gray-400" />
          )}
        </div>
      </div>
    </nav>
  );
}

function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}

function AppContent({ user, handleLogout }: { user: any, handleLogout: () => void }) {
  const location = useLocation();
  const mode = location.pathname === '/' ? 'home' : 'standard';

  return (
    <div className="min-h-screen flex flex-col relative text-slate-900 dark:text-white transition-colors duration-500">
      <InteractiveBackground mode={mode} />
      {user ? (
        <>
          <Navbar onLogout={handleLogout} userPhoto={user?.photoURL} />
          <main className="flex-1 relative z-10">
            <AnimatePresence mode="wait">
              <Routes location={location}>
                <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
                <Route path="/workout" element={<PageWrapper><Workout /></PageWrapper>} />
                <Route path="/workout/:muscle" element={<PageWrapper><Workout /></PageWrapper>} />
                <Route path="/history" element={<PageWrapper><History /></PageWrapper>} />
                <Route path="/progress" element={<PageWrapper><Progress /></PageWrapper>} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </AnimatePresence>
          </main>
        </>
      ) : (
        <main className="flex-1 relative z-10">
          <AnimatePresence mode="wait">
            <Routes location={location}>
              <Route path="/auth" element={<PageWrapper><Auth /></PageWrapper>} />
              <Route path="*" element={<Navigate to="/auth" />} />
            </Routes>
          </AnimatePresence>
        </main>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Force sign out on load to always show login page
    signOut(auth);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
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
      <AppContent user={user} handleLogout={handleLogout} />
    </Router>
  );
}
