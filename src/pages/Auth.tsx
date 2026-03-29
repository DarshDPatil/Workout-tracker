import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../services/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInAnonymously
} from 'firebase/auth';
import ThemeToggle from '../components/ThemeToggle';
import { ArrowUpRight, Mail, Lock, User as UserIcon, ArrowLeft, UserRound } from 'lucide-react';

export default function Auth() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleSignIn = async (forceSelect = false) => {
    try {
      setError('');
      setLoading(true);
      const provider = new GoogleAuthProvider();
      if (forceSelect) {
        provider.setCustomParameters({ prompt: 'select_account' });
      }
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error('Guest auth error:', err);
      setError(err.message || 'Guest login failed. Make sure Anonymous Auth is enabled in Firebase Console.');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error('Email auth error:', err);
      setError(err.message || 'Authentication failed. Make sure Email/Password is enabled in Firebase Console.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
      <div className="absolute top-8 right-8 flex items-center gap-3">
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex items-center gap-2 text-slate-400 dark:text-slate-500"
        >
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Switch Mode</span>
          <ArrowUpRight size={14} className="animate-bounce" />
        </motion.div>
        <ThemeToggle />
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-black dark:bg-white rounded-2xl shadow-lg flex items-center justify-center transition-colors duration-500">
           <div className="w-10 h-10 bg-white dark:bg-black rounded-xl flex items-center justify-center transition-colors duration-500">
            <span className="text-black dark:text-white font-black text-xl">M</span>
           </div>
        </div>
        <h1 className="text-5xl font-black tracking-tighter momentum-logo text-black dark:text-white transition-colors duration-500">MOMENTUM</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-2xl w-full max-w-md border border-gray-100 dark:border-slate-800 flex flex-col items-center transition-colors duration-500 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {!showEmailForm ? (
            <motion.div 
              key="social"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 text-center">Sign In</h2>

              {error && <p className="text-red-500 text-sm px-2 mb-4 text-center">{error}</p>}

              <div className="w-full flex flex-col gap-3">
                <button 
                  onClick={() => handleGoogleSignIn(false)}
                  disabled={loading}
                  className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg shadow-black/20 dark:shadow-white/10 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {loading ? 'CONNECTING...' : 'CONTINUE WITH GOOGLE'}
                </button>

                <button 
                  onClick={() => handleGoogleSignIn(true)}
                  disabled={loading}
                  className="w-full bg-transparent border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserIcon size={14} />
                  Use Another Google Account
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200 dark:border-slate-800"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Or</span></div>
                </div>

                <button 
                  onClick={() => setShowEmailForm(true)}
                  disabled={loading}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-3"
                >
                  <Mail size={18} />
                  Continue with Email
                </button>

                <button 
                  onClick={handleGuestSignIn}
                  disabled={loading}
                  className="w-full bg-transparent border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  <UserRound size={14} />
                  Explore as Guest
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <button 
                onClick={() => setShowEmailForm(false)}
                className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
              >
                <ArrowLeft size={14} />
                Back
              </button>

              <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 text-center">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>

              {error && <p className="text-red-500 text-sm px-2 mb-4 text-center">{error}</p>}

              <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email"
                    placeholder="EMAIL ADDRESS"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password"
                    placeholder="PASSWORD"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg disabled:opacity-50 mt-2"
                >
                  {loading ? 'PROCESSING...' : (isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN')}
                </button>

                <button 
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-widest mt-4 text-center"
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
