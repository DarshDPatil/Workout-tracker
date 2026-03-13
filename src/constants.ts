import { Exercise } from './types';

export const EXERCISES: Exercise[] = [
  { id: '1', name: 'Flat Dumbbell Benchpress', type: 'Compound', category: 'Free Weight', muscleGroup: 'Chest' },
  { id: '2', name: 'Dumbbell Flyes', type: 'Isolated', category: 'Free Weight', muscleGroup: 'Chest' },
  { id: '3', name: 'Dumbbell Pullovers', type: 'Compound', category: 'Free Weight', muscleGroup: 'Chest' },
  { id: '4', name: 'Decline Barbell Benchpress', type: 'Compound', category: 'Free Weight', muscleGroup: 'Chest' },
  { id: '5', name: 'Incline Barbell Benchpress', type: 'Compound', category: 'Free Weight', muscleGroup: 'Chest' },
  { id: '6', name: 'Incline Dumbbell Flyes', type: 'Isolated', category: 'Free Weight', muscleGroup: 'Chest' },
  { id: '7', name: 'Barbell Benchpress', type: 'Compound', category: 'Free Weight', muscleGroup: 'Chest' },
  { id: '8', name: 'Pec Deck Flies', type: 'Isolated', category: 'Machine', muscleGroup: 'Chest' },
  { id: '9', name: 'Lat Pulldown', type: 'Compound', category: 'Machine', muscleGroup: 'Back' },
  { id: '10', name: 'Seated Row', type: 'Compound', category: 'Machine', muscleGroup: 'Back' },
  { id: '11', name: 'Barbell Squat', type: 'Compound', category: 'Free Weight', muscleGroup: 'Quads' },
  { id: '12', name: 'Leg Extension', type: 'Isolated', category: 'Machine', muscleGroup: 'Quads' },
  { id: '13', name: 'Deadlift', type: 'Compound', category: 'Free Weight', muscleGroup: 'Back' },
  { id: '14', name: 'Overhead Press', type: 'Compound', category: 'Free Weight', muscleGroup: 'Shoulders' },
  { id: '15', name: 'Lateral Raise', type: 'Isolated', category: 'Free Weight', muscleGroup: 'Shoulders' },
  { id: '16', name: 'Bicep Curl', type: 'Isolated', category: 'Free Weight', muscleGroup: 'Bicep' },
  { id: '17', name: 'Tricep Pushdown', type: 'Isolated', category: 'Cables', muscleGroup: 'Triceps' },
];

export const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Bicep', 'Triceps', 'Forearms', 'Abs', 'Quads', 'Hamstrings', 'Glutes', 'Calves'
];
