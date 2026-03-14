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
  
  // Undo state
  const [lastAddedAmount, setLastAddedAmount] = useState<number | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Edit Goal state
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(profile.customWaterGoal?.toString() || '3.0');
  const [showSettings, setShowSettings] = useState(false);

  // Edit Current Intake state
  const [isEditingIntake, setIsEditingIntake] = useState(false);
  const [tempIntake, setTempIntake] = useState(profile.waterIntake.toString());

  // Calculate Goal: Weight * 0.033 or Manual
  const goal = useMemo(() => {
    if (profile.waterGoalMode === 'manual' && profile.customWaterGoal) {
      return profile.customWaterGoal;
    }
    return parseFloat((profile.currentWeight * 0.033).toFixed(1));
  }, [profile.currentWeight, profile.waterGoalMode, profile.customWaterGoal]);

  // Midnight Reset Logic
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

    // Undo logic
    setLastAddedAmount(amountLiters);
    setShowUndo(true);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setShowUndo(false), 5000);

    // Floating text animation
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
      addWater(amount / 1000); // Convert ml to L
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

  // FIX: Removed window.confirm() which often gets blocked by browsers/iframes
  const resetToday = () => {
    const updatedProfile = {
      ...profile,
      waterIntake: 0
    };
    onUpdate(updatedProfile);
    storageService.saveUserProfile(updatedProfile);
  };

  const percentage = Math.min(100, Math.round((profile.waterIntake / goal) * 100));
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-[20px] p-8 card-shadow border border-gray-100 flex flex-col items-center relative overflow-hidden">
      <div className="w-full flex justify-between items-center mb-6">
        <h2 className="text-lg font-black uppercase">Water Intake</h2>
        <div className="flex gap-2">
          <button 
            onClick={resetToday}
            className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer z-10"
            title="Reset Today"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-all ${showSettings ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase">Goal Mode</span>
              <button 
                onClick={toggleGoalMode}
                className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${profile.waterGoalMode === 'auto' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}
              >
                {profile.waterGoalMode === 'auto' ? 'AUTO (WEIGHT)' : 'MANUAL'}
              </button>
            </div>
            {profile.waterGoalMode === 'manual' && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase">Daily Goal (L)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(e.target.value)}
                    className="w-16 px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold focus:outline-none"
                  />
                  <button 
                    onClick={handleGoalUpdate}
                    className="p-1 bg-black text-white rounded hover:opacity-80"
                  >
                    <Check size={12} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Progress Circle */}
      <div className="relative w-48 h-48 mb-8">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-100"
          />
          <motion.circle
            cx="96"
            cy="96"
            r={radius}
            stroke="#3B82F6"
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        
        {/* Inner Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            key={percentage}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-black text-[#3B82F6]"
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
                  className="w-12 text-center text-xs font-bold border-b border-blue-500 focus:outline-none"
                />
                <span className="text-[10px] font-bold text-gray-400">L</span>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setTempIntake(profile.waterIntake.toString());
                  setIsEditingIntake(true);
                }}
                className="text-xs font-bold text-gray-400 hover:text-blue-500 transition-colors"
              >
                {profile.waterIntake.toFixed(1)}L / {goal}L
              </button>
            )}
          </div>
        </div>

        {/* Undo Button Overlay - nudged slightly to not look awkward */}
        <AnimatePresence>
          {showUndo && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={handleUndo}
              className="absolute -top-4 -right-4 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
              title="Undo last addition"
            >
              <Undo2 size={16} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* FIX: Floating Animations now start higher and end much higher so they don't overlap */}
        <AnimatePresence>
          {floatingTexts.map(t => (
            <motion.div
              key={t.id}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: -100, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 text-[#3B82F6] font-black text-sm pointer-events-none z-20 drop-shadow-sm"
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Quick Add Buttons */}
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => addWater(0.25)}
          className="w-12 h-12 rounded-xl bg-blue-50 text-[#3B82F6] flex items-center justify-center hover:bg-[#3B82F6] hover:text-white transition-all group"
          title="Add 250ml"
        >
          <GlassWater size={20} className="group-hover:scale-110 transition-transform" />
        </button>
        <button 
          onClick={() => addWater(0.5)}
          className="w-12 h-12 rounded-xl bg-blue-50 text-[#3B82F6] flex items-center justify-center hover:bg-[#3B82F6] hover:text-white transition-all group"
          title="Add 500ml"
        >
          <CupSoda size={20} className="group-hover:scale-110 transition-transform" />
        </button>
        <button 
          onClick={() => addWater(0.75)}
          className="w-12 h-12 rounded-xl bg-blue-50 text-[#3B82F6] flex items-center justify-center hover:bg-[#3B82F6] hover:text-white transition-all group"
          title="Add 750ml"
        >
          <Droplets size={20} className="group-hover:scale-110 transition-transform" />
        </button>
        <button 
          onClick={() => setShowCustomInput(!showCustomInput)}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${showCustomInput ? 'bg-black text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Custom Input */}
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
              className="flex-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-100 focus:outline-none text-sm font-bold"
            />
            <button 
              onClick={handleCustomSubmit}
              className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:opacity-80 transition-all"
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