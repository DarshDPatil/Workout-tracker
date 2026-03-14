import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, GripVertical } from 'lucide-react';
import { WorkoutExercise, WorkoutSet } from '../types';
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
        muscleGroups: Array.from(new Set(activeExercises.map(ex => ex.muscleGroup))),
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
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <div className="w-1/3 border-r border-black p-8 overflow-y-auto custom-scrollbar">
          <WorkoutBuilderMenu 
            selectedMuscleGroup={selectedMuscleGroup}
            setSelectedMuscleGroup={handleMuscleSelect}
          />
          
          <div className="mt-8">
            {selectedMuscleGroup && (
            <>
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder={`Search ${selectedMuscleGroup} exercises...`}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <SidebarExerciseList 
                selectedMuscleGroup={selectedMuscleGroup}
                onAddExercise={addExercise}
                searchQuery={searchQuery}
              />

              {/* THE RADAR CHART IS GONE! THE VIDEO PLAYER IS NOW HERE */}
              {exerciseGuides[selectedMuscleGroup.toLowerCase()] && (
                <div className="mt-12 bg-black rounded-[20px] p-6 text-white shadow-xl">
                  <h3 className="text-[12px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-white">
                    <span className="text-xl">📺</span> Form Guide: {exerciseGuides[selectedMuscleGroup.toLowerCase()].name}
                  </h3>
                  
                  <div className="w-full aspect-video rounded-xl overflow-hidden border border-gray-800 mb-6 bg-gray-900">
                    <iframe 
                      className="w-full h-full"
                      src={exerciseGuides[selectedMuscleGroup.toLowerCase()].videoUrl} 
                      title={exerciseGuides[selectedMuscleGroup.toLowerCase()].name}
                      allowFullScreen
                    ></iframe>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Step-by-Step</p>
                    <ol className="list-decimal list-inside text-sm text-gray-200 space-y-2 font-medium">
                      {exerciseGuides[selectedMuscleGroup.toLowerCase()].steps.map((step, index) => (
                        <li key={index} className="leading-relaxed pl-1">{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </>
          )}

          {!selectedMuscleGroup && (
            <div className="flex-1 flex items-center justify-center text-center p-8 bg-black/5 rounded-[20px] border-2 border-dashed border-gray-200 mt-8">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Select a muscle group to view exercises
              </p>
            </div>
          )}
        </div>
      </div>

        <div className="flex-1 relative">
          {selectedMuscleGroup ? (
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
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <div className="max-w-md text-center space-y-6">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto border border-gray-100">
                  <span className="text-4xl">⚠️</span>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Workout Page</h3>
                <p className="text-gray-500 font-medium">
                  Select a muscle group from the sidebar to start logging exercises.
                </p>
                <div className="pt-4">
                  <div className="inline-block px-6 py-2 bg-black/5 rounded-full text-[10px] font-black text-black/40 uppercase tracking-widest">
                    Awaiting Selection
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <DragOverlay>
        {activeDragItem ? (
          <div className="bg-white p-4 rounded-2xl border border-black shadow-2xl flex items-center justify-between w-[300px] opacity-90">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <GripVertical className="text-white/50" size={14} />
              </div>
              <div>
                <p className="font-bold text-sm">{activeDragItem.name}</p>
                <p className="text-[10px] text-gray-400">{activeDragItem.type} movement</p>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}