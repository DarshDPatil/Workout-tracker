import { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { MUSCLE_GROUPS } from '../constants';
import { exerciseDatabase } from '../constants/exerciseDatabase';
import { WorkoutSession } from '../types';
import { ChevronDown, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storageService } from '../services/storage';

export default function History() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMuscle, setSelectedMuscle] = useState('CHEST');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const data = await storageService.getHistory();
      setSessions(data);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  // --- THE FIX: FILTER LOGIC ---
  const filteredSessions = useMemo(() => {
    if (!selectedMuscle) return sessions;
    
    return sessions.filter(session => {
      // Fallback for old saved data where muscleGroups might be empty or undefined
      let groups = (session.muscleGroups && session.muscleGroups.length > 0 
        ? session.muscleGroups 
        : session.exercises.map(ex => ex.muscleGroup)).filter(Boolean) as string[];

      // If still empty, try to infer from exerciseDatabase (optional, but good for robust fallback)
      if (groups.length === 0) {
        const inferredGroups = new Set<string>();
        session.exercises.forEach(ex => {
          for (const [group, exercises] of Object.entries(exerciseDatabase)) {
            if (exercises.some(e => e.name === ex.name)) {
              inferredGroups.add(group.toUpperCase());
              break;
            }
          }
        });
        groups = Array.from(inferredGroups);
      }

      return groups.some(m => {
        if (!m) return false;
        const normalizedM = m.toUpperCase() === 'BICEP' ? 'BICEPS' : m.toUpperCase();
        return normalizedM === selectedMuscle.toUpperCase();
      });
    });
  }, [sessions, selectedMuscle]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    return `${day}/${month}/${year} (${weekday})`;
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <div className="mb-12">
        <h1 className="text-5xl font-black mb-1 tracking-tighter text-slate-950 dark:text-white">WORKOUT HISTORY</h1>
        <p className="text-[10px] font-bold text-indigo-500/60 uppercase tracking-[0.2em]">Historical Data Logs</p>
      </div>

      <div className="flex gap-2 mb-12 overflow-x-auto pb-4 custom-scrollbar">
        {MUSCLE_GROUPS.map(m => {
          const isActive = selectedMuscle === m.toUpperCase();
          return (
            <button 
              key={m}
              onClick={() => setSelectedMuscle(m.toUpperCase())}
              className={`
                px-6 py-3 rounded-[24px] text-[9px] font-bold uppercase tracking-[0.25em] transition-all duration-500 shrink-0
                ${isActive 
                  ? 'mercury-capsule text-white scale-[1.02]' 
                  : 'text-indigo-600/60 border border-white/20 hover:border-white/40 hover:text-indigo-600 bg-white/5 backdrop-blur-md hover:scale-[1.02]'
                }
              `}
            >
              {m.toUpperCase()}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 tech-label opacity-40">Loading history...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20 tech-label opacity-40">No sessions found. Start working out!</div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-20 tech-label opacity-40">
            No {selectedMuscle} workouts recorded yet.
          </div>
        ) : (
          filteredSessions.map(session => (
            <div key={session.id} className="glass-liquid-terminal overflow-hidden transition-all duration-500">
              <button 
                onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
                className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-[14px] bg-black/5 border border-white/10 flex items-center justify-center group-hover:border-indigo-500/30 transition-colors">
                    <Calendar size={18} className="text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-black tracking-tight text-slate-950 dark:text-white uppercase">
                      {session.name || session.muscleGroups.join(' + ')}
                    </p>
                    <p className="tech-label opacity-60">
                      {formatDate(session.date)}
                    </p>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-black/5 border border-white/10 transition-transform duration-500 ${expandedId === session.id ? 'rotate-180 bg-indigo-500/10 border-indigo-500/30 text-indigo-600' : 'text-slate-400'}`}>
                  <ChevronDown size={16} />
                </div>
              </button>

              <AnimatePresence>
                {expandedId === session.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="px-8 pb-8 border-t border-white/10"
                  >
                    <div className="pt-6 space-y-6">
                      {session.exercises.map((ex, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 etched-well">
                          <div>
                            <h4 className="font-black text-sm text-slate-950 dark:text-white uppercase tracking-tight">{ex.name}</h4>
                            <p className="tech-label opacity-60 mt-1">{ex.type} Protocol</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {ex.sets.map((set, sIdx) => (
                              <div key={sIdx} className="bg-white/5 border border-white/10 rounded-[12px] px-3 py-2 text-center min-w-[60px]">
                                <p className="tech-label opacity-60 mb-1">L-{String(sIdx + 1).padStart(2, '0')}</p>
                                <p className="hud-data text-xs">{set.weight}<span className="text-[8px] text-indigo-600 ml-0.5">KG</span> × {set.reps}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
}