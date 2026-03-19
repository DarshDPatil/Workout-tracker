import React from 'react';
import { Plus, GripVertical, Activity } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'motion/react';
import { exerciseDatabase } from '../constants/exerciseDatabase';

interface Exercise {
  id: string;
  name: string;
  type: string;
  muscleGroup?: string | null;
}

interface DraggableExerciseCardProps {
  exercise: Exercise;
  onAdd: (exercise: Exercise) => void;
  index: number;
}

const DraggableExerciseCard: React.FC<DraggableExerciseCardProps> = ({ exercise, onAdd, index }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${exercise.id}`,
    data: { ...exercise, muscleGroup: exercise.muscleGroup },
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 28,
        delay: index * 0.05 
      }}
      ref={setNodeRef}
      className={`flex items-center gap-4 p-4 bg-white/10 backdrop-blur-[40px] border border-white/20 rounded-[28px] shadow-xl hover:bg-white/20 transition-all group relative overflow-hidden ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={{
        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.4), 0 10px 20px rgba(0,0,0,0.1)'
      }}
    >
      {/* Refractive Glass Tile Icon */}
      <div 
        {...attributes}
        {...listeners}
        className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-[18px] flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing shadow-inner group-hover:border-white/40 transition-all"
      >
        <Activity className="text-indigo-600/60 group-hover:text-indigo-600 transition-colors" size={18} />
      </div>
      
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-bold text-slate-950 dark:text-white tracking-tight truncate">
          {exercise.name}
        </span>
        <span className="font-mono text-indigo-600 font-black uppercase text-[9px] tracking-[0.1em] mt-0.5">
          {exercise.type}
        </span>
      </div>

      <button
        onClick={() => onAdd(exercise)}
        className="w-10 h-6 rounded-[12px] bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-500/40 hover:shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all shrink-0"
        aria-label={`Add ${exercise.name}`}
      >
        <Plus size={14} strokeWidth={3} />
      </button>
    </motion.div>
  );
};

interface SidebarExerciseListProps {
  selectedMuscleGroup: string | null;
  onAddExercise: (exercise: Exercise) => void;
  searchQuery?: string;
}

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
      <div className="p-8 text-center bg-white/5 backdrop-blur-md rounded-[24px] border border-dashed border-black/5">
        <p className="tech-label opacity-40">
          {searchQuery ? 'No matches found' : `No exercises for ${selectedMuscleGroup}`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-8">
      {filteredExercises.map((exercise, idx) => (
        <DraggableExerciseCard 
          key={exercise.id} 
          exercise={{ ...exercise, muscleGroup: selectedMuscleGroup }} 
          index={idx}
          onAdd={(ex) => onAddExercise({ ...ex, muscleGroup: selectedMuscleGroup })} 
        />
      ))}
    </div>
  );
};

export default SidebarExerciseList;
