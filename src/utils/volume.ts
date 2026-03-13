import { WorkoutExercise } from '../types';

/**
 * Calculates the comprehensive volume for a workout session.
 * Volume = Sum(Weight * Reps) for all completed sets.
 */
export const calculateComprehensiveVolume = (exercises: WorkoutExercise[]): number => {
  return exercises.reduce((totalVolume, exercise) => {
    const exerciseVolume = exercise.sets.reduce((setVolume, set) => {
      if (set.completed) {
        const weight = typeof set.weight === 'string' ? parseFloat(set.weight) || 0 : set.weight;
        const reps = typeof set.reps === 'string' ? parseFloat(set.reps) || 0 : set.reps;
        return setVolume + (weight * reps);
      }
      return setVolume;
    }, 0);
    return totalVolume + exerciseVolume;
  }, 0);
};
