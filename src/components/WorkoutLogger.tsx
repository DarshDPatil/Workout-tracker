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
    <div className="glass-liquid-terminal mb-6 overflow-hidden relative group">
      {/* Header / HUD Title */}
      <div className="p-5 flex justify-between items-center border-b border-black/5 relative overflow-hidden">
        <div className="space-y-0.5">
          <h3 className="text-xl font-black tracking-tighter text-slate-950 dark:text-white flex items-center gap-3 uppercase">
            {exercise.name}
          </h3>
          <div className="flex items-center gap-2">
            <div className="led-indigo animate-pulse" />
            <p className="tech-label">
              {exercise.type || 'Compound'} Protocol
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={openTutorial}
            className="flex items-center gap-2 px-6 py-2.5 mercury-capsule text-white rounded-[16px] text-[9px] tracking-[0.25em] font-bold hover:scale-[1.02] transition-all"
          >
            <PlayCircle size={12} strokeWidth={3} />
            TUTORIAL
          </button>
          <button 
            onClick={() => onRemoveExercise(exercise.id)}
            className="p-2.5 mercury-capsule text-white rounded-[12px] hover:scale-[1.05] transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* HUD Content */}
      <div className="p-5 space-y-1">
        {/* HUD Header */}
        <div className="grid grid-cols-[60px_1fr_100px_100px_80px_40px] gap-3 mb-4 px-4">
          <span className="tech-label">SET</span>
          <span className="tech-label">PREV</span>
          <div className="flex items-center justify-center gap-1">
            <span className="tech-label">WEIGHT</span>
            <span className="font-mono font-bold text-[8px] text-indigo-600 uppercase">KG</span>
          </div>
          <span className="tech-label text-center">REPS</span>
          <span className="tech-label text-center">STATUS</span>
          <span className="tech-label text-center"></span>
        </div>

        {/* Sets List */}
        <div className="space-y-1">
          {exercise.sets.map((set, idx) => (
            <div 
              key={set.id || idx}
              className={`grid grid-cols-[60px_1fr_100px_100px_80px_40px] gap-3 items-center px-4 py-3 transition-all border-b border-black/5 rounded-[20px] ${set.completed ? 'bg-indigo-500/5' : ''}`}
            >
              {/* Set Index */}
              <span className="font-mono font-bold text-[11px] text-slate-400">
                L-{String(idx + 1).padStart(2, '0')}
              </span>

              {/* Historical Data */}
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[10px] text-indigo-600/60 uppercase tracking-tight">
                  PREV: <span className="text-indigo-600">125.5 KG @ 12</span>
                </span>
              </div>

              {/* Weight Input (Etched Well) */}
              <div className="etched-well px-2">
                <input
                  type="text"
                  value={set.weight}
                  onChange={(e) => onUpdateSet(exercise.id, idx, 'weight', e.target.value)}
                  placeholder="000.0"
                  className="w-full bg-transparent text-center font-mono font-extrabold text-sm py-2 focus:outline-none placeholder:text-slate-300 text-slate-950 dark:text-white"
                />
              </div>

              {/* Reps Input (Etched Well) */}
              <div className="etched-well px-2">
                <input
                  type="text"
                  value={set.reps}
                  onChange={(e) => onUpdateSet(exercise.id, idx, 'reps', e.target.value)}
                  placeholder="00"
                  className="w-full bg-transparent text-center font-mono font-extrabold text-sm py-2 focus:outline-none placeholder:text-slate-300 text-slate-950 dark:text-white"
                />
              </div>

              {/* Mercury Toggle */}
              <div className="flex justify-center">
                <button
                  onClick={() => onToggleComplete(exercise.id, idx)}
                  className={`w-12 h-7 rounded-[14px] p-1 transition-all duration-500 relative ring-1 ring-black/5 ${
                    set.completed 
                      ? 'mercury-capsule' 
                      : 'bg-black/5 backdrop-blur-md'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-[10px] bg-white shadow-xl transition-all duration-500 ${set.completed ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Delete Set */}
              <button
                onClick={() => onRemoveSet(exercise.id, idx)}
                className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors"
              >
                <X size={16} strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>

        {/* Add Set Button */}
        <button
          onClick={() => onAddSet(exercise.id)}
          className="mt-6 w-full py-5 border border-dashed border-black/10 rounded-[28px] tech-label hover:border-indigo-500/20 hover:bg-white/5 transition-all flex items-center justify-center gap-3 group bg-white/[0.02] backdrop-blur-md"
        >
          <div className="w-8 h-8 rounded-[12px] bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform shadow-lg">
            <Plus size={14} strokeWidth={3} />
          </div>
          APPEND DATA STREAM
        </button>
      </div>
    </div>
  );
};

export default WorkoutLogger;