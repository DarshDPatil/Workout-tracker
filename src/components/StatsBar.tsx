import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { WorkoutSession, UserProfile } from '../types';

interface StatsBarProps {
  profile: UserProfile;
  history: WorkoutSession[];
  variant?: 'default' | 'liquid';
}

const StatsBar: React.FC<StatsBarProps> = ({ profile, history, variant = 'liquid' }) => {
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

  if (variant === 'default') {
    return (
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="glass-liquid flex justify-between items-center p-5 shrink-0"
      >
        {/* Daily Streak */}
        <div className="flex flex-col items-center justify-center border-r border-white/10 flex-1 h-full">
          <span className="tech-label mb-1">Daily Streak</span>
          <div className="flex items-baseline gap-1">
            <span className="hud-data text-3xl">{stats.streak}</span>
            <span className="font-mono font-bold text-[9px] text-indigo-600 uppercase">DAYS</span>
          </div>
        </div>

        {/* Weight Progress */}
        <div className="flex flex-col items-center justify-center border-r border-white/10 flex-1 h-full">
          <span className="tech-label mb-1">Weight Progress</span>
          <div className="flex items-center gap-2">
            <div className="flex items-baseline gap-0.5">
              <span className="hud-data text-3xl">
                {stats.weight.trend === 'up' ? '+' : stats.weight.trend === 'down' ? '-' : ''}
                {stats.weight.value}
              </span>
              <span className="font-mono font-bold text-[9px] text-indigo-600 uppercase">KG</span>
            </div>
            {stats.weight.trend !== 'neutral' && (
              <div className={`flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.2)] ${stats.weight.trend === 'down' ? 'bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : ''}`}>
                <TrendingUp 
                  size={12} 
                  className={`${stats.weight.trend === 'up' ? 'text-emerald-500' : 'text-red-500 rotate-180'}`} 
                  strokeWidth={3} 
                />
              </div>
            )}
          </div>
        </div>

        {/* Total Days */}
        <div className="flex flex-col items-center justify-center flex-1 h-full">
          <span className="tech-label mb-1">Total Days</span>
          <div className="flex items-baseline gap-1">
            <span className="hud-data text-3xl">{stats.totalDays}</span>
            <span className="font-mono font-bold text-[9px] text-indigo-600 uppercase">SESSIONS</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="flex justify-around items-center w-full max-w-6xl py-8 bg-white/[0.03] backdrop-blur-[80px] border border-white/30 shadow-[inset_0_2px_12px_rgba(255,255,255,0.5)] shadow-2xl rounded-[40px]"
    >
      {/* Daily Streak */}
      <div className="flex flex-col items-center justify-center flex-1">
        <span className="font-mono font-bold text-indigo-600 uppercase text-xs tracking-widest mb-2">Daily Streak</span>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl text-slate-950 dark:text-white font-bold">{stats.streak}</span>
          <span className="font-mono font-bold text-xs text-slate-500 dark:text-slate-400 uppercase translate-y-1">DAYS</span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-16 bg-white/10"></div>

      {/* Weight Progress */}
      <div className="flex flex-col items-center justify-center flex-1">
        <span className="font-mono font-bold text-indigo-600 uppercase text-xs tracking-widest mb-2">Weight Progress</span>
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl text-slate-950 dark:text-white font-bold">
              {stats.weight.trend === 'up' ? '+' : stats.weight.trend === 'down' ? '-' : ''}
              {stats.weight.value}
            </span>
            <span className="font-mono font-bold text-xs text-slate-500 dark:text-slate-400 uppercase translate-y-1">KG</span>
          </div>
          {stats.weight.trend !== 'neutral' && (
            <div className={`w-2.5 h-2.5 rounded-full ${stats.weight.trend === 'down' ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]' : 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]'}`} />
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-16 bg-white/10"></div>

      {/* Total Days */}
      <div className="flex flex-col items-center justify-center flex-1">
        <span className="font-mono font-bold text-indigo-600 uppercase text-xs tracking-widest mb-2">Total Days</span>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl text-slate-950 dark:text-white font-bold">{stats.totalDays}</span>
          <span className="font-mono font-bold text-xs text-slate-500 dark:text-slate-400 uppercase translate-y-1">SESSIONS</span>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsBar;
