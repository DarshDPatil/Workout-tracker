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
      className={`flex-1 p-12 overflow-y-auto transition-colors ${isOver ? 'bg-black/5' : 'bg-[#F5F5F5]'}`}
    >
      {/* Workout Header & Name Input */}
      <div className="flex justify-between items-center mb-12">
        <input
          type="text"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          className="text-5xl font-black uppercase bg-transparent border-b-4 border-transparent focus:border-black focus:outline-none w-2/3"
          placeholder="Enter Workout Name"
        />
        <button 
          onClick={onFinish}
          disabled={saving || activeExercises.length === 0}
          className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-xl font-bold hover:opacity-80 disabled:opacity-30 transition-all"
        >
          {saving ? 'SAVING...' : <><Save size={18} /> FINISH</>}
        </button>
      </div>

      {/* Active Exercises List */}
      <div className="space-y-6">
        <AnimatePresence>
          {activeExercises.map((ex) => (
            <motion.div 
              key={ex.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
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
              className={`h-64 border-2 border-dashed rounded-[20px] flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer ${isOver ? 'border-black text-black bg-black/5' : 'border-gray-200 text-gray-400 hover:border-gray-400'}`}
            >
              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors ${isOver ? 'border-black' : 'border-gray-200'}`}>
                <Plus size={24} />
              </div>
              <p className="text-sm font-medium">click/drag and drop exercise here</p>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-[20px] border-2 border-black card-shadow">
              <h3 className="text-xl font-black mb-4 uppercase">Add Custom Exercise</h3>
              <input 
                type="text"
                autoFocus
                placeholder={`Name your custom ${currentMuscleGroup || 'workout'} exercise...`}
                className="w-full px-6 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none mb-6"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              />
              <div className="flex gap-4">
                <button 
                  onClick={handleAddCustom}
                  className="flex-1 bg-black text-white py-4 rounded-xl font-bold hover:opacity-80 transition-all"
                >
                  ADD
                </button>
                <button 
                  onClick={() => {
                    setIsAddingCustom(false);
                    setCustomName('');
                  }}
                  className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveWorkoutArea;
