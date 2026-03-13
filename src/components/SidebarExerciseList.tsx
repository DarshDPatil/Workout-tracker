import React from 'react';
import { Plus, GripVertical } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { exerciseDatabase } from '../constants/exerciseDatabase';

interface Exercise {
  id: string;
  name: string;
  type: string;
}

interface DraggableExerciseCardProps {
  exercise: Exercise;
  onAdd: (exercise: Exercise) => void;
}

const DraggableExerciseCard: React.FC<DraggableExerciseCardProps> = ({ exercise, onAdd }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${exercise.id}`,
    data: exercise,
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-black transition-all duration-200 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Dark square icon with grip */}
        <div 
          {...attributes}
          {...listeners}
          className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="text-white/40" size={16} />
        </div>
        
        <div className="flex flex-col">
          <span className="text-sm font-bold text-black leading-tight">
            {exercise.name}
          </span>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mt-0.5">
            {exercise.type}
          </span>
        </div>
      </div>

      <button
        onClick={() => onAdd(exercise)}
        className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white hover:border-black transition-all duration-200 shrink-0"
        aria-label={`Add ${exercise.name}`}
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

interface SidebarExerciseListProps {
  selectedMuscleGroup: string | null;
  onAddExercise: (exercise: Exercise) => void;
  searchQuery?: string;
}

/**
 * SidebarExerciseList Component
 * Displays a list of exercises for a selected muscle group with search support.
 */
const SidebarExerciseList: React.FC<SidebarExerciseListProps> = ({
  selectedMuscleGroup,
  onAddExercise,
  searchQuery = '',
}) => {
  if (!selectedMuscleGroup) return null;

  const allExercises = exerciseDatabase[selectedMuscleGroup.toUpperCase()] || [];
  
  const filteredExercises = allExercises.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredExercises.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-[20px] border-2 border-dashed border-gray-100">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
          {searchQuery ? 'No matches found' : `No exercises for ${selectedMuscleGroup}`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-8">
      {filteredExercises.map((exercise) => (
        <DraggableExerciseCard 
          key={exercise.id} 
          exercise={exercise} 
          onAdd={(ex) => onAddExercise({ ...ex, muscleGroup: selectedMuscleGroup })} 
        />
      ))}
    </div>
  );
};

export default SidebarExerciseList;
