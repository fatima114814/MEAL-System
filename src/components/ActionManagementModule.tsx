/**
 * @module components/ActionManagementModule
 * @description The Action Management module which is the ALWAYS-EDITABLE exception to the project state lockdown rules.
 */

import React, { useState } from 'react';
import { useMeal } from '../context/MealContext';
import { ClipboardList, Plus, CheckSquare, MessageSquare, AlertCircle, HelpCircle } from 'lucide-react';

export const ActionManagementModule: React.FC = () => {
  const { projectStore, addActionItem, updateActionItem } = useMeal();
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('2026-06-30');
  const [status, setStatus] = useState<'Open' | 'In Progress' | 'Resolved'>('Open');
  const [comment, setComment] = useState('');

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addActionItem({
      title,
      assignedTo: assignedTo || 'Unassigned',
      dueDate,
      status,
      comments: comment || undefined,
    });

    setTitle('');
    setAssignedTo('');
    setComment('');
    setShowAddForm(false);
  };

  const statusColors = {
    Open: 'bg-slate-100 text-slate-700 border-slate-200',
    'In Progress': 'bg-blue-50 text-blue-600 border-blue-200',
    Resolved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  };

  return (
    <div id="action-management" className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-6 rounded-none shadow-sm animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-850 dark:text-slate-100 flex items-center gap-2 uppercase tracking-tight">
              <ClipboardList size={18} className="text-sky-500" />
              Action & Governance Task Workload Management
            </h3>
            <span className="bg-emerald-500/10 text-emerald-600 text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-none border border-emerald-500/20 uppercase tracking-wider">
              🔓 Always Editable
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Action items represent task assignments that bypass project workflow locks. This module remains always editable even inside closed or abandoned project schedules.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-1.5 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-none cursor-pointer flex items-center gap-1.5 shrink-0 uppercase tracking-wider transition-colors animate-slideDown"
        >
          <Plus size={13} />
          <span>{showAddForm ? 'View Tracking List' : 'Raise New Action Task'}</span>
        </button>
      </div>

      {showAddForm ? (
        <div className="mt-5 max-w-xl mx-auto bg-slate-50/50 p-5 rounded-none border border-slate-200">
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">
            Raise Governance Action Item
          </h4>
          <form onSubmit={handleCreateAction} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Task / Action Title</label>
              <textarea
                required
                rows={2}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Declare project action, audit point, or team task here..."
                className="w-full bg-white border border-slate-200 p-2.5 rounded-none text-xs outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Assignee</label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="e.g., Fatima, Budi"
                  className="w-full bg-white border border-slate-200 p-2 rounded-none text-xs outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Target Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-2 rounded-none text-xs font-mono outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Initial Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 p-2 rounded-none text-xs cursor-pointer outline-none focus:border-sky-500"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Diagnostic/Progress Remarks</label>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Specify current steps or barrier comments..."
                className="w-full bg-white border border-slate-200 p-2 rounded-none text-xs outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-205 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 border hover:bg-slate-50 text-xs rounded-none font-bold text-slate-600 cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-none cursor-pointer uppercase tracking-wider"
              >
                Log Governance Item
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mt-5 space-y-3.5">
          {projectStore.actionItems.length === 0 ? (
            <div className="py-12 border border-dashed rounded-none border-slate-200 text-center text-slate-400 text-xs bg-slate-50/20">
              No outstanding coordination actions detected for this workspace.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {projectStore.actionItems.map((item) => {
                return (
                  <div key={item.id} className="p-4 bg-white border border-slate-200 hover:border-slate-350 rounded-none shadow-3xs flex flex-col justify-between gap-3 transition-colors hover:shadow-2xs">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <CheckSquare size={16} className="text-slate-400 mt-0.5 shrink-0" />
                          <span className="text-xs font-bold text-slate-800 leading-normal">
                            {item.title}
                          </span>
                        </div>

                        {/* Status badge */}
                        <span className={`text-[9px] font-bold font-mono tracking-wider uppercase px-2 py-0.5 rounded-none border ${statusColors[item.status]}`}>
                          {item.status}
                        </span>
                      </div>

                      {item.comments && (
                        <div className="mt-2 text-[10px] bg-slate-50 text-slate-500 px-2 py-1.5 rounded-none flex items-center gap-1.5 border border-slate-100 font-mono italic">
                          <MessageSquare size={10} className="shrink-0" />
                          <span>Remarks: "{item.comments}"</span>
                        </div>
                      )}
                    </div>

                    {/* Footer values */}
                    <div className="flex items-center justify-between border-t border-slate-100 mt-2 pt-2.5 text-[10px] text-slate-400 font-mono">
                      <span>Owner: <strong className="text-slate-600">{item.assignedTo}</strong></span>
                      <span>Target: {item.dueDate}</span>
                      
                      {/* State transitions inside action tiles */}
                      {item.status !== 'Resolved' ? (
                        <button
                          onClick={() => updateActionItem(item.id, { status: 'Resolved', comments: 'Item resolved.' })}
                          className="text-[9px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 px-2.5 py-0.5 rounded-none cursor-pointer"
                        >
                          Resolve Task
                        </button>
                      ) : (
                        <button
                          onClick={() => updateActionItem(item.id, { status: 'In Progress' })}
                          className="text-[9px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-150 px-2.5 py-0.5 rounded-none cursor-pointer"
                        >
                          Reopen Task
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
