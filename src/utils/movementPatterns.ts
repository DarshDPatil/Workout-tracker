import { WorkoutExercise } from '../types';

export type MovementPattern = 
  | 'HORIZONTAL_PUSH' 
  | 'VERTICAL_PUSH' 
  | 'HORIZONTAL_PULL' 
  | 'VERTICAL_PULL' 
  | 'KNEE_DOMINANT' 
  | 'HIP_DOMINANT' 
  | 'ISOLATION';

export const MUSCLE_GROUPS = [
  'CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 
  'QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES', 'ABS', 'FOREARMS'
] as const;

export type MuscleGroup = typeof MUSCLE_GROUPS[number];

export const MOVEMENT_DISTRIBUTION: Record<MovementPattern, Partial<Record<MuscleGroup, number>>> = {
  HORIZONTAL_PUSH: { CHEST: 0.80, TRICEPS: 0.15, SHOULDERS: 0.05 },
  VERTICAL_PUSH: { SHOULDERS: 0.80, TRICEPS: 0.15, CHEST: 0.05 },
  HORIZONTAL_PULL: { BACK: 0.80, BICEPS: 0.15, FOREARMS: 0.05 },
  VERTICAL_PULL: { BACK: 0.80, BICEPS: 0.15, FOREARMS: 0.05 },
  KNEE_DOMINANT: { QUADS: 0.80, GLUTES: 0.15, CALVES: 0.05 },
  HIP_DOMINANT: { HAMSTRINGS: 0.80, GLUTES: 0.15, BACK: 0.05 },
  ISOLATION: {} // Handled dynamically based on target muscle
};

/**
 * Maps an exercise to a movement pattern.
 * In a real app, this would be part of the exercise database.
 */
export const getMovementPattern = (exerciseName: string, muscleGroup: string): MovementPattern => {
  const name = (exerciseName || '').toLowerCase();
  const muscle = (muscleGroup || '').toUpperCase();

  if (name.includes('bench press') || name.includes('push-up') || name.includes('chest press')) return 'HORIZONTAL_PUSH';
  if (name.includes('overhead press') || name.includes('shoulder press') || name.includes('arnold press')) return 'VERTICAL_PUSH';
  if (name.includes('row')) return 'HORIZONTAL_PULL';
  if (name.includes('pulldown') || name.includes('pull-up') || name.includes('chin-up')) return 'VERTICAL_PULL';
  if (name.includes('squat') || name.includes('leg press') || name.includes('lunge')) return 'KNEE_DOMINANT';
  if (name.includes('deadlift') || name.includes('hip thrust') || name.includes('good morning')) return 'HIP_DOMINANT';
  
  return 'ISOLATION';
};
