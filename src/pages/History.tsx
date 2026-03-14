import { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { MUSCLE_GROUPS } from '../constants';
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
    const fetchHistory = () => {
      const data = storageService.getHistory();
      setSessions(data);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  // --- THE FIX: FILTER LOGIC ---
  const filteredSessions = useMemo(() => {
    if (!selectedMuscle) return sessions;
    
    return sessions.filter(session => 
      session.muscleGroups.some(m => m.toUpperCase() === selectedMuscle.toUpperCase())
    );
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
      <h1 className="text-5xl font-black mb-4">WORKOUT HISTORY</h1>
      <h2 className="text-2xl font-black italic mb-8">Select Muscle Group</h2>

      <div className="flex gap-2 mb-12 overflow-x-auto pb-4 no-scrollbar">
        {MUSCLE_GROUPS.map(m => (
          <button 
            key={m}
            onClick={() => setSelectedMuscle(m.toUpperCase())}
            className={`px-6 py-2 rounded-full text-[10px] font-bold transition-all ${
              selectedMuscle === m.toUpperCase() ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-400 hover:border-black hover:text-black'
            }`}
          >
            {m.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading history...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No sessions found. Start working out!</div>
        ) : filteredSessions.length === 0 ? (
          /* Added a specific message if a muscle has no workouts */
          <div className="text-center py-20 text-gray-400 uppercase font-black italic">
            No {selectedMuscle} workouts recorded yet.
          </div>
        ) : (
          /* Mapped over filteredSessions instead of sessions */
          filteredSessions.map(session => (
            <div key={session.id} className="bg-white rounded-[20px] card-shadow border border-gray-100 overflow-hidden">
              <button 
                onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
                className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Calendar size={18} className="text-gray-300" />
                  <p className="text-lg font-black italic">
                    {formatDate(session.date)} - <span className="text-black uppercase">{session.name || session.muscleGroups.join(' + ')}</span>
                  </p>
                </div>
                <ChevronDown className={`transition-transform ${expandedId === session.id ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {expandedId === session.id && (
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="px-8 pb-8 border-t border-gray-50"
                  >
                    <div className="pt-6 space-y-6">
                      {session.exercises.map((ex, idx) => (
                        <div key={idx} className="flex justify-between items-start">
                          <div>
                            <h4 className="font-black text-sm">{ex.name}</h4>
                            <p className="text-[10px] text-gray-400">{ex.type} movement</p>
                          </div>
                          <div className="flex gap-4">
                            {ex.sets.map((set, sIdx) => (
                              <div key={sIdx} className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Set {sIdx + 1}</p>
                                <p className="text-xs font-black">{set.weight}kg x {set.reps}</p>
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