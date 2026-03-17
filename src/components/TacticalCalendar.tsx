import React, { useState } from 'react';

const TacticalCalendar = ({ activeFilter }: { activeFilter: string | null }) => {
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const [confirmModal, setConfirmModal] = useState<any>(null);

  const today = new Date();
  const currentMonthName = today.toLocaleString('default', { month: 'long' }).toUpperCase();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  let startDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  startDay = startDay === 0 ? 6 : startDay - 1; 

  // --- REALISTIC MOCK DATABASE ---
  const workoutDatabase = {
    1: { type: 'active', title: 'HYPERTROPHY PUSH', volume: '11,200 KG', muscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'] },
    2: { type: 'active', title: 'HEAVY PULL', volume: '13,500 KG', muscleGroups: ['BACK', 'BICEPS', 'FOREARMS'] },
    3: { type: 'active', title: 'LOWER VOLUME', volume: '15,000 KG', muscleGroups: ['QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES', 'ABS'] },
    5: { type: 'pr', title: 'POWER PUSH (BENCH PR)', volume: '12,100 KG', muscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'], pr: true },
    6: { type: 'active', title: 'BACK THICKNESS', volume: '12,800 KG', muscleGroups: ['BACK', 'BICEPS', 'FOREARMS'] },
    7: { type: 'active', title: 'LEG DAY HELL', volume: '16,200 KG', muscleGroups: ['QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES'] },
    9: { type: 'active', title: 'SHOULDER / CHEST FOCUS', volume: '10,900 KG', muscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'] },
    10: { type: 'pr', title: 'DEADLIFT MAX OUT', volume: '14,800 KG', muscleGroups: ['BACK', 'HAMSTRINGS', 'FOREARMS'], pr: true },
    11: { type: 'active', title: 'SQUAT DYNAMICS', volume: '13,100 KG', muscleGroups: ['QUADS', 'GLUTES', 'CALVES', 'ABS'] },
    13: { type: 'active', title: 'UPPER POWER', volume: '14,000 KG', muscleGroups: ['CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS'] },
    14: { type: 'active', title: 'ARM DAY ISOLATION', volume: '8,500 KG', muscleGroups: ['BICEPS', 'TRICEPS', 'FOREARMS'] },
    15: { type: 'pr', title: 'HEAVY LEGS (SQUAT PR)', volume: '17,500 KG', muscleGroups: ['QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES'], pr: true },
    17: { type: 'active', title: 'FULL BODY DELOAD', volume: '9,000 KG', muscleGroups: ['CHEST', 'BACK', 'QUADS', 'ABS'] },
  };

  const calendarGrid = [];
  
  for (let i = 0; i < startDay; i++) {
    calendarGrid.push({ type: 'offset', id: `offset-${i}` });
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    let status = 'empty';
    let sessionData = workoutDatabase[day] || null;

    if (sessionData) {
      if (!activeFilter || sessionData.muscleGroups.includes(activeFilter)) {
        status = sessionData.type; 
      }
    }
    
    calendarGrid.push({ type: 'day', day, status, id: `day-${day}`, data: sessionData });
  }

  // --- UPDATED: SINGLE CLICK LAUNCHER ---
  const handleLaunchProtocol = (item: any) => {
    // Only trigger if they click a day that actually has a workout
    if (item.status !== 'empty' && item.data) {
      console.log(`SYSTEM UPLINK SUCCESS: Data found for ${item.data.title}`);
      
      // Instead of window.confirm (which is blocked in iframes), we use a custom modal state
      setConfirmModal(item);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-10">
      
      {/* THE MASTER CALENDAR */}
      <div className="p-6 bg-white/[0.03] backdrop-blur-[80px] border border-white/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.6),_0_20px_40px_rgba(0,0,0,0.05)] rounded-[32px] ring-1 ring-inset ring-white/10">
        
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
            <h3 className="text-xs font-mono font-black tracking-[0.2em] text-indigo-600 uppercase">
              {currentMonthName} {currentYear} LOG {activeFilter && <span className="text-slate-400 ml-2">[{activeFilter} FILTER]</span>}
            </h3>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {daysOfWeek.map((day, i) => (
              <div key={`header-${i}`} className="text-center text-[10px] font-mono font-bold text-slate-500/70">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-3 sm:gap-4">
            {calendarGrid.map((item) => {
              if (item.type === 'offset') return <div key={item.id} className="w-full aspect-square opacity-0 pointer-events-none" />;

              let squareClass = "w-full aspect-square rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer flex flex-col items-center justify-center relative ";
              
              if (item.status === 'empty') {
                squareClass += "bg-white/[0.02] border border-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]";
              } else if (item.status === 'active') {
                squareClass += "bg-indigo-500/80 border border-indigo-400/50 shadow-[0_0_12px_rgba(79,70,229,0.5),_inset_0_1px_4px_rgba(255,255,255,0.4)] text-white";
              } else if (item.status === 'pr') {
                squareClass += "bg-emerald-400/90 border border-emerald-300/50 shadow-[0_0_15px_rgba(52,211,153,0.6),_inset_0_1px_4px_rgba(255,255,255,0.6)] text-white";
              }

              return (
                // Replaced onDoubleClick with onClick
                <div key={item.id} className="relative group" onClick={() => handleLaunchProtocol(item)}>
                  <div className={squareClass}>
                    <span className={`text-[10px] font-mono font-bold ${item.status === 'empty' ? 'text-slate-500/40' : 'text-white/90'}`}>{item.day}</span>
                  </div>
                  
                  {/* Kept the hover tooltip so users know what they are about to click */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 flex flex-col items-center">
                    <div className="bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1.5 rounded-lg whitespace-nowrap border border-white/10 shadow-xl">
                      {item.status === 'pr' ? `CLICK TO OPEN PR` : item.status === 'active' ? `CLICK TO OPEN` : `REST DAY`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- CUSTOM CONFIRMATION MODAL --- */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">Launch Protocol</h3>
            <p className="text-sm text-slate-500 mb-6">
              Launch details for: <span className="font-bold text-indigo-600">{confirmModal.data.title}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setConfirmModal(null)} 
                className="px-4 py-2 rounded-lg text-xs font-bold font-mono text-slate-500 hover:bg-slate-100 transition-colors"
              >
                CANCEL
              </button>
              <button 
                onClick={() => {
                  console.log("Routing user to the workout page...");
                  setConfirmModal(null);
                }} 
                className="px-4 py-2 rounded-lg text-xs font-bold font-mono text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md"
              >
                LAUNCH
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TacticalCalendar;