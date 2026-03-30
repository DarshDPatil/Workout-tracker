import React, { useState } from 'react';

// Notice we are accepting 'activeFilter' as a prop now
const TacticalCalendar = ({ activeFilter }: { activeFilter: string }) => {
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const [selectedSession, setSelectedSession] = useState<any>(null);

  const today = new Date();
  const currentMonthName = today.toLocaleString('default', { month: 'long' }).toUpperCase();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  let startDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  startDay = startDay === 0 ? 6 : startDay - 1; 

  // --- MOCK DATABASE ---
  // In a real app, this comes from your backend. Note the 'muscleGroups' array!
  const workoutDatabase = {
    12: { type: 'active', title: 'PUSH PROTOCOL', volume: '10,200 KG', muscleGroups: ['CHEST', 'SHOULDERS', 'ARMS'] },
    15: { type: 'pr', title: 'HEAVY DEADLIFTS', volume: '14,500 KG', muscleGroups: ['BACK', 'LEGS'], pr: true },
    24: { type: 'active', title: 'UPPER HYPERTROPHY', volume: '11,100 KG', muscleGroups: ['CHEST', 'BACK', 'ARMS'] },
    28: { type: 'pr', title: 'SQUAT MAX OUT', volume: '8,400 KG', muscleGroups: ['LEGS', 'CORE'], pr: true }
  };

  const calendarGrid = [];
  
  // Empty offset days
  for (let i = 0; i < startDay; i++) {
    calendarGrid.push({ type: 'offset', id: `offset-${i}` });
  }
  
  // Build the days
  for (let day = 1; day <= daysInMonth; day++) {
    let status = 'empty';
    let sessionData = workoutDatabase[day] || null;

    // --- THE FILTER LOGIC ---
    if (sessionData) {
      // If we are viewing 'ALL', or if the day's workout includes the selected muscle...
      if (activeFilter === 'ALL' || sessionData.muscleGroups.includes(activeFilter)) {
        status = sessionData.type; // Make it glow! (active or pr)
      }
    }
    
    calendarGrid.push({ type: 'day', day, status, id: `day-${day}`, data: sessionData });
  }

  const handleSquareClick = (item: any) => {
    if (item.status === 'empty') setSelectedSession(null);
    else setSelectedSession(item);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-10 flex flex-col gap-6">
      
      {/* --- THE MASTER CALENDAR --- */}
      <div className="p-6 bg-white/[0.03] backdrop-blur-[80px] border border-white/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.6),_0_20px_40px_rgba(0,0,0,0.05)] rounded-[32px] ring-1 ring-inset ring-white/10">
        
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
            <h3 className="text-xs font-mono font-black tracking-[0.2em] text-indigo-600 uppercase">
              {currentMonthName} {currentYear} • <span className="text-slate-400">{activeFilter} FILTER</span>
            </h3>
          </div>
        </div>

        {/* ... (Keep the rest of your grid rendering code exactly the same as the previous step) ... */}
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {daysOfWeek.map((day, i) => (
              <div key={`header-${i}`} className="text-center text-[10px] font-mono font-bold text-slate-500/70 dark:text-slate-400">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-3 sm:gap-4">
            {calendarGrid.map((item: any) => {
              if (item.type === 'offset') return <div key={item.id} className="w-full aspect-square opacity-0 pointer-events-none" />;

              let squareClass = "w-full aspect-square rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer flex flex-col items-center justify-center relative ";
              
              if (selectedSession?.id === item.id) squareClass += "ring-2 ring-white ring-offset-2 ring-offset-[#F1F3FF] ";

              if (item.status === 'empty') {
                squareClass += "bg-white/[0.02] border border-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]";
              } else if (item.status === 'active') {
                squareClass += "bg-indigo-500/80 border border-indigo-400/50 shadow-[0_0_12px_rgba(79,70,229,0.5),_inset_0_1px_4px_rgba(255,255,255,0.4)] text-white";
              } else if (item.status === 'pr') {
                squareClass += "bg-emerald-400/90 border border-emerald-300/50 shadow-[0_0_15px_rgba(52,211,153,0.6),_inset_0_1px_4px_rgba(255,255,255,0.6)] text-white";
              }

              return (
                <div key={item.id} className="relative group" onClick={() => handleSquareClick(item)}>
                  <div className={squareClass}>
                    <span className={`text-[10px] font-mono font-bold ${item.status === 'empty' ? 'text-slate-500/40 dark:text-slate-500' : 'text-white/90'}`}>{item.day}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- DYNAMIC SESSION DETAIL SLAB --- */}
      {selectedSession && selectedSession.data && (
        <div className="w-full p-6 animate-in slide-in-from-top-4 fade-in duration-300 bg-white/[0.05] backdrop-blur-[60px] border border-white/40 shadow-[inset_0_2px_8px_rgba(255,255,255,0.7),_0_10px_30px_rgba(0,0,0,0.05)] rounded-[24px] flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-[inset_0_1px_4px_rgba(255,255,255,0.3)]">
               <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {selectedSession.data.title}
                {selectedSession.data.pr && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-sm uppercase tracking-widest align-middle">PR Hit</span>}
              </h2>
              <p className="text-xs font-mono font-bold text-indigo-500 uppercase tracking-widest mt-1">DAY {selectedSession.day} • {selectedSession.data.volume}</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-white/20 dark:bg-white/10 border border-white/40 dark:border-white/20 rounded-full text-xs font-mono font-bold text-slate-800 dark:text-white hover:bg-white/40 dark:hover:bg-white/20 transition-colors shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)] dark:shadow-none">
            VIEW PROTOCOL →
          </button>
        </div>
      )}
    </div>
  );
};

export default TacticalCalendar;