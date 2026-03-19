import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, GripVertical, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkoutExercise, WorkoutSet, UserProfile, WorkoutSession } from '../types';
import { storageService } from '../services/storage';
import { DndContext, DragEndEvent, DragStartEvent, useDroppable, DragOverlay, PointerSensor, useSensor, useSensors, rectIntersection } from '@dnd-kit/core';
import ActiveWorkoutArea from '../components/ActiveWorkoutArea';
import WorkoutBuilderMenu from '../components/WorkoutBuilderMenu';
import SidebarExerciseList from '../components/SidebarExerciseList';

// --- TEACHER REQUIREMENT: EXERCISE VIDEO DATABASE ---
const exerciseGuides: Record<string, { name: string; videoUrl: string; steps: string[] }> = {
  chest: {
    name: "Barbell Bench Press",
    videoUrl: "https://www.youtube.com/embed/rT7DgCr-3pg",
    steps: ["Lie flat on the bench with your eyes under the bar.", "Grip the bar slightly wider than shoulder-width.", "Lower the bar to your mid-chest, then press it back up."]
  },
  back: {
    name: "Barbell Row",
    videoUrl: "https://www.youtube.com/embed/FWJR5Ve8cLA",
    steps: ["Hinge at the hips keeping back straight.", "Pull the bar to your belly button.", "Squeeze your shoulder blades together."]
  },
  shoulders: {
    name: "Overhead Press",
    videoUrl: "https://www.youtube.com/embed/QAQ64hK4Xxs",
    steps: ["Stand with bar at upper chest level.", "Press bar straight up over your head.", "Lock elbows at the top."]
  },
  bicep: {
    name: "Dumbbell Curl",
    videoUrl: "https://www.youtube.com/embed/ykJmrZ5v0Oo",
    steps: ["Hold dumbbells at your sides.", "Keep elbows locked in place.", "Curl weights up to your shoulders."]
  },
  biceps: { // Catching plural
    name: "Dumbbell Curl",
    videoUrl: "https://www.youtube.com/embed/ykJmrZ5v0Oo",
    steps: ["Hold dumbbells at your sides.", "Keep elbows locked in place.", "Curl weights up to your shoulders."]
  },
  triceps: {
    name: "Cable Tricep Pushdown",
    videoUrl: "https://www.youtube.com/embed/2-LAMcpzODU",
    steps: ["Keep elbows tucked tightly to your sides.", "Push the cable down until arms are straight.", "Control the weight on the way back up."]
  },
  quads: {
    name: "Barbell Squat",
    videoUrl: "https://www.youtube.com/embed/gcNh17Ckjgg",
    steps: ["Rest the bar safely on your upper back.", "Squat down keeping your chest up.", "Push through your mid-foot to stand back up."]
  },
  hamstrings: {
    name: "Romanian Deadlift",
    videoUrl: "https://www.youtube.com/embed/JCXUYuzwNrM",
    steps: ["Hold the bar at hip level.", "Push your hips back keeping legs mostly straight.", "Squeeze glutes to return to standing."]
  },
  glutes: {
    name: "Barbell Hip Thrust",
    videoUrl: "https://www.youtube.com/embed/xDoeTFAz-Z4",
    steps: ["Rest upper back on a bench.", "Place barbell across your hips.", "Drive hips toward the ceiling and squeeze."]
  },
  calves: {
    name: "Standing Calf Raise",
    videoUrl: "https://www.youtube.com/embed/-M4-G8p8fmc",
    steps: ["Stand on the edge of a step or plate.", "Lower your heels down.", "Push up onto your toes as high as possible."]
  },
  abs: {
    name: "Cable Crunch",
    videoUrl: "https://www.youtube.com/embed/bBqIktkI10Y",
    steps: ["Kneel below a high cable pulley.", "Hold the rope behind your neck.", "Crunch your torso downwards, contracting your abs."]
  },
  forearms: {
    name: "Wrist Curls",
    videoUrl: "https://www.youtube.com/embed/3Q_zZg0y8yY",
    steps: ["Rest forearms flat on your thighs.", "Let the weight roll down to your fingertips.", "Curl the weight back up using just your wrists."]
  }
};
// --------------------------------------------------------

export default function Workout() {
  const { muscle } = useParams();
  const navigate = useNavigate();
  
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(muscle || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeExercises, setActiveExercises] = useState<WorkoutExercise[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState<any>(null);
  const [workoutName, setWorkoutName] = useState(selectedMuscleGroup ? `${selectedMuscleGroup} Workout` : 'Active Workout');
  const [profile, setProfile] = useState<UserProfile>(storageService.getUserProfile());
  const [history, setHistory] = useState<WorkoutSession[]>(storageService.getHistory());

  useEffect(() => {
    setProfile(storageService.getUserProfile());
    setHistory(storageService.getHistory());
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: 'workout-area',
  });

  const handleMuscleSelect = (m: string) => {
    setSelectedMuscleGroup(m);
    setWorkoutName(`${m} Workout`);
    setActiveExercises([]);
  };

  const addExercise = (ex: any) => {
    if (activeExercises.find(a => a.id === ex.id)) return;
    setActiveExercises([...activeExercises, { 
      ...ex, 
      sets: [{ id: Date.now(), reps: '', weight: '', completed: false }] 
    }]);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragItem(event.active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;
    if (over && over.id === 'workout-area' && activeDragItem) {
      addExercise(activeDragItem);
    }
    setActiveDragItem(null);
  };

  const removeExercise = (id: string) => {
    setActiveExercises(activeExercises.filter(ex => ex.id !== id));
  };

  const updateSet = (exerciseId: string, setIndex: number, field: keyof WorkoutSet, value: any) => {
    setActiveExercises(activeExercises.map(ex => {
      if (ex.id === exerciseId) {
        const newSets = [...ex.sets];
        newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        return { ...ex, sets: newSets };
      }
      return ex;
    }));
  };

  const toggleComplete = (exerciseId: string, setIndex: number) => {
    setActiveExercises(activeExercises.map(ex => {
      if (ex.id === exerciseId) {
        const newSets = [...ex.sets];
        newSets[setIndex] = { ...newSets[setIndex], completed: !newSets[setIndex].completed };
        return { ...ex, sets: newSets };
      }
      return ex;
    }));
  };

  const addSet = (exerciseId: string) => {
    setActiveExercises(activeExercises.map(ex => {
      if (ex.id === exerciseId) {
        return { ...ex, sets: [...ex.sets, { id: Date.now(), reps: '', weight: '', completed: false }] };
      }
      return ex;
    }));
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setActiveExercises(activeExercises.map(ex => {
      if (ex.id === exerciseId) {
        let newSets = ex.sets.filter((_, idx) => idx !== setIndex);
        if (newSets.length === 0) {
          newSets = [{ id: Date.now(), reps: '', weight: '', completed: false }];
        }
        return { ...ex, sets: newSets };
      }
      return ex;
    }));
  };

  const handleFinish = async () => {
    if (activeExercises.length === 0) return;
    setSaving(true);
    try {
      storageService.saveWorkout({
        userId: 'local-user',
        name: workoutName,
        date: new Date().toISOString(),
        muscleGroups: Array.from(new Set(activeExercises.map(ex => ex.muscleGroup).filter(Boolean))) as string[],
        exercises: activeExercises
      });
      navigate('/history');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-transparent m-4 gap-4">
        <div className="w-[380px] p-6 overflow-y-auto custom-scrollbar glass-liquid relative">
          <WorkoutBuilderMenu 
            selectedMuscleGroup={selectedMuscleGroup}
            setSelectedMuscleGroup={handleMuscleSelect}
          />
          
          <div className="mt-8">
            {selectedMuscleGroup && (
            <>
              <div className="relative mb-6 group etched-well px-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600/40 group-focus-within:text-indigo-600 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder={`SEARCH ${selectedMuscleGroup.toUpperCase()} PROTOCOLS...`}
                  className="w-full pl-8 pr-4 py-3.5 bg-transparent focus:outline-none transition-all placeholder:text-slate-400 font-extrabold text-slate-950 dark:text-white text-[10px] tracking-[0.1em] uppercase font-mono"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <SidebarExerciseList 
                selectedMuscleGroup={selectedMuscleGroup}
                onAddExercise={addExercise}
                searchQuery={searchQuery}
              />
            </>
          )}

          {!selectedMuscleGroup && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 glass-liquid-terminal border-2 border-dashed border-black/5 mt-8">
              <div className="w-10 h-10 rounded-[14px] border border-black/5 flex items-center justify-center mb-4">
                <Search size={18} className="text-slate-300" />
              </div>
              <p className="tech-label opacity-40">
                Awaiting Target Uplink
              </p>
            </div>
          )}
        </div>
      </div>

        <div className="flex-1 relative h-full">
          <AnimatePresence mode="wait">
            {selectedMuscleGroup ? (
              <motion.div 
                key={selectedMuscleGroup}
                initial={{ opacity: 0, scale: 0.98, y: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.98, y: -20, filter: 'blur(10px)' }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="h-full flex flex-col"
              >
                <div className="flex-1 overflow-hidden">
                  <ActiveWorkoutArea 
                    currentMuscleGroup={selectedMuscleGroup}
                    activeExercises={activeExercises}
                    workoutName={workoutName}
                    setWorkoutName={setWorkoutName}
                    onAddExercise={addExercise}
                    onRemoveExercise={removeExercise}
                    onUpdateSet={updateSet}
                    onToggleComplete={toggleComplete}
                    onAddSet={addSet}
                    onRemoveSet={removeSet}
                    onFinish={handleFinish}
                    saving={saving}
                    isOver={isOver}
                    dropRef={setDropRef}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="standby"
                initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute inset-0 flex items-center justify-center p-12 glass-liquid-terminal m-4"
              >
                <div className="max-w-md text-center space-y-6">
                  <div className="w-20 h-20 bg-white/5 backdrop-blur-xl rounded-[32px] shadow-2xl flex items-center justify-center mx-auto border border-white/20 ring-1 ring-inset ring-white/20">
                    <Activity className="text-indigo-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-slate-950 dark:text-white">Terminal Standby</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">
                    Select a muscle group from the sidebar to initialize the workout protocol.
                  </p>
                  <div className="pt-4">
                    <div className="inline-block px-6 py-2 bg-indigo-600/10 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-600/20">
                      Awaiting Selection
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <DragOverlay>
        {activeDragItem ? (
          <div className="glass-liquid-terminal p-4 flex items-center justify-between w-[300px] opacity-90 scale-105 shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-600/10 rounded-[12px] flex items-center justify-center border border-indigo-500/20">
                <GripVertical className="text-indigo-600" size={14} />
              </div>
              <div>
                <p className="font-black text-sm text-slate-950 dark:text-white uppercase tracking-tight">{activeDragItem.name}</p>
                <p className="tech-label opacity-60">{activeDragItem.type} Protocol</p>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}