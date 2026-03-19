import React from 'react';

interface WorkoutBuilderMenuProps {
  selectedMuscleGroup: string | null;
  setSelectedMuscleGroup: (muscle: string) => void;
}

const MUSCLE_GROUPS = [
  'CHEST', 
  'BACK', 
  'SHOULDERS', 
  'BICEPS', 
  'TRICEPS', 
  'QUADS', 
  'HAMSTRINGS', 
  'GLUTES', 
  'CALVES', 
  'ABS', 
  'FOREARMS'
];

/**
 * WorkoutBuilderMenu Component
 * A functional UI component for selecting muscle groups in the workout builder.
 */
const WorkoutBuilderMenu: React.FC<WorkoutBuilderMenuProps> = ({ 
  selectedMuscleGroup, 
  setSelectedMuscleGroup 
}) => {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-black dark:text-white">
          Workout Builder
        </h2>
        <p className="text-xs font-bold text-gray-400 dark:text-gray-300 uppercase tracking-widest">Select Target Muscle</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {MUSCLE_GROUPS.map((muscle) => {
          const isActive = selectedMuscleGroup === muscle;
          
          return (
            <button
              key={muscle}
              onClick={() => setSelectedMuscleGroup(muscle)}
              className={`
                px-3 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative overflow-hidden
                ${isActive 
                  ? 'glass-liquid-terminal text-indigo-600 dark:text-indigo-400 scale-105 shadow-[0_0_20px_rgba(79,70,229,0.2)]' 
                  : 'bg-white/40 dark:bg-white/10 text-slate-500 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/20 hover:text-slate-900 dark:hover:text-white hover:scale-105 backdrop-blur-md border border-white/20 dark:border-white/10'
                }
              `}
            >
              {muscle}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WorkoutBuilderMenu;
