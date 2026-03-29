import { useState, useEffect, useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from 'recharts';
import { Plus, Minus, Camera, ImageIcon, Dumbbell, ArrowUp, ArrowDown } from 'lucide-react';
import { storageService } from '../services/storage';
import { UserProfile, WorkoutSession } from '../types';
import { calculateVolumeData } from '../services/volume';
import { exerciseDatabase } from '../constants/exerciseDatabase';
import WaterIntake from '../components/WaterIntake';
import DailyPhotoWidget from '../components/DailyPhotoWidget';

export default function Progress() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [weightHistory, setWeightHistory] = useState<{ date: string; weight: number }[]>([]);
  const [currentWeightInput, setCurrentWeightInput] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      const userProfile = await storageService.getUserProfile();
      setProfile(userProfile);
      const history = await storageService.getHistory();
      setSessions(history);
      setWeightHistory(userProfile.weightHistory || []);
      setCurrentWeightInput(userProfile.currentWeight.toString());
    };
    fetchData();
  }, []);

  const volumeData = useMemo(() => {
    return calculateVolumeData(sessions);
  }, [sessions]);

  const handleWeightSubmit = async () => {
    const weightNum = parseFloat(parseFloat(currentWeightInput).toFixed(2));
    if (isNaN(weightNum)) return;

    const today = new Date().toISOString().split('T')[0];
    const newHistory = [...weightHistory];
    const todayIndex = newHistory.findIndex(h => h.date.split('T')[0] === today);

    if (todayIndex !== -1) {
      newHistory[todayIndex] = { ...newHistory[todayIndex], weight: weightNum };
    } else {
      newHistory.push({ date: new Date().toISOString(), weight: weightNum });
    }

    newHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setWeightHistory(newHistory);
    
    // Add 25 XP for logging weight
    const currentXp = profile?.stats?.xp || 0;
    const newXp = currentXp + 25;
    const newLevel = Math.floor(newXp / 1000) + 1;

    if (profile) {
      const updatedProfile = { 
        ...profile, 
        currentWeight: weightNum, 
        weightHistory: newHistory,
        stats: {
          ...profile.stats,
          xp: newXp,
          level: newLevel
        }
      };
      setProfile(updatedProfile);
      await storageService.saveUserProfile(updatedProfile);
      setCurrentWeightInput(weightNum.toFixed(2));
    }
  };

  const weightTrend = useMemo(() => {
    if (weightHistory.length < 2) return null;
    const latest = weightHistory[weightHistory.length - 1].weight;
    const previous = weightHistory[weightHistory.length - 2].weight;
    const diff = latest - previous;
    return {
      value: Math.abs(diff).toFixed(2),
      isIncrease: diff > 0,
      isNeutral: diff === 0
    };
  }, [weightHistory]);

  if (!profile) return null;

  const prs = profile.personalRecords;
  
  const chartData = weightHistory.map(h => ({
    date: h.date,
    formattedDate: new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(new Date(h.date)),
    weight: h.weight
  }));

  const setPrs = async (newPrs: any) => {
    const updatedProfile = { ...profile, personalRecords: newPrs };
    setProfile(updatedProfile);
    await storageService.saveUserProfile(updatedProfile);
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Main Column (Left 2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Volume Radar Chart */}
          <div className="glass-liquid-terminal p-8 flex flex-col">
            <h2 className="text-3xl font-black mb-8 text-slate-950 dark:text-white uppercase tracking-tighter">Volume</h2>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={volumeData}>
                  <PolarGrid stroke="rgba(255,255,255,0.2)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#4F46E5', fontSize: 10, fontWeight: 900, fontFamily: 'JetBrains Mono' }} />
                  <Radar
                    name="Volume"
                    dataKey="A"
                    stroke="#4F46E5"
                    fill="#4F46E5"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Personal Records */}
          <div className="glass-liquid-terminal p-8">
            <h2 className="text-2xl font-black mb-6 text-slate-950 dark:text-white uppercase tracking-tighter">Personal Records</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Squat', key: 'squat', icon: <Dumbbell size={16} /> },
                { label: 'Benchpress', key: 'bench', icon: <Dumbbell size={16} /> },
                { label: 'Deadlift', key: 'deadlift', icon: <Dumbbell size={16} /> },
              ].map((pr) => (
                <div key={pr.key} className="flex flex-col gap-3 bg-white/5 backdrop-blur-md rounded-[20px] p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600/20 rounded-[10px] flex items-center justify-center text-indigo-600 border border-indigo-500/30">
                      {pr.icon}
                    </div>
                    <p className="tech-label">{pr.label}</p>
                  </div>
                  <div className="flex items-center justify-between etched-well px-3 py-2">
                    <button 
                      onClick={() => setPrs({ ...prs, [pr.key]: Math.max(0, (prs as any)[pr.key] - 1) })}
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={(prs as any)[pr.key]}
                        onChange={(e) => setPrs({ ...prs, [pr.key]: Number(e.target.value) })}
                        className="hud-data text-sm w-12 text-center bg-transparent focus:outline-none"
                      />
                      <span className="font-mono font-bold text-[10px] text-indigo-600 uppercase">kg</span>
                    </div>
                    <button 
                      onClick={() => setPrs({ ...prs, [pr.key]: (prs as any)[pr.key] + 1 })}
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weight Graph (NOW MOVED UP INSIDE MAIN COLUMN) */}
          <div className="glass-liquid-terminal p-0 overflow-hidden flex min-h-[300px]">
            <div className="w-40 bg-white/5 backdrop-blur-md flex flex-col items-center justify-center border-r border-white/10 p-8 relative">
              <h3 className="text-2xl font-black text-center leading-tight text-slate-950 dark:text-white uppercase tracking-tighter">Weight Graph</h3>
              {weightTrend && !weightTrend.isNeutral && (
                <div className={`mt-4 flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${weightTrend.isIncrease ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30' : 'bg-red-500/20 text-red-600 border border-red-500/30'}`}>
                  {weightTrend.isIncrease ? <ArrowUp size={10} strokeWidth={3} /> : <ArrowDown size={10} strokeWidth={3} />}
                  {weightTrend.isIncrease ? '+' : '-'}{weightTrend.value}
                </div>
              )}
            </div>
            <div className="flex-1 p-8 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="formattedDate" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#4F46E5', fontFamily: 'JetBrains Mono' }} 
                    dy={10}
                  />
                  <YAxis 
                    domain={['dataMin - 5', 'dataMax + 5']} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#4F46E5', fontFamily: 'JetBrains Mono' }} 
                    tickFormatter={(val) => val.toFixed(2)}
                    unit="kg" 
                    dx={-10}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${Number(value).toFixed(2)} kg`, "Weight"]}
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: '1px solid rgba(255,255,255,0.2)', 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                      fontWeight: 900,
                      fontSize: '12px',
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      backdropFilter: 'blur(10px)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#4F46E5" 
                    fillOpacity={1} 
                    fill="url(#colorWeight)" 
                    strokeWidth={4}
                    dot={false}
                    activeDot={{ r: 6, fill: '#4F46E5', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Widgets Column (Right Sidebar) */}
        <div className="space-y-8">
          <div className="glass-liquid-terminal p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 dark:text-white">Body Weight</h2>
              {weightTrend && !weightTrend.isNeutral && (
                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${weightTrend.isIncrease ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30' : 'bg-red-500/20 text-red-600 border border-red-500/30'}`}>
                  {weightTrend.isIncrease ? <ArrowUp size={10} strokeWidth={3} /> : <ArrowDown size={10} strokeWidth={3} />}
                  {weightTrend.isIncrease ? '+' : '-'}{weightTrend.value} KG
                </div>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between etched-well px-6 py-4">
                <button 
                  className="p-2 text-slate-400 hover:text-indigo-600 transition-all"
                  onClick={() => setCurrentWeightInput((parseFloat(currentWeightInput) - 0.1).toFixed(2))}
                >
                  <Minus size={18} />
                </button>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={currentWeightInput}
                    onChange={(e) => setCurrentWeightInput(e.target.value)}
                    onBlur={handleWeightSubmit}
                    className="hud-data text-2xl w-24 text-center bg-transparent focus:outline-none"
                  />
                  <span className="font-mono font-bold text-[10px] text-indigo-600 uppercase">kg</span>
                </div>
                <button 
                  className="p-2 text-slate-400 hover:text-indigo-600 transition-all"
                  onClick={() => setCurrentWeightInput((parseFloat(currentWeightInput) + 0.1).toFixed(2))}
                >
                  <Plus size={18} />
                </button>
              </div>
              <button 
                onClick={handleWeightSubmit}
                className="mercury-capsule text-white w-full py-4 font-bold uppercase tracking-[0.25em] text-[10px] hover:scale-[1.02] transition-all"
              >
                Update Weight
              </button>
            </div>
          </div>

          <WaterIntake 
            profile={profile} 
            onUpdate={(updated) => setProfile(updated)} 
          />
          
          <DailyPhotoWidget />
        </div>
      </div>
    </div>
  );
}