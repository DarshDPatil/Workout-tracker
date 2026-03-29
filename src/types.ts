export interface Exercise {
  id: string;
  name: string;
  type: 'Compound' | 'Isolated';
  category: string;
  muscleGroup: string;
}

export interface WorkoutSet {
  id: string | number;
  reps: number | string;
  weight: number | string;
  completed: boolean;
}

export interface WorkoutExercise extends Exercise {
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  userId: string;
  name?: string;
  date: string;
  muscleGroups: string[];
  exercises: WorkoutExercise[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  stats: {
    dailyStreak: number;
    weightProgress: number;
    totalDays: number;
    xp: number;
    level: number;
  };
  personalRecords: {
    squat: number;
    bench: number;
    deadlift: number;
  };
  currentWeight: number;
  waterIntake: number;
  lastWaterLogDate?: string;
  waterGoalMode: 'auto' | 'manual';
  customWaterGoal?: number;
  weightHistory: { date: string; weight: number }[];
}
