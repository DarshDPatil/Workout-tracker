import React from 'react';
import { MoreHorizontal, Check, Plus, Trash2, X, PlayCircle } from 'lucide-react';
import { WorkoutExercise, WorkoutSet } from '../types';

interface WorkoutLoggerProps {
  exercise: WorkoutExercise;
  onUpdateSet: (exerciseId: string, setIndex: number, field: keyof WorkoutSet, value: any) => void;
  onToggleComplete: (exerciseId: string, setIndex: number) => void;
  onAddSet: (exerciseId: string) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onRemoveSet: (exerciseId: string, setIndex: number) => void;
}

/**
 * WorkoutLogger Component
 * Renders a dynamic workout table for a single exercise.
 */
const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({
  exercise,
  onUpdateSet,
  onToggleComplete,
  onAddSet,
  onRemoveExercise,
  onRemoveSet
}) => {

  // The 300 IQ Auto-YouTube Link Generator
  const openTutorial = () => {
    const searchQuery = encodeURIComponent(`How to do ${exercise.name} exercise tutorial proper form`);
    window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank');
  };

  return (
    <div className="bg-white p-6 rounded-[24px] card-shadow border border-gray-100 mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black uppercase tracking-tight text-black flex items-center gap-3">
          {exercise.name}
          
          {/* NEW DYNAMIC YOUTUBE TUTORIAL BUTTON */}
          <button 
            onClick={openTutorial}
            className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] tracking-widest font-black hover:bg-red-600 hover:text-white transition-all border border-red-100"
            title={`Watch tutorial for ${exercise.name}`}
          >
            <PlayCircle size={14} strokeWidth={2.5} />
            TUTORIAL
          </button>
        </h3>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onRemoveExercise(exercise.id)}
            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
          >
            <Trash2 size={18} />
          </button>
          <button className="p-2 text-gray-300 hover:text-black transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[40px_1fr_80px_80px_40px_40px] gap-4 mb-4 px-2">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Set</span>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Previous</span>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">KG</span>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Reps</span>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Done</span>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center"></span>
      </div>

      {/* Sets List */}
      <div className="space-y-3">
        {exercise.sets.map((set, idx) => (
          <div 
            key={set.id || idx}
            className={`grid grid-cols-[40px_1fr_80px_80px_40px_40px] gap-4 items-center px-2 py-1 rounded-xl transition-colors ${set.completed ? 'bg-emerald-50/50' : ''}`}
          >
            {/* Set Number */}
            <span className="text-xs font-black text-gray-400 text-center">
              {idx + 1}
            </span>

            {/* Previous (Placeholder) */}
            <div className="text-center">
              <span className="text-[11px] font-bold text-gray-300 italic">
                100kg x 8
              </span>
            </div>

            {/* Weight Input */}
            <div className="relative">
              <input
                type="text"
                value={set.weight}
                onChange={(e) => onUpdateSet(exercise.id, idx, 'weight', e.target.value)}
                placeholder="0"
                className="w-full bg-transparent text-center font-black text-sm py-1 border-b border-transparent focus:border-gray-200 focus:outline-none transition-all"
              />
            </div>

            {/* Reps Input */}
            <div className="relative">
              <input
                type="text"
                value={set.reps}
                onChange={(e) => onUpdateSet(exercise.id, idx, 'reps', e.target.value)}
                placeholder="0"
                className="w-full bg-transparent text-center font-black text-sm py-1 border-b border-transparent focus:border-gray-200 focus:outline-none transition-all"
              />
            </div>

            {/* Checkmark Button */}
            <button
              onClick={() => onToggleComplete(exercise.id, idx)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                set.completed 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                  : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
              }`}
            >
              <Check size={16} strokeWidth={3} />
            </button>

            {/* Delete Set Button */}
            <button
              onClick={() => onRemoveSet(exercise.id, idx)}
              className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors"
              title="Remove Set"
            >
              <X size={16} strokeWidth={3} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Set Button */}
      <button
        onClick={() => onAddSet(exercise.id)}
        className="mt-6 w-full py-3 bg-gray-50 rounded-xl text-[11px] font-black text-gray-400 uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
      >
        <Plus size={14} strokeWidth={3} />
        Add Set
      </button>
    </div>
  );
};

export default WorkoutLogger;