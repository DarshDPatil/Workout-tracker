import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';
import { storageService } from '../services/storage';
import { UserProfile } from '../types';

// Let's import them directly from the same folder (src/pages)
import frontAnatomyImg from './vfwsecwe.png';
import rearAnatomyImg from './evcawerva.png';

const MuscleOverlay = ({ side, onMuscleClick }: { side: 'front' | 'rear', onMuscleClick: (muscle: string) => void }) => {
  return (
    <svg 
      viewBox="0 0 400 600" 
      // Base opacity is 0 (completely hidden). 
      // It only jumps to 20% when you hover over a specific muscle.
      className="absolute inset-0 w-full h-full opacity-0 hover:opacity-0 transition-opacity duration-300 cursor-pointer"
    >
      {side === 'front' ? (
        <>
          {/* Chest */}
          <rect x="125" y="120" width="140" height="55" rx="15" onClick={() => onMuscleClick('Chest')} fill="white" />
          {/* Abs */}
          <rect x="145" y="195" width="110" height="110" rx="15" onClick={() => onMuscleClick('Abs')} fill="white" />
          {/* Left Shoulder */}
          <rect x="80" y="80" width="50" height="60" rx="25" transform="rotate(45 105 110)" onClick={() => onMuscleClick('Shoulders')} fill="white" />
          {/* Right Shoulder */}
          <rect x="270" y="80" width="50" height="60" rx="25" transform="rotate(45 295 110)" onClick={() => onMuscleClick('Shoulders')} fill="white" />
          {/* Biceps */}
          <rect x="75" y="160" width="45" height="60" rx="20" onClick={() => onMuscleClick('Bicep')} fill="white" />
          <rect x="270" y="160" width="45" height="60" rx="20" onClick={() => onMuscleClick('Bicep')} fill="white" />
          {/* Forearms */}
          <rect x="50" y="200" width="40" height="90" rx="15" onClick={() => onMuscleClick('Forearms')} fill="white" />
          <rect x="290" y="200" width="40" height="90" rx="15" onClick={() => onMuscleClick('Forearms')} fill="white" />
          {/* Quads */}
          <rect x="125" y="320" width="70" height="140" rx="20" onClick={() => onMuscleClick('Quads')} fill="white" />
          <rect x="205" y="320" width="70" height="140" rx="20" onClick={() => onMuscleClick('Quads')} fill="white" />
        </>
      ) : (
        <>
          {/* Back */}
          <rect x="130" y="80" width="140" height="160" rx="20" onClick={() => onMuscleClick('Back')} fill="white" />
          {/* Triceps */}
          <rect x="75" y="150" width="45" height="70" rx="20" onClick={() => onMuscleClick('Triceps')} fill="white" />
          <rect x="280" y="150" width="45" height="70" rx="20" onClick={() => onMuscleClick('Triceps')} fill="white" />
          {/* Glutes */}
          <rect x="135" y="260" width="130" height="75" rx="30" onClick={() => onMuscleClick('Glutes')} fill="white" />
          {/* Hamstrings */}
          <rect x="130" y="340" width="65" height="110" rx="20" onClick={() => onMuscleClick('Hamstrings')} fill="white" />
          <rect x="205" y="340" width="65" height="110" rx="20" onClick={() => onMuscleClick('Hamstrings')} fill="white" />
          {/* Calves */}
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

  useEffect(() => {
    setProfile(storageService.getUserProfile());
  }, []);

  const handleMuscleClick = (muscle: string) => {
    navigate(`/workout/${muscle.toLowerCase()}`);
  };

  if (!profile) return null;

return (
    <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col max-w-7xl mx-auto px-8 py-8">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-black mb-1">SELECT MUSCLE GROUP</h1>
        <p className="text-gray-400 text-xs">Click on anatomical model to target specific muscle group</p>
      </div>

      <div className="flex-1 flex items-center justify-center gap-12 min-h-0 mb-8">
        {/* FRONT IMAGE CONTAINER - MADE LARGER */}
        <div className="relative h-full max-h-[600px]">
          <img 
            src="https://i.postimg.cc/MKj9FJvY/vfwsecwe.png" 
            alt="Anatomy Front" 
            className="h-full w-auto object-contain"
          />
          <div className="absolute inset-0 w-full h-full">
            <MuscleOverlay side="front" onMuscleClick={handleMuscleClick} />
          </div>
        </div>

        {/* BACK IMAGE CONTAINER - MADE LARGER */}
        <div className="relative h-full max-h-[600px]">
         <img 
            src="https://i.postimg.cc/DzYCNvdr/evcawerva.png" 
            alt="Anatomy Rear" 
            className="h-full w-auto object-contain"
          />
          <div className="absolute inset-0 w-full h-full">
            <MuscleOverlay side="rear" onMuscleClick={handleMuscleClick} />
          </div>
        </div>
      </div>

      <div className="bg-black text-white rounded-[20px] p-8 grid grid-cols-3 gap-8 text-center shrink-0">
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase mb-2 opacity-70">Daily Streak</p>
          <p className="text-4xl font-black">{profile.stats.dailyStreak}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase mb-2 opacity-70">Weight Progress</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-4xl font-black">{profile.stats.weightProgress}kg</p>
            <TrendingUp className="text-green-400" size={24} />
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase mb-2 opacity-70">Total Days</p>
          <p className="text-4xl font-black">{profile.stats.totalDays}</p>
        </div>
      </div>
    </div>
  );
}