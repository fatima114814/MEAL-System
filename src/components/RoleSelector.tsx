/**
 * @module components/RoleSelector
 * @description Simulate the complex PRIME RBAC permissions using an interactive role picker.
 */

import React from 'react';
import { useMeal } from '../context/MealContext';
import { ProjectRole } from '../types';
import { Shield, Info, RefreshCw } from 'lucide-react';

export const RoleSelector: React.FC = () => {
  const { currentRole, setRole, resetStore } = useMeal();

  const roleDescriptions: Record<ProjectRole, string> = {
    [ProjectRole.RECORD_MANAGER]: 'Create/edit structures, add partners, submit design files for approval.',
    [ProjectRole.DESIGN_APPROVER]: 'Evaluate thematic alignment. Approves/rejects Project Design workflows.',
    [ProjectRole.DELIVERY_APPROVER]: 'Validate operational deliverables, approve transition to Setup & Closure.',
    [ProjectRole.PDQ_DIRECTOR]: 'Direct oversight. Can access Action Management tracker & Strategic Link tiles only.',
    [ProjectRole.BUDGET_HOLDERS_APPROVER]: 'Authorized to audit and approve Agresso Cost Center assignments.',
    [ProjectRole.LOCAL_ADMIN]: 'Privileged local status. Reopen closed schedules, reverse phase transitions.',
    [ProjectRole.GLOBAL_ADMIN]: 'Highest access level. Domain-wide visibility and rule bypass overrides.',
  };

  return (
    <div id="role-selector" className="bg-slate-900 border border-slate-800 text-white p-5 rounded-none shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-sky-500/15 p-2 rounded-none border border-sky-500/30 text-sky-400">
            <Shield size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black tracking-widest uppercase text-slate-300">
                RBAC Security Simulation
              </h2>
              <span className="bg-sky-550/10 text-sky-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded-none border border-sky-500/20 uppercase tracking-widest">
                Active SIM
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Select an organisational staff role to test state transitions, validation screens, and tile locks instantly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={resetStore}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/25 rounded-none transition-colors cursor-pointer"
            title="Reset simulation data to initial fresh state"
          >
            <RefreshCw size={13} />
            <span>Reset Demo Data</span>
          </button>
          
          <select
            value={currentRole}
            onChange={(e) => setRole(e.target.value as ProjectRole)}
            className="bg-slate-950 border border-slate-750 text-slate-200 text-xs font-semibold rounded-none px-3 py-2 outline-none focus:border-slate-600 transition-all cursor-pointer min-w-[240px]"
          >
            {Object.values(ProjectRole).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 py-2 px-3 bg-slate-950/80 rounded-none border border-slate-800 flex items-start gap-2 text-slate-450">
        <Info size={14} className="text-sky-450 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong className="text-slate-350">Current Role Profile ({currentRole}):</strong> {roleDescriptions[currentRole]}
        </p>
      </div>
    </div>
  );
};
