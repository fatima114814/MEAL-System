/**
 * @module components/DipModule
 * @description Detailed Implementation Plan displaying timeline progression, Gantt elements, and active milestone status equations.
 */

import React, { useState } from 'react';
import { useMeal } from '../context/MealContext';
import { Milestone, DipActivity } from '../types';
import { Calendar, Percent, Plus, ShieldCheck, Flag, AlertCircle, PlayCircle, CheckSquare } from 'lucide-react';

export const DipModule: React.FC = () => {
  const {
    projectStore,
    updateDIPActivityProgress,
    updateMilestoneProgress,
    addMilestone,
  } = useMeal();

  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  
  // Mile adding state
  const [newMileName, setNewMileName] = useState('');
  const [newMileDueDate, setNewMileDueDate] = useState('2026-06-30');

  // Eval date
  const CURRENT_SYSTEM_DATE = '2026-06-19';

  /**
   * Domain rules: Milestone Status evaluation
   * - Not Started: Progress = 0%
   * - In Progress: 0 < Progress < 100
   * - Overdue: Progress < 100 AND past due date (compareTo CURRENT_SYSTEM_DATE)
   * - Completed: Progress = 100
   */
  const getMilestoneStatus = (ms: Milestone) => {
    if (ms.progress === 100) {
      return { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckSquare };
    }
    
    // Check if overdue
    const isPastDue = ms.dueDate < CURRENT_SYSTEM_DATE;
    if (isPastDue && ms.progress < 100) {
      return { label: 'Overdue', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20 font-bold', icon: AlertCircle };
    }

    if (ms.progress > 0 && ms.progress < 100) {
      return { label: 'In Progress', color: 'bg-sky-500/10 text-sky-500 border-sky-500/20', icon: PlayCircle };
    }

    return { label: 'Not Started', color: 'bg-slate-100 text-slate-500 border-slate-205 dark:bg-slate-800 dark:text-slate-400', icon: Flag };
  };

  const handleAddMilestoneSubmit = (e: React.FormEvent, actId: string) => {
    e.preventDefault();
    if (!newMileName || !newMileDueDate) return;

    addMilestone(actId, {
      id: `ms-${Date.now()}`,
      name: newMileName,
      dueDate: newMileDueDate,
      progress: 0,
    });

    setNewMileName('');
    setSelectedActivityId(null);
  };

  return (
    <div id="dip-module" className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-6 rounded-none shadow-sm animate-fadeIn">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
        <h3 className="text-base font-black text-slate-850 dark:text-slate-100 flex items-center gap-2 uppercase tracking-tight">
          <Calendar size={18} className="text-sky-500" />
          Detailed Implementation Plan (DIP) & Gantt Scheduler
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Monitor activity duration milestones, compile timeline progress percentage indicators, and perform risk tracking based on due dates.
        </p>
      </div>

      <div className="mt-5 space-y-6">
        {projectStore.dipActivities.length === 0 ? (
          <div className="p-10 border border-dashed border-slate-200 py-12 rounded-none text-center text-slate-500">
            <p className="text-xs font-semibold uppercase">No active DIP tracking items</p>
            <p className="text-[11px] mt-1 text-slate-400">Activities registered inside the Log Frame are synchronized here automatically.</p>
          </div>
        ) : (
          projectStore.dipActivities.map((act) => {
            const associatedLF = projectStore.logFrame.find((lf) => lf.id === act.logFrameItemId);
            
            return (
              <div key={act.id} className="border border-slate-200 rounded-none p-5 bg-slate-50/30">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-3 border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-900 text-white px-2 py-0.5 rounded-none font-mono text-[10px] font-bold">
                        {associatedLF?.code || 'ACT'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 leading-snug">{act.name}</h4>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex gap-3 font-mono">
                      <span>Ref Period: {act.startDate} to {act.endDate}</span>
                    </div>
                  </div>

                  {/* Slider Progress Controls */}
                  <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-none border border-slate-200 min-w-[210px] justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Percent size={11} /> Activity Progress:
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={act.progress}
                        disabled={['Closed', 'Abandoned', 'Pending'].some((term) => projectStore.currentState.includes(term))}
                        onChange={(e) => updateDIPActivityProgress(act.id, parseInt(e.target.value))}
                        className="w-20 cursor-pointer accent-sky-500"
                      />
                      <span className="text-xs font-bold text-slate-800 font-mono w-8 text-right">{act.progress}%</span>
                    </div>
                  </div>
                </div>

                {/* GANTT BAR REPRESENTATION MOCK */}
                <div className="mt-3 bg-slate-100/50 p-3 rounded-none border border-slate-200/50">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 font-mono">
                    PRIME Gantt Span Map
                  </div>
                  <div className="relative w-full h-5 bg-slate-200 rounded-none overflow-hidden">
                    {/* Fill */}
                    <div
                      style={{ width: `${act.progress}%` }}
                      className="absolute left-0 top-0 bottom-0 bg-sky-505 bg-sky-500 transition-all flex items-center justify-end pr-2 text-[9px] text-white font-bold"
                    >
                      {act.progress > 10 ? `${act.progress}%` : ''}
                    </div>
                  </div>
                  <div className="flex justify-between mt-1 text-[9px] text-slate-400 font-mono">
                    <span>Target Start: {act.startDate}</span>
                    <span>Target Target Deliverable: {act.endDate}</span>
                  </div>
                </div>

                {/* NESTED MILESTONE CARDS */}
                <div className="mt-4 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Nested Core Deliverables ({act.milestones.length})
                    </h5>

                    <button
                      onClick={() => setSelectedActivityId(act.id)}
                      disabled={['Closed', 'Abandoned', 'Pending'].some((term) => projectStore.currentState.includes(term))}
                      className="text-[10px] font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100/60 px-2 py-1 rounded-none border border-sky-200 flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus size={11} /> Add Milestone
                    </button>
                  </div>

                  {act.milestones.length === 0 ? (
                    <div className="py-4 text-center text-slate-400 text-[11px] border border-dashed rounded-none bg-white/50">
                      No milestones recorded. Click "Add Milestone" to assign milestones.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {act.milestones.map((ms) => {
                        const status = getMilestoneStatus(ms);
                        const StatusIcon = status.icon;

                        return (
                          <div key={ms.id} className="bg-white rounded-none p-2.5 border border-slate-200 flex items-center justify-between gap-3 shadow-3xs">
                            <div className="min-w-0">
                              <div className="text-xs text-slate-750 font-bold truncate" title={ms.name}>
                                {ms.name}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                                <span>Target: {ms.dueDate}</span>
                                <span>•</span>
                                <span className={`px-1.5 py-0.5 rounded-none border text-[9px] font-bold font-mono tracking-wider ${status.color}`}>
                                  {status.label}
                                </span>
                              </div>
                            </div>

                            {/* Adjust milestone progress */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="20"
                                value={ms.progress}
                                disabled={['Closed', 'Abandoned', 'Pending'].some((term) => projectStore.currentState.includes(term))}
                                onChange={(e) => updateMilestoneProgress(act.id, ms.id, parseInt(e.target.value))}
                                className="w-16 cursor-pointer accent-sky-500"
                                title="Adjust completed progress chunks"
                              />
                              <span className="text-[10px] font-mono font-bold w-7 text-right">{ms.progress}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Inline Milestone Creation Dialog block mockup */}
                {selectedActivityId === act.id && (
                  <form
                    onSubmit={(e) => handleAddMilestoneSubmit(e, act.id)}
                    className="mt-3 bg-slate-950 text-white rounded-none p-4 space-y-4 border border-slate-800 animate-slideUp"
                  >
                    <div className="text-xs font-black uppercase tracking-wider text-slate-300">
                      Define Nest Milestone Deliverable
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1 font-bold">Milestone Name</label>
                        <input
                          type="text"
                          required
                          value={newMileName}
                          onChange={(e) => setNewMileName(e.target.value)}
                          placeholder="Final project outcome validation audit..."
                          className="bg-slate-900 border border-slate-800 w-full p-2 text-xs rounded-none text-white outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1 font-bold">Target End Date</label>
                        <input
                          type="date"
                          required
                          value={newMileDueDate}
                          onChange={(e) => setNewMileDueDate(e.target.value)}
                          className="bg-slate-900 border border-slate-800 w-full p-2 text-xs rounded-none text-white font-mono outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 text-xs pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setSelectedActivityId(null)}
                        className="px-2.5 py-1 text-slate-400 hover:text-white"
                      >
                        Abort
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-sky-550 bg-sky-500 text-white font-bold rounded-none text-xs"
                      >
                        Record Milestone
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
