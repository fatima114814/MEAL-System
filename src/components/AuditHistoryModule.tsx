/**
 * @module components/AuditHistoryModule
 * @description Renders the immutable historical audit trail and transition telemetry logging feed.
 */

import React from 'react';
import { useMeal } from '../context/MealContext';
import { History, Shield, Clock } from 'lucide-react';

export const AuditHistoryModule: React.FC = () => {
  const { projectStore } = useMeal();

  return (
    <div id="audit-history" className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-6 rounded-none shadow-sm animate-fadeIn">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
        <h3 className="text-base font-black text-slate-850 dark:text-slate-100 flex items-center gap-2 uppercase tracking-tight">
          <History size={18} className="text-slate-500" />
          Immutable State Machine Governance & Audit Log
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Historical record containing project lifecycles, role-based transitions, date timestamps, and specified authorization remarks.
        </p>
      </div>

      <div className="mt-5 space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
        {projectStore.history.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No logged transitions found.
          </div>
        ) : (
          projectStore.history.map((log, index) => {
            return (
              <div key={index} className="p-4 bg-slate-50 hover:bg-slate-105 border border-slate-200 rounded-none flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs transition-colors">
                {/* Visual state map path */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                    <span className="bg-slate-900 text-white px-2 py-0.5 rounded-none font-bold">
                      {log.fromState}
                    </span>
                    <span className="text-slate-400 font-bold shrink-0">→</span>
                    <span className="bg-sky-50 text-sky-700 font-bold px-2 py-0.5 rounded-none border border-sky-200">
                      {log.toState}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 mt-2 italic pl-0.5 font-mono">
                    "{log.reason || 'No authorization comments.'}"
                  </div>
                </div>

                {/* Audit metadata logs */}
                <div className="shrink-0 flex flex-col md:items-end text-slate-450 font-mono text-[10px] space-y-1 text-slate-500">
                  <span className="flex items-center gap-1">
                    <Shield size={11} className="text-slate-400" />
                    Role: <strong className="text-slate-600">{log.role}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    Time: {new Date(log.timestamp).toLocaleString()}
                  </span>
                  <span>User: {log.user}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
