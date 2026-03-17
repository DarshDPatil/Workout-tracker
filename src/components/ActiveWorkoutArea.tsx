import React, { useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkoutExercise, WorkoutSet } from '../types';
import WorkoutLogger from './WorkoutLogger';

interface ActiveWorkoutAreaProps {
  currentMuscleGroup: string;
  activeExercises: WorkoutExercise[];
  workoutName: string;
  setWorkoutName: (name: string) => void;
  onAddExercise: (ex: any) => void;
  onRemoveExercise: (id: string) => void;
  onUpdateSet: (exerciseId: string, setIndex: number, field: keyof WorkoutSet, value: any) => void;
  onToggleComplete: (exerciseId: string, setIndex: number) => void;
  onAddSet: (exerciseId: string) => void;
  onRemoveSet: (exerciseId: string, setIndex: number) => void;
  onFinish: () => void;
  saving: boolean;
  isOver: boolean;
  dropRef: (element: HTMLElement | null) => void;
}

/**
 * ActiveWorkoutArea Component
 * Handles the display of the current workout session, including exercise list,
 * set/rep tracking, and the ability to add custom exercises on the fly.
 */
const ActiveWorkoutArea: React.FC<ActiveWorkoutAreaProps> = ({
  currentMuscleGroup,
  activeExercises,
  workoutName,
  setWorkoutName,
  onAddExercise,
  onRemoveExercise,
  onUpdateSet,
  onToggleComplete,
  onAddSet,
  onRemoveSet,
  onFinish,
  saving,
  isOver,
  dropRef
}) => {
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');

  const handleAddCustom = () => {
    if (!customName.trim()) return;

    const newId = `custom-${Date.now()}`;
    const newExerciseBlueprint = {
      id: newId,
      name: customName,
      type: 'Compound',
      category: 'Custom',
      muscleGroup: currentMuscleGroup,
      isCustom: true
    };

    onAddExercise({
      ...newExerciseBlueprint,
      sets: [{ id: Date.now(), reps: '', weight: '', completed: false }]
    });

    setCustomName('');
    setIsAddingCustom(false);
  };

  return (
    <div 
      ref={dropRef}
      className={`flex-1 h-full p-6 overflow-y-auto transition-colors custom-scrollbar ${isOver ? 'bg-gray-50' : 'bg-transparent'}`}
    >
      {/* Workout Header & Name Input */}
      <div className="flex flex-row justify-between items-center w-full mb-8 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="space-y-1 pr-8 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Session</span>
          </div>
          <input
            type="text"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            className="text-3xl font-black uppercase bg-transparent border-b-2 border-transparent focus:border-gray-200 focus:outline-none w-full transition-colors text-black tracking-tight"
            placeholder="Workout Name"
          />
        </div>

        <button 
          onClick={onFinish}
          disabled={saving || activeExercises.length === 0}
          className="flex-shrink-0 bg-black px-8 py-4 rounded-2xl text-white text-sm font-black tracking-widest uppercase hover:bg-gray-800 active:scale-95 transition-all shadow-lg shadow-black/20 disabled:opacity-50 disabled:hover:bg-black disabled:active:scale-100 flex items-center gap-3"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Finish Workout'}
        </button>
      </div>

      {/* Active Exercises List */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {activeExercises.map((ex) => (
            <motion.div 
              key={ex.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
            >
              <WorkoutLogger 
                exercise={ex}
                onUpdateSet={onUpdateSet}
                onToggleComplete={onToggleComplete}
                onAddSet={onAddSet}
                onRemoveExercise={onRemoveExercise}
                onRemoveSet={onRemoveSet}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* UI Toggle: Dropzone or Custom Input Form */}
        <div className="mt-8">
          {!isAddingCustom ? (
            <div 
              onClick={() => setIsAddingCustom(true)}
              className="h-32 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gray-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Plus size={20} className="text-gray-400 group-hover:text-black transition-colors" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Add Custom Exercise</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
            >
              <h3 className="text-lg font-black mb-4 uppercase tracking-tight text-black">Custom Exercise</h3>
              <div className="bg-gray-50 rounded-2xl px-6 mb-6 border border-gray-100">
                <input 
                  type="text"
                  autoFocus
                  placeholder={`Name your ${currentMuscleGroup || 'workout'} exercise...`}
                  className="w-full py-4 bg-transparent focus:outline-none text-base font-bold text-black placeholder:text-gray-400"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                />
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={handleAddCustom}
                  className="flex-1 bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-colors text-xs shadow-lg shadow-black/20"
                >
                  Add Exercise
                </button>
                <button 
                  onClick={() => {
                    setIsAddingCustom(false);
                    setCustomName('');
                  }}
                  className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 hover:text-black transition-colors text-xs"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveWorkoutArea;
