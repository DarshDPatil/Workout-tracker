import { useState, useEffect, useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from 'recharts';
import { Plus, Minus, Camera, ImageIcon, Dumbbell, Save, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'motion/react';
import { storageService } from '../services/storage';
import { UserProfile, WorkoutSession } from '../types';
import { calculateVolumeData } from '../services/volume';
import WaterIntake from '../components/WaterIntake';

export default function Progress() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [weightHistory, setWeightHistory] = useState<{ date: string; weight: number }[]>([]);
  const [currentWeightInput, setCurrentWeightInput] = useState<string>('');

  useEffect(() => {
    const userProfile = storageService.getUserProfile();
    setProfile(userProfile);
    setSessions(storageService.getHistory());
    setWeightHistory(userProfile.weightHistory || []);
    setCurrentWeightInput(userProfile.currentWeight.toString());
  }, []);

  const volumeData = useMemo(() => {
    return calculateVolumeData(sessions);
  }, [sessions]);

  const handleWeightSubmit = () => {
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

    // Sort by date to ensure graph is correct
    newHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setWeightHistory(newHistory);
    if (profile) {
      const updatedProfile = { 
        ...profile, 
        currentWeight: weightNum, 
        weightHistory: newHistory 
      };
      setProfile(updatedProfile);
      storageService.saveUserProfile(updatedProfile);
      setCurrentWeightInput(weightNum.toFixed(2));
    }
  };

  const handleSave = () => {
    if (profile) {
      storageService.saveUserProfile(profile);
      alert('Progress saved locally!');
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
  
  // Format data for Recharts
  const chartData = weightHistory.map(h => ({
    date: h.date,
    formattedDate: new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(new Date(h.date)),
    weight: h.weight
  }));

  const setPrs = (newPrs: any) => setProfile({ ...profile, personalRecords: newPrs });

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Volume Radar Chart */}
          <div className="bg-white rounded-[20px] p-8 card-shadow border border-gray-100 flex flex-col">
            <h2 className="text-3xl font-black mb-8">Volume</h2>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={volumeData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#000', fontSize: 10, fontWeight: 900 }} />
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

          {/* Personal Records (Moved from sidebar) */}
          <div className="bg-white rounded-[20px] p-8 card-shadow border border-gray-100">
            <h2 className="text-2xl font-black mb-6">Personal Records</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Squat', key: 'squat', icon: <Dumbbell size={16} /> },
                { label: 'Benchpress', key: 'bench', icon: <Dumbbell size={16} /> },
                { label: 'Deadlift', key: 'deadlift', icon: <Dumbbell size={16} /> },
              ].map((pr) => (
                <div key={pr.key} className="flex flex-col gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                      {pr.icon}
                    </div>
                    <p className="text-xs font-black uppercase tracking-wider">{pr.label}</p>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                    <button 
                      onClick={() => setPrs({ ...prs, [pr.key]: Math.max(0, (prs as any)[pr.key] - 1) })}
                      className="hover:text-indigo-600 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={(prs as any)[pr.key]}
                        onChange={(e) => setPrs({ ...prs, [pr.key]: Number(e.target.value) })}
                        className="text-sm font-black w-12 text-center bg-transparent focus:outline-none"
                      />
                      <span className="text-[10px] font-black text-gray-400 uppercase">kg</span>
                    </div>
                    <button 
                      onClick={() => setPrs({ ...prs, [pr.key]: (prs as any)[pr.key] + 1 })}
                      className="hover:text-indigo-600 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Widgets Column */}
        <div className="space-y-8">
          {/* Today's Weight */}
          <div className="bg-white rounded-[20px] p-8 card-shadow border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-lg font-black uppercase tracking-tight">Body Weight</h2>
              {weightTrend && !weightTrend.isNeutral && (
                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${weightTrend.isIncrease ? 'bg-emerald-50 text-[#10B981]' : 'bg-red-50 text-[#EF4444]'}`}>
                  {weightTrend.isIncrease ? <ArrowUp size={10} strokeWidth={3} /> : <ArrowDown size={10} strokeWidth={3} />}
                  {weightTrend.isIncrease ? '+' : '-'}{weightTrend.value} KG
                </div>
              )}
              {weightTrend?.isNeutral && (
                <div className="text-[10px] font-black px-2 py-1 rounded-lg bg-gray-100 text-gray-400">
                  STABLE
                </div>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-6 py-4 border border-gray-100">
                <button 
                  className="p-2 hover:bg-white rounded-lg transition-all"
                  onClick={() => {
                    const newVal = (parseFloat(currentWeightInput) - 0.1).toFixed(2);
                    setCurrentWeightInput(newVal);
                  }}
                >
                  <Minus size={18} />
                </button>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={currentWeightInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
                        setCurrentWeightInput(val);
                      }
                    }}
                    onBlur={handleWeightSubmit}
                    onKeyDown={(e) => e.key === 'Enter' && handleWeightSubmit()}
                    className="font-black text-2xl w-24 text-center bg-transparent focus:outline-none"
                  />
                  <span className="font-black text-sm text-gray-400 uppercase">kg</span>
                </div>
                <button 
                  className="p-2 hover:bg-white rounded-lg transition-all"
                  onClick={() => {
                    const newVal = (parseFloat(currentWeightInput) + 0.1).toFixed(2);
                    setCurrentWeightInput(newVal);
                  }}
                >
                  <Plus size={18} />
                </button>
              </div>
              <button 
                onClick={handleWeightSubmit}
                className="bg-black text-white w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
              >
                Update Weight
              </button>
            </div>
          </div>

          {/* Water Intake */}
          <WaterIntake 
            profile={profile} 
            onUpdate={(updated) => setProfile(updated)} 
          />
          
          {/* Today's Pic */}
          <div className="bg-white rounded-[20px] p-8 card-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black uppercase tracking-tight">Today's Pic</h2>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-black hover:text-white transition-all border border-gray-100">
                  <ImageIcon size={18} />
                </button>
                <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-black hover:text-white transition-all border border-gray-100">
                  <Camera size={18} />
                </button>
              </div>
            </div>
            <div className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Camera size={32} strokeWidth={1.5} />
              <p className="text-[10px] font-black uppercase tracking-widest">No Photo Yet</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weight Graph */}
      <div className="bg-white rounded-[20px] p-0 card-shadow border border-gray-100 overflow-hidden flex">
        <div className="w-40 bg-gray-50 flex flex-col items-center justify-center border-r border-gray-100 p-8 relative">
          <h3 className="text-2xl font-black text-center leading-tight">Weight Graph</h3>
          {weightTrend && !weightTrend.isNeutral && (
            <div className={`mt-4 flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${weightTrend.isIncrease ? 'bg-[#10B981] text-white' : 'bg-[#EF4444] text-white'}`}>
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
                  <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis 
                dataKey="formattedDate" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 900, fill: '#9CA3AF' }} 
                dy={10}
              />
              <YAxis 
                domain={['dataMin - 5', 'dataMax + 5']} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 900, fill: '#9CA3AF' }} 
                tickFormatter={(val) => val.toFixed(2)}
                unit="kg" 
                dx={-10}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)} kg`, "Weight"]}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontWeight: 900,
                  fontSize: '12px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="weight" 
                stroke="#000000" 
                fillOpacity={1} 
                fill="url(#colorWeight)" 
                strokeWidth={4}
                dot={false}
                activeDot={{ r: 6, fill: '#000000', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
