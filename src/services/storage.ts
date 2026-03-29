import { WorkoutSession, UserProfile } from '../types';
import { db, auth } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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
  // User Profile & Stats
  getUserProfile: async (): Promise<UserProfile> => {
    const user = auth.currentUser;
    if (!user) return DEFAULT_USER;

    const path = `users/${user.uid}`;
    const docRef = doc(db, 'users', user.uid);
    try {
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      } else {
        const newUserProfile = { ...DEFAULT_USER, uid: user.uid, email: user.email || '' };
        await setDoc(docRef, newUserProfile);
        return newUserProfile;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return DEFAULT_USER; // Fallback
    }
  },
  saveUserProfile: async (profile: UserProfile) => {
    const user = auth.currentUser;
    if (!user) return;
    const path = `users/${user.uid}`;
    const docRef = doc(db, 'users', user.uid);
    try {
      await setDoc(docRef, profile, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Workout History
  getHistory: async (): Promise<WorkoutSession[]> => {
    const user = auth.currentUser;
    if (!user) return [];

    const path = `users/${user.uid}/workouts`;
    const q = query(collection(db, path), orderBy('date', 'desc'));
    try {
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as WorkoutSession[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return []; // Fallback
    }
  },
  saveWorkout: async (session: Omit<WorkoutSession, 'id'>) => {
    const user = auth.currentUser;
    if (!user) return null;

    const path = `users/${user.uid}/workouts`;
    const workoutsRef = collection(db, path);
    try {
      const docRef = await addDoc(workoutsRef, session);
      return { ...session, id: docRef.id };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return null;
    }
  }
};
