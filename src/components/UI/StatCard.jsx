import React from 'react';

export default function StatCard({ title, value, subtext, icon, gradientBg, iconTextColor }) {
  return (
    <div className="flex-1 min-w-[240px] bg-white p-6 rounded-2xl flex justify-between items-center border border-slate-100 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
        <span className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-slate-950 transition-colors">
          {value}
        </span>
        <span className="text-xs text-slate-400 font-medium mt-0.5">{subtext}</span>
      </div>
      <div className={`w-14 h-14 rounded-2xl bg-radial ${gradientBg} flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300 shrink-0`}>
        <span className={`text-2xl ${iconTextColor}`}>{icon}</span>
      </div>
    </div>
  );
}