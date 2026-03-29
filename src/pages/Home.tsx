import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { storageService } from '../services/storage';
import { UserProfile, WorkoutSession } from '../types';
import StatsBar from '../components/StatsBar';

const MuscleOverlay = ({ side, onMuscleClick }: { side: 'front' | 'rear', onMuscleClick: (muscle: string) => void }) => {
  return (
    <svg 
      viewBox="0 0 400 600" 
      className="absolute inset-0 w-full h-full opacity-0 hover:opacity-0 transition-opacity duration-300 cursor-pointer z-20"
    >
      {side === 'front' ? (
        <>
          <rect x="125" y="120" width="140" height="55" rx="15" onClick={() => onMuscleClick('Chest')} fill="white" />
          <rect x="145" y="195" width="110" height="110" rx="15" onClick={() => onMuscleClick('Abs')} fill="white" />
          <rect x="80" y="80" width="50" height="60" rx="25" transform="rotate(45 105 110)" onClick={() => onMuscleClick('Shoulders')} fill="white" />
          <rect x="270" y="80" width="50" height="60" rx="25" transform="rotate(45 295 110)" onClick={() => onMuscleClick('Shoulders')} fill="white" />
          <rect x="75" y="160" width="45" height="60" rx="20" onClick={() => onMuscleClick('Biceps')} fill="white" />
          <rect x="270" y="160" width="45" height="60" rx="20" onClick={() => onMuscleClick('Biceps')} fill="white" />
          <rect x="50" y="200" width="40" height="90" rx="15" onClick={() => onMuscleClick('Forearms')} fill="white" />
          <rect x="290" y="200" width="40" height="90" rx="15" onClick={() => onMuscleClick('Forearms')} fill="white" />
          <rect x="125" y="320" width="70" height="140" rx="20" onClick={() => onMuscleClick('Quads')} fill="white" />
          <rect x="205" y="320" width="70" height="140" rx="20" onClick={() => onMuscleClick('Quads')} fill="white" />
        </>
      ) : (
        <>
          <rect x="130" y="80" width="140" height="160" rx="20" onClick={() => onMuscleClick('Back')} fill="white" />
          <rect x="75" y="150" width="45" height="70" rx="20" onClick={() => onMuscleClick('Triceps')} fill="white" />
          <rect x="280" y="150" width="45" height="70" rx="20" onClick={() => onMuscleClick('Triceps')} fill="white" />
          <rect x="135" y="260" width="130" height="75" rx="30" onClick={() => onMuscleClick('Glutes')} fill="white" />
          <rect x="130" y="340" width="65" height="110" rx="20" onClick={() => onMuscleClick('Hamstrings')} fill="white" />
          <rect x="205" y="340" width="65" height="110" rx="20" onClick={() => onMuscleClick('Hamstrings')} fill="white" />
          <rect x="135" y="460" width="55" height="100" rx="20" onClick={() => onMuscleClick('Calves')} fill="white" />
          <rect x="210" y="460" width="55" height="100" rx="20" onClick={() => onMuscleClick('Calves')} fill="white" />
        </>
      )}
    </svg>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [activeModel, setActiveModel] = useState<'none' | 'front' | 'back'>('none');

  useEffect(() => {
    storageService.getUserProfile().then(setProfile);
    storageService.getHistory().then(setHistory);

    const handleLock = (e: any) => setActiveModel(e.detail.lockedModel);
    window.addEventListener('model-lock', handleLock);
    return () => window.removeEventListener('model-lock', handleLock);
  }, []);

  const handleMuscleClick = (muscle: string) => {
    navigate(`/workout/${muscle.toLowerCase()}`);
  };

  if (!profile) return null;

  const getRank = (level: number) => {
    if (level < 5) return 'Novice';
    if (level < 10) return 'Intermediate';
    if (level < 20) return 'Advanced';
    if (level < 30) return 'Elite Athlete';
    return 'Master';
  };

  const xp = profile.stats?.xp || 0;
  const level = profile.stats?.level || 1;
  const currentLevelXP = xp % 1000;
  const nextLevelXP = 1000;
  const progressPercent = (currentLevelXP / nextLevelXP) * 100;
  const rank = getRank(level);

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col max-w-7xl mx-auto px-8 py-8">
      {/* Header Section */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8 relative z-10"
        >
          <h1 className="text-5xl font-black mb-1 tracking-tighter">SELECT MUSCLE GROUP</h1>
          <p className="text-gray-400 dark:text-gray-300 text-xs font-bold uppercase tracking-widest mb-6">Target specific anatomy to begin</p>

          {/* XP / Leveling System */}
          <div className="max-w-md mx-auto w-full px-4">
            <div className="flex justify-between items-end mb-2">
              <div className="flex items-center gap-2">
                <span className="tech-label text-indigo-600 text-sm">LEVEL {level}</span>
                <div className="w-1 h-1 bg-white/20 rounded-full" />
                <span className="tech-label text-slate-400">{rank}</span>
              </div>
              <span className="hud-data text-[10px] text-slate-500 dark:text-slate-400">{currentLevelXP} / {nextLevelXP} XP</span>
            </div>
            <div className="h-1.5 w-full bg-black/20 rounded-[10px] overflow-hidden border border-white/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 2, ease: "circOut", delay: 0.5 }}
                className="h-full bg-gradient-to-r from-indigo-600 to-blue-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Anatomical Models Section */}
        <div className="flex-1 flex items-center justify-center gap-16 min-h-0 mb-8">
          {/* FRONT MODEL */}
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ 
              x: 0, 
              opacity: 1,
              scale: activeModel === 'front' ? 1.08 : 1
            }}
            transition={{ 
              type: "spring", 
              stiffness: activeModel === 'front' ? 300 : 50, 
              damping: 20, 
              delay: activeModel === 'front' ? 0 : 0.2 
            }}
            className="relative h-full max-h-[550px] aspect-[2/3] group"
          >
            <div className="absolute inset-0 bg-indigo-500/5 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img 
              src="https://i.postimg.cc/MKj9FJvY/vfwsecwe.png" 
              alt="Anatomy Front" 
              className="h-full w-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
            />
            <div className="absolute inset-0 w-full h-full z-20">
              <MuscleOverlay side="front" onMuscleClick={handleMuscleClick} />
            </div>
          </motion.div>

          {/* REAR MODEL */}
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ 
              x: 0, 
              opacity: 1,
              scale: activeModel === 'back' ? 1.08 : 1
            }}
            transition={{ 
              type: "spring", 
              stiffness: activeModel === 'back' ? 300 : 50, 
              damping: 20, 
              delay: activeModel === 'back' ? 0 : 0.4 
            }}
            className="relative h-full max-h-[550px] aspect-[2/3] group"
          >
            <div className="absolute inset-0 bg-blue-500/5 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img 
              src="https://i.postimg.cc/DzYCNvdr/evcawerva.png" 
              alt="Anatomy Rear" 
              className="h-full w-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
            />
            <div className="absolute inset-0 w-full h-full z-20">
              <MuscleOverlay side="rear" onMuscleClick={handleMuscleClick} />
            </div>
          </motion.div>
        </div>

        <StatsBar profile={profile} history={history} />
      </div>
  );
}
