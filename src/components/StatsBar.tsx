import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { WorkoutSession, UserProfile } from '../types';

interface StatsBarProps {
  profile: UserProfile;
  history: WorkoutSession[];
}

const StatsBar: React.FC<StatsBarProps> = ({ profile, history }) => {
  const stats = useMemo(() => {
    // 1. Calculate Daily Streak
    const getStreak = () => {
      if (history.length === 0) return 0;

      // Get unique dates in YYYY-MM-DD format
      const workoutDates = new Set(
        history.map(session => new Date(session.date).toISOString().split('T')[0])
      );

      const sortedDates = Array.from(workoutDates).sort((a: string, b: string) => 
        new Date(b).getTime() - new Date(a).getTime()
      );

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      // If no workout today or yesterday, streak is broken
      if (!workoutDates.has(today) && !workoutDates.has(yesterday)) {
        return 0;
      }

      let streak = 0;
      let currentDate = workoutDates.has(today) ? new Date(today) : new Date(yesterday);

      while (true) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (workoutDates.has(dateStr)) {
          streak++;
          // Move to previous day
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }

      return streak;
    };

    // 2. Calculate Weight Progress
    const getWeightProgress = () => {
      const history = profile.weightHistory;
      if (history.length < 2) return { value: 0, trend: 'neutral' };

      const latest = history[history.length - 1].weight;
      const previous = history[history.length - 2].weight;
      const diff = latest - previous;

      return {
        value: Math.abs(diff).toFixed(1),
        trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
        rawDiff: diff
      };
    };

    // 3. Calculate Total Days
    const getTotalDays = () => {
      const uniqueDays = new Set(
        history.map(session => new Date(session.date).toISOString().split('T')[0])
      );
      return uniqueDays.size;
    };

    return {
      streak: getStreak(),
      weight: getWeightProgress(),
      totalDays: getTotalDays()
    };
  }, [history, profile.weightHistory]);

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-black text-white rounded-[20px] p-8 grid grid-cols-3 gap-8 text-center shrink-0 shadow-2xl"
    >
      {/* Daily Streak */}
      <div className="flex flex-col items-center justify-center border-r border-white/10">
        <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-2 text-white/50">
          Daily Streak
        </p>
        <p className="text-4xl font-black">
          {stats.streak}
        </p>
      </div>

      {/* Weight Progress */}
      <div className="flex flex-col items-center justify-center border-r border-white/10">
        <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-2 text-white/50">
          Weight Progress
        </p>
        <div className="flex items-center justify-center gap-3">
          <p className="text-4xl font-black">
            {stats.weight.trend === 'up' ? '+' : stats.weight.trend === 'down' ? '-' : ''}
            {stats.weight.value}
            <span className="text-sm ml-1 opacity-50">KG</span>
          </p>
          {stats.weight.trend !== 'neutral' && (
            <TrendingUp 
              className={`transition-transform duration-500 ${
                stats.weight.trend === 'up' ? 'text-emerald-400' : 'text-red-400 rotate-180'
              }`} 
              size={24} 
              strokeWidth={3}
            />
          )}
        </div>
      </div>

      {/* Total Days */}
      <div className="flex flex-col items-center justify-center">
        <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-2 text-white/50">
          Total Days
        </p>
        <p className="text-4xl font-black">
          {stats.totalDays}
        </p>
      </div>
    </motion.div>
  );
};

export default StatsBar;
