import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, GlassWater, CupSoda, Droplets, Undo2, Settings, Check, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storageService } from '../services/storage';
import { UserProfile } from '../types';

interface WaterIntakeProps {
  profile: UserProfile;
  onUpdate: (updatedProfile: UserProfile) => void;
}

const WaterIntake: React.FC<WaterIntakeProps> = ({ profile, onUpdate }) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; text: string }[]>([]);
  
  const [lastAddedAmount, setLastAddedAmount] = useState<number | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(profile.customWaterGoal?.toString() || '3.0');
  const [showSettings, setShowSettings] = useState(false);

  const [isEditingIntake, setIsEditingIntake] = useState(false);
  const [tempIntake, setTempIntake] = useState(profile.waterIntake.toString());

  const goal = useMemo(() => {
    if (profile.waterGoalMode === 'manual' && profile.customWaterGoal) {
      return profile.customWaterGoal;
    }
    return parseFloat((profile.currentWeight * 0.033).toFixed(1));
  }, [profile.currentWeight, profile.waterGoalMode, profile.customWaterGoal]);

  useEffect(() => {
    const checkAndResetWater = () => {
      const today = new Date().toISOString().split('T')[0];
      const lastLogDate = profile.lastWaterLogDate;

      if (lastLogDate !== today) {
        const updatedProfile = {
          ...profile,
          waterIntake: 0,
          lastWaterLogDate: today
        };
        onUpdate(updatedProfile);
        storageService.saveUserProfile(updatedProfile);
      }
    };

    checkAndResetWater();
  }, [profile.lastWaterLogDate]);

  const addWater = (amountLiters: number) => {
    const newIntake = parseFloat((profile.waterIntake + amountLiters).toFixed(2));
    const updatedProfile = {
      ...profile,
      waterIntake: newIntake,
      lastWaterLogDate: new Date().toISOString().split('T')[0]
    };
    
    onUpdate(updatedProfile);
    storageService.saveUserProfile(updatedProfile);

    setLastAddedAmount(amountLiters);
    setShowUndo(true);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setShowUndo(false), 5000);

    const id = Date.now();
    const text = `+${(amountLiters * 1000).toFixed(0)}ml`;
    setFloatingTexts(prev => [...prev, { id, text }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1000);
  };

  const handleUndo = () => {
    if (lastAddedAmount !== null) {
      const newIntake = Math.max(0, parseFloat((profile.waterIntake - lastAddedAmount).toFixed(2)));
      const updatedProfile = {
        ...profile,
        waterIntake: newIntake
      };
      onUpdate(updatedProfile);
      storageService.saveUserProfile(updatedProfile);
      setLastAddedAmount(null);
      setShowUndo(false);
    }
  };

  const handleCustomSubmit = () => {
    const amount = parseFloat(customAmount);
    if (!isNaN(amount) && amount > 0) {
      addWater(amount / 1000);
      setCustomAmount('');
      setShowCustomInput(false);
    }
  };

  const handleGoalUpdate = () => {
    const newGoal = parseFloat(tempGoal);
    if (!isNaN(newGoal) && newGoal > 0) {
      const updatedProfile = {
        ...profile,
        customWaterGoal: newGoal,
        waterGoalMode: 'manual' as const
      };
      onUpdate(updatedProfile);
      storageService.saveUserProfile(updatedProfile);
      setIsEditingGoal(false);
    }
  };

  const handleIntakeUpdate = () => {
    const newIntake = parseFloat(tempIntake);
    if (!isNaN(newIntake) && newIntake >= 0) {
      const updatedProfile = {
        ...profile,
        waterIntake: parseFloat(newIntake.toFixed(2))
      };
      onUpdate(updatedProfile);
      storageService.saveUserProfile(updatedProfile);
      setIsEditingIntake(false);
    }
  };

  const toggleGoalMode = () => {
    const newMode = profile.waterGoalMode === 'auto' ? 'manual' : 'auto';
    const updatedProfile = {
      ...profile,
      waterGoalMode: newMode as 'auto' | 'manual'
    };
    onUpdate(updatedProfile);
    storageService.saveUserProfile(updatedProfile);
  };

  const resetToday = () => {
    const updatedProfile = {
      ...profile,
      waterIntake: 0
    };
    onUpdate(updatedProfile);
    storageService.saveUserProfile(updatedProfile);
  };

  const percentage = Math.min(100, Math.round((profile.waterIntake / goal) * 100));
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    // DARK MODE: Swapped background, adjusted borders, added subtle dark shadow
    <div className="glass-liquid-terminal dark:bg-slate-900/40 dark:border-white/10 dark:shadow-[inset_0_1px_5px_rgba(255,255,255,0.05)] p-8 flex flex-col items-center relative overflow-hidden transition-colors duration-500">
      
      <div className="w-full flex justify-between items-center mb-6">
        {/* DARK MODE: Text color swap */}
        <h2 className="text-lg font-black uppercase text-slate-950 dark:text-white tracking-tight transition-colors">
          Water Intake
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={resetToday}
            // DARK MODE: Adjusted button hover states for stealth mode
            className="p-2 rounded-[10px] bg-white/5 backdrop-blur-md text-slate-400 hover:bg-red-500/20 hover:text-red-500 border border-white/10 dark:border-white/5 dark:hover:bg-red-500/30 transition-all cursor-pointer z-10"
            title="Reset Today"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-[10px] border transition-all ${
              showSettings 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)]' 
                : 'bg-white/5 backdrop-blur-md text-slate-400 hover:bg-white/10 border-white/10 dark:border-white/5 dark:hover:bg-white/10'
            }`}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            // DARK MODE: Darker settings panel background
            className="w-full mb-6 bg-black/5 dark:bg-black/40 backdrop-blur-md rounded-[14px] p-4 border border-white/10 dark:border-white/5 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              {/* DARK MODE: Label text color */}
              <span className="tech-label text-slate-950 dark:text-slate-300">Goal Mode</span>
              <button 
                onClick={toggleGoalMode}
                className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${
                  profile.waterGoalMode === 'auto' 
                    ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.4)]' 
                    : 'bg-white/10 text-slate-500 dark:text-slate-400 border border-white/20 dark:border-white/10'
                }`}
              >
                {profile.waterGoalMode === 'auto' ? 'AUTO (WEIGHT)' : 'MANUAL'}
              </button>
            </div>
            {profile.waterGoalMode === 'manual' && (
              <div className="flex items-center justify-between">
                <span className="tech-label text-slate-950 dark:text-slate-300">Daily Goal (L)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(e.target.value)}
                    // DARK MODE: Input text colors
                    className="w-16 px-2 py-1 etched-well dark:bg-black/30 dark:border-white/5 rounded-[8px] text-xs font-bold focus:outline-none hud-data dark:text-white transition-colors"
                  />
                  <button 
                    onClick={handleGoalUpdate}
                    className="p-1 bg-indigo-600 text-white rounded-[8px] hover:bg-indigo-500 transition-colors"
                  >
                    <Check size={12} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="relative w-48 h-48 mb-8">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            // DARK MODE: Background circle track color
            className="text-black/5 dark:text-white/5 transition-colors duration-500"
          />
          <motion.circle
            cx="96"
            cy="96"
            r={radius}
            // DARK MODE: The active ring stays indigo, but we could make it brighter if needed!
            stroke="#4F46E5" 
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
            fill="transparent"
            className="drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]"
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            key={percentage}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            // DARK MODE: Main percentage text. We use a brighter indigo for dark mode visibility.
            className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-normal transition-colors"
          >
            {percentage}%
          </motion.span>
          
          <div className="flex flex-col items-center">
            {isEditingIntake ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  step="0.1"
                  autoFocus
                  value={tempIntake}
                  onChange={(e) => setTempIntake(e.target.value)}
                  onBlur={handleIntakeUpdate}
                  onKeyDown={(e) => e.key === 'Enter' && handleIntakeUpdate()}
                  // DARK MODE: Active input text
                  className="w-12 text-center text-xs font-bold border-b border-indigo-500 bg-transparent text-slate-950 dark:text-white focus:outline-none font-mono"
                />
                <span className="font-mono font-bold text-[10px] text-slate-400 dark:text-slate-300">L</span>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setTempIntake(profile.waterIntake.toString());
                  setIsEditingIntake(true);
                }}
                className="font-mono font-bold text-[10px] tracking-wider text-slate-400 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mt-1"
              >
                {profile.waterIntake.toFixed(1)}L / {goal}L
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showUndo && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={handleUndo}
              className="absolute -top-4 -right-4 w-10 h-10 bg-indigo-600 text-white rounded-[14px] flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)] hover:scale-110 transition-transform z-10 border border-indigo-400/30"
              title="Undo last addition"
            >
              <Undo2 size={16} />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {floatingTexts.map(t => (
            <motion.div
              key={t.id}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: -100, opacity: 1 }}
              exit={{ opacity: 0 }}
              // DARK MODE: Brighter text for the floating animation
              className="absolute top-1/2 left-1/2 -translate-x-1/2 text-indigo-600 dark:text-indigo-400 font-black text-sm pointer-events-none z-20 drop-shadow-sm font-mono"
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex gap-4 mb-6">
        {/* DARK MODE: Quick Add Buttons adapted for stealth */}
        <button 
          onClick={() => addWater(0.25)}
          className="w-12 h-12 rounded-[14px] bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all group border border-indigo-500/20 dark:border-indigo-400/30"
          title="Add 250ml"
        >
          <GlassWater size={20} className="group-hover:scale-110 transition-transform" />
        </button>
        <button 
          onClick={() => addWater(0.5)}
          className="w-12 h-12 rounded-[14px] bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all group border border-indigo-500/20 dark:border-indigo-400/30"
          title="Add 500ml"
        >
          <CupSoda size={20} className="group-hover:scale-110 transition-transform" />
        </button>
        <button 
          onClick={() => addWater(0.75)}
          className="w-12 h-12 rounded-[14px] bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all group border border-indigo-500/20 dark:border-indigo-400/30"
          title="Add 750ml"
        >
          <Droplets size={20} className="group-hover:scale-110 transition-transform" />
        </button>
        <button 
          onClick={() => setShowCustomInput(!showCustomInput)}
          className={`w-12 h-12 rounded-[14px] flex items-center justify-center transition-all border ${
            showCustomInput 
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.4)]' 
              : 'bg-white/5 backdrop-blur-md text-slate-400 hover:bg-white/10 border-white/10 dark:border-white/5'
          }`}
        >
          <Plus size={20} />
        </button>
      </div>

      <AnimatePresence>
        {showCustomInput && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full flex gap-2 overflow-hidden"
          >
            <input
              type="number"
              placeholder="Amount in ml..."
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
              // DARK MODE: Text input styling
              className="flex-1 px-4 py-2 etched-well dark:bg-black/30 dark:border-white/5 dark:text-white dark:placeholder:text-slate-600 rounded-[14px] focus:outline-none hud-data transition-colors"
            />
            <button 
              onClick={handleCustomSubmit}
              className="mercury-capsule dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/20 text-white px-4 py-2 font-bold uppercase tracking-wider text-[10px] hover:scale-[1.02] transition-all"
            >
              ADD
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WaterIntake;
