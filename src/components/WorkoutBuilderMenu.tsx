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
        <h2 className="text-4xl font-black uppercase tracking-tighter text-black">
          Workout Builder
        </h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Target Muscle</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {MUSCLE_GROUPS.map((muscle) => {
          const isActive = selectedMuscleGroup === muscle;
          
          return (
            <button
              key={muscle}
              onClick={() => setSelectedMuscleGroup(muscle)}
              className={`
                px-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative overflow-hidden
                ${isActive 
                  ? 'bg-black text-white scale-105 shadow-lg shadow-black/20' 
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-black hover:scale-105'
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
