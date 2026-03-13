import { WorkoutSession, UserProfile } from '../types';

const STORAGE_KEYS = {
  USER: 'momentum_user',
  HISTORY: 'momentum_history',
  AUTH: 'momentum_auth_user'
};

const DEFAULT_USER: UserProfile = {
  uid: 'local-user',
  email: 'user@example.com',
  stats: {
    dailyStreak: 13,
    weightProgress: 0.5,
    totalDays: 44,
  },
  personalRecords: {
    squat: 135,
    bench: 100,
    deadlift: 180,
  },
  currentWeight: 55.3,
  waterIntake: 2.5,
  lastWaterLogDate: new Date().toISOString().split('T')[0],
  waterGoalMode: 'auto',
  customWaterGoal: 3.0,
  weightHistory: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
    weight: 50 + Math.random() * 5 + (i * 0.1)
  }))
};

export const storageService = {
  // Auth
  getAuthUser: () => {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH);
    return data ? JSON.parse(data) : null;
  },
  setAuthUser: (user: any) => {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  },

  // User Profile & Stats
  getUserProfile: (): UserProfile => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : DEFAULT_USER;
  },
  saveUserProfile: (profile: UserProfile) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
  },

  // Workout History
  getHistory: (): WorkoutSession[] => {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  },
  saveWorkout: (session: Omit<WorkoutSession, 'id'>) => {
    const history = storageService.getHistory();
    const newSession = { ...session, id: Math.random().toString(36).substr(2, 9) };
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([newSession, ...history]));
    return newSession;
  }
};
