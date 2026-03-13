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
    <div className="space-y-6">
      <h2 className="text-3xl font-black uppercase tracking-tighter text-black">
        Workout Builder
      </h2>
      
      <div className="flex flex-wrap gap-3">
        {MUSCLE_GROUPS.map((muscle) => {
          const isActive = selectedMuscleGroup === muscle;
          
          return (
            <button
              key={muscle}
              onClick={() => setSelectedMuscleGroup(muscle)}
              className={`
                px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200
                ${isActive 
                  ? 'bg-white text-black border-[3px] border-black' 
                  : 'bg-white text-gray-300 border border-gray-200 hover:border-gray-400 hover:text-gray-500'
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
