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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-gray-200 flex items-center justify-center">
           <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
            <span className="text-white font-black text-xl">M</span>
           </div>
        </div>
        <h1 className="text-5xl font-black tracking-tighter momentum-logo">MOMENTUM</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[20px] shadow-xl w-full max-w-md border border-gray-100"
      >
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setIsSignIn(true)}
            className={`text-lg font-bold tracking-tight pb-1 border-b-2 transition-colors ${isSignIn ? 'border-black text-black' : 'border-transparent text-gray-300'}`}
          >
            SIGN IN
          </button>
          <button 
            onClick={() => setIsSignIn(false)}
            className={`text-lg font-bold tracking-tight pb-1 border-b-2 transition-colors ${!isSignIn ? 'border-black text-black' : 'border-transparent text-gray-300'}`}
          >
            SIGN UP
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="Email address"
              className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password"
              className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <p className="text-red-500 text-xs px-2">{error}</p>}

          <button 
            type="submit"
            className="w-full py-4 bg-black text-white rounded-2xl font-bold tracking-widest text-sm hover:bg-gray-900 transition-colors mt-4"
          >
            {isSignIn ? 'SIGN IN' : 'SIGN UP'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
