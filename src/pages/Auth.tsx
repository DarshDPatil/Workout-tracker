import React, { useState } from 'react';
import { motion } from 'motion/react';

export default function Auth({ onLogin }: { onLogin: (user: any) => void }) {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Simulate auth with localStorage
    if (email && password) {
      onLogin({ email, uid: 'local-user-' + Date.now() });
    } else {
      setError('Please enter email and password');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-black rounded-2xl shadow-lg flex items-center justify-center">
           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-black dark:text-white font-black text-xl">M</span>
           </div>
        </div>
        <h1 className="text-5xl font-black tracking-tighter momentum-logo">MOMENTUM</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[32px] shadow-2xl w-full max-w-md border border-gray-100"
      >
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setIsSignIn(true)}
            className={`text-lg font-black tracking-tight pb-1 border-b-2 transition-colors ${isSignIn ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
          >
            SIGN IN
          </button>
          <button 
            onClick={() => setIsSignIn(false)}
            className={`text-lg font-black tracking-tight pb-1 border-b-2 transition-colors ${!isSignIn ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
          >
            SIGN UP
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="Email address"
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-black transition-colors font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password"
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-black transition-colors font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <p className="text-red-500 text-sm px-2">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors shadow-lg shadow-black/20 mt-4"
          >
            {isSignIn ? 'SIGN IN' : 'SIGN UP'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
