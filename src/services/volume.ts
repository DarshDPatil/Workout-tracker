import { WorkoutSession } from '../types';

export const EXERCISE_MUSCLE_MAP: Record<string, Record<string, number>> = {
  "Flat Dumbbell Benchpress": { CHEST: 1.0, TRICEPS: 0.4, SHOULDERS: 0.4 },
  "Dumbbell Flyes": { CHEST: 1.0 },
  "Dumbbell Pullovers": { CHEST: 0.6, BACK: 0.6 },
  "Decline Barbell Benchpress": { CHEST: 1.0, TRICEPS: 0.4 },
  "Incline Barbell Benchpress": { CHEST: 1.0, SHOULDERS: 0.6, TRICEPS: 0.4 },
  "Incline Dumbbell Flyes": { CHEST: 1.0 },
  "Barbell Benchpress": { CHEST: 1.0, TRICEPS: 0.5, SHOULDERS: 0.5 },
  "Pec Deck Flies": { CHEST: 1.0 },
  "Lat Pulldown": { BACK: 1.0, BICEPS: 0.4 },
  "Seated Row": { BACK: 1.0, BICEPS: 0.4, FOREARMS: 0.2 },
  "Barbell Squat": { QUADS: 1.0, GLUTES: 0.6, HAMSTRINGS: 0.4, ABS: 0.2 },
  "Leg Extension": { QUADS: 1.0 },
  "Deadlift": { BACK: 0.8, HAMSTRINGS: 1.0, GLUTES: 1.0, FOREARMS: 0.5, QUADS: 0.4 },
  "Overhead Press": { SHOULDERS: 1.0, TRICEPS: 0.4 },
  "Lateral Raise": { SHOULDERS: 1.0 },
  "Bicep Curl": { BICEPS: 1.0, FOREARMS: 0.2 },
  "Tricep Pushdown": { TRICEPS: 1.0 },
  "Crunches": { ABS: 1.0 },
  "Standing Calf Raises": { CALVES: 1.0 }
};

// BUG FIX #1: Updated axes to perfectly match your exerciseDatabase terminology
export const RADAR_AXES = [
  "CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS", 
  "FOREARMS", "ABS", "QUADS", "HAMSTRINGS", "GLUTES", "CALVES"
];

export function calculateVolumeData(sessions: WorkoutSession[]) {
  // Filter sessions from the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentSessions = sessions.filter(session => new Date(session.date) >= sevenDaysAgo);

  // Initialize all volumes to 0
  const rawVolume: Record<string, number> = {};
  RADAR_AXES.forEach(muscle => rawVolume[muscle] = 0);

  // Calculate raw volume based on user's logged sets
  recentSessions.forEach(session => {
    session.exercises.forEach(ex => {
      // Only count sets that were actually completed!
      const completedSets = ex.sets.filter(s => s.completed).length;
      if (completedSets === 0) return;

      const multipliers = EXERCISE_MUSCLE_MAP[ex.name];
      
      // BUG FIX #2: The Fallback System
      if (multipliers) {
        // If it's in the special map, allocate volume to primary and secondary muscles
        for (const [muscle, percentage] of Object.entries(multipliers)) {
          // Safety check to handle old saved data
          let mappedMuscle = muscle.toUpperCase();
          if (mappedMuscle === "THIGHS") mappedMuscle = "QUADS";
          if (mappedMuscle === "HAMSTRING") mappedMuscle = "HAMSTRINGS";

          if (rawVolume[mappedMuscle] !== undefined) {
            rawVolume[mappedMuscle] += (completedSets * percentage);
          }
        }
      } else {
        // If it's NOT in the map (95% of exercises), just give 100% volume to its primary muscle group!
        let primaryMuscle = (ex.muscleGroup || "").toUpperCase();
        if (primaryMuscle === "THIGHS") primaryMuscle = "QUADS";
        if (primaryMuscle === "HAMSTRING") primaryMuscle = "HAMSTRINGS";

        if (rawVolume[primaryMuscle] !== undefined) {
          rawVolume[primaryMuscle] += completedSets;
        }
      }
    });
  });

  // Normalize data to a 0-100 scale (Assuming 20 sets is max/optimal volume)
  const MAX_OPTIMAL_SETS = 20;
  
  return RADAR_AXES.map(muscle => {
    const rawScore = rawVolume[muscle];
    // Calculate percentage and cap it at 100%
    const percentage = Math.min((rawScore / MAX_OPTIMAL_SETS) * 100, 100);
    
    return {
      subject: muscle,
      A: Math.round(percentage),
      fullMark: 100
    };
  });
}