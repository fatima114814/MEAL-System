/**
 * @module components/TransitionController
 * @description Master state machine workflow panel with pre-condition checklists and custom transition triggers.
 */

import React, { useState } from 'react';
import { useMeal } from '../context/MealContext';
import { ProjectState, ProjectPhase, ProjectRole } from '../types';
import { Play, CheckCircle, AlertTriangle, ArrowRight, CornerDownRight, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const TransitionController: React.FC = () => {
  const {
    projectStore,
    currentRole,
    transitionTo,
    runDesignSubmissionValidation,
  } = useMeal();

  const [reason, setReason] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);
  const [showChecklistDetails, setShowChecklistDetails] = useState(true);

  const currentStatus = projectStore.currentState;

  // Run validation
  const validation = runDesignSubmissionValidation();

  // Clear notices after timer
  const triggerTransition = (target: ProjectState) => {
    setErrorText(null);
    setSuccessText(null);
    const result = transitionTo(target, reason || 'Workflow state initiated through control board.');
    if (result.success) {
      setSuccessText(`Successfully transitioned project to: [${target}]`);
      setReason('');
    } else {
      setErrorText(result.error || 'Unknown transition error occurred.');
    }
  };

  // Helper to color-code the phases
  const getPhaseBadgeColor = (phase: ProjectPhase) => {
    switch (phase) {
      case ProjectPhase.DESIGN:
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case ProjectPhase.SET_UP:
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case ProjectPhase.IMPLEMENTATION:
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case ProjectPhase.TRANSITION:
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    }
  };

  // Extract current phase name
  const getCurrentPhase = (): ProjectPhase => {
    if (currentStatus.startsWith('Design')) return ProjectPhase.DESIGN;
    if (currentStatus.startsWith('Set Up')) return ProjectPhase.SET_UP;
    if (currentStatus.startsWith('Implementation')) return ProjectPhase.IMPLEMENTATION;
    return ProjectPhase.TRANSITION;
  };

  const activePhase = getCurrentPhase();

  // Define potential workflows to render based on current state
  const renderWorkflowButtons = () => {
    const isAdmin = currentRole === ProjectRole.LOCAL_ADMIN || currentRole === ProjectRole.GLOBAL_ADMIN;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {/* DESIGN STATES */}
        {currentStatus === ProjectState.DESIGN_IN_PROGRESS && (
          <button
            onClick={() => triggerTransition(ProjectState.DESIGN_FUNDING_SECURED)}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            <span>Proceed to Funding Secured</span>
            <ArrowRight size={13} />
          </button>
        )}

        {currentStatus === ProjectState.DESIGN_FUNDING_SECURED && (
          <div className="flex flex-wrap gap-2 w-full">
            <button
              onClick={() => triggerTransition(ProjectState.DESIGN_PENDING_APPROVAL)}
              disabled={!validation.success}
              className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                validation.success
                  ? 'bg-blue-600 hover:bg-blue-700 border-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-250 dark:border-slate-750 opacity-60 cursor-not-allowed'
              }`}
            >
              <span>Submit for Workspace Approval</span>
              <ArrowRight size={13} />
            </button>
            
            {isAdmin && (
              <button
                onClick={() => triggerTransition(ProjectState.DESIGN_IN_PROGRESS)}
                className="flex items-center gap-1 text-xs font-medium px-3 py-2 bg-slate-700 hover:bg-slate-650 text-slate-300 rounded-lg transition-colors cursor-pointer border border-slate-650"
              >
                <span>[Admin] Reverse to In Progress</span>
              </button>
            )}
          </div>
        )}

        {currentStatus === ProjectState.DESIGN_PENDING_APPROVAL && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => triggerTransition(ProjectState.DESIGN_PENDING_PROJECT_DESIGN_APPROVAL)}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
            >
              <CheckCircle size={13} />
              <span>Appves Design Work (Design Approver)</span>
            </button>
            <button
              onClick={() => triggerTransition(ProjectState.DESIGN_IN_PROGRESS)}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-rose-600 hover:bg-rose-750 text-white rounded-lg transition-colors cursor-pointer"
            >
              <XCircle size={13} />
              <span>Reject Design (Return to Draft)</span>
            </button>
          </div>
        )}

        {currentStatus === ProjectState.DESIGN_PENDING_PROJECT_DESIGN_APPROVAL && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => triggerTransition(ProjectState.DESIGN_PENDING_PROJECT_DELIVERY_APPROVAL)}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-emerald-605 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
            >
              <CheckCircle size={13} />
              <span>Submit for Delivery Sign-off</span>
            </button>
            <button
              onClick={() => triggerTransition(ProjectState.DESIGN_IN_PROGRESS)}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-rose-600 hover:bg-rose-750 text-white rounded-lg transition-colors cursor-pointer"
            >
              <XCircle size={13} />
              <span>Reject & Send back to Draft</span>
            </button>
          </div>
        )}

        {currentStatus === ProjectState.DESIGN_PENDING_PROJECT_DELIVERY_APPROVAL && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => triggerTransition(ProjectState.SET_UP_IN_PROGRESS)}
              className="flex items-center gap-1 text-xs font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-md cursor-pointer ring-2 ring-indigo-500/10"
            >
              <Play size={13} />
              <span>Approve & Transition to Set Up</span>
            </button>
            <button
              onClick={() => triggerTransition(ProjectState.DESIGN_IN_PROGRESS)}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-rose-600 hover:bg-rose-750 text-white rounded-lg transition-colors cursor-pointer"
            >
              <XCircle size={13} />
              <span>Reject & Rollback Design</span>
            </button>
          </div>
        )}

        {/* SET UP STATES */}
        {currentStatus === ProjectState.SET_UP_IN_PROGRESS && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => triggerTransition(ProjectState.SET_UP_PENDING_REPLANNING_APPROVAL)}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-lg transition-colors cursor-pointer"
            >
              <span>Submit replanning workspace</span>
              <ArrowRight size={13} />
            </button>
            {isAdmin && (
              <button
                onClick={() => triggerTransition(ProjectState.DESIGN_IN_PROGRESS)}
                className="flex items-center gap-1 text-xs font-medium px-3 py-2 bg-slate-705 bg-slate-700 hover:bg-slate-650 hover:text-slate-200 text-slate-300 rounded-lg cursor-pointer border border-slate-650"
              >
                <span>[Admin] Reverse to Design Phase</span>
              </button>
            )}
          </div>
        )}

        {currentStatus === ProjectState.SET_UP_PENDING_REPLANNING_APPROVAL && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => triggerTransition(ProjectState.SET_UP_PENDING_DESIGN_REPLANNING_APPROVAL)}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-emerald-600 hover:bg-emerald-750 text-white rounded-lg transition-colors cursor-pointer"
            >
              <CheckCircle size={13} />
              <span>Approve Design Replan</span>
            </button>
          </div>
        )}

        {currentStatus === ProjectState.SET_UP_PENDING_DESIGN_REPLANNING_APPROVAL && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => triggerTransition(ProjectState.SET_UP_PENDING_DELIVERY_REPLANNING_APPROVAL)}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-emerald-600 hover:bg-emerald-750 text-white rounded-lg transition-colors cursor-pointer"
            >
              <CheckCircle size={13} />
              <span>Approve Delivery Replan</span>
            </button>
          </div>
        )}

        {currentStatus === ProjectState.SET_UP_PENDING_DELIVERY_REPLANNING_APPROVAL && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => triggerTransition(ProjectState.IMPLEMENTATION_IN_PROGRESS)}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 bg-emerald-600 hover:bg-emerald-750 text-white rounded-lg cursor-pointer"
            >
              <Play size={13} />
              <span>Acknowledge Replan & Go to Implementation</span>
            </button>
          </div>
        )}

        {/* IMPLEMENTATION STATES */}
        {currentStatus === ProjectState.IMPLEMENTATION_IN_PROGRESS && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => triggerTransition(ProjectState.IMPLEMENTATION_PENDING_REPLANNING_APPROVAL)}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-blue-600 hover:bg-blue-755 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
            >
              <span>Submit field replan logs</span>
              <ArrowRight size={13} />
            </button>
            {isAdmin && (
              <button
                onClick={() => triggerTransition(ProjectState.SET_UP_IN_PROGRESS)}
                className="flex items-center gap-1 text-xs font-medium px-3 py-2 bg-slate-700 hover:bg-slate-655 text-slate-300 rounded-lg cursor-pointer border border-slate-655"
              >
                <span>[Admin] Reverse to Setup Phase</span>
              </button>
            )}
          </div>
        )}

        {currentStatus === ProjectState.IMPLEMENTATION_PENDING_REPLANNING_APPROVAL && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => triggerTransition(ProjectState.IMPLEMENTATION_PENDING_DESIGN_REPLANNING_APPROVAL)}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-emerald-600 hover:bg-emerald-750 text-white rounded-lg cursor-pointer"
            >
              <CheckCircle size={13} />
              <span>Validate Mid-term Design Replan</span>
            </button>
          </div>
        )}

        {currentStatus === ProjectState.IMPLEMENTATION_PENDING_DESIGN_REPLANNING_APPROVAL && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => triggerTransition(ProjectState.IMPLEMENTATION_PENDING_DELIVERY_REPLANNING_APPROVAL)}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-emerald-600 hover:bg-emerald-750 text-white rounded-lg cursor-pointer"
            >
              <CheckCircle size={13} />
              <span>Validate Mid-term Delivery Replan</span>
            </button>
          </div>
        )}

        {currentStatus === ProjectState.IMPLEMENTATION_PENDING_DELIVERY_REPLANNING_APPROVAL && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => triggerTransition(ProjectState.TRANSITION_IN_PROGRESS)}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-gradient-to-r from-teal-605 from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white rounded-lg cursor-pointer"
            >
              <span>Start Post-Project transition Phase</span>
            </button>
          </div>
        )}

        {/* TRANSITION STATES */}
        {currentStatus === ProjectState.TRANSITION_IN_PROGRESS && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => triggerTransition(ProjectState.TRANSITION_PENDING_REPLANNING_APPROVAL)}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
            >
              <span>Submit final outputs list</span>
              <ArrowRight size={13} />
            </button>
            {isAdmin && (
              <button
                onClick={() => triggerTransition(ProjectState.IMPLEMENTATION_IN_PROGRESS)}
                className="flex items-center gap-1 text-xs font-medium px-3 py-2 bg-slate-700 hover:bg-slate-655 text-slate-300 rounded-lg cursor-pointer border border-slate-655"
              >
                <span>[Admin] Reverse to Implementation</span>
              </button>
            )}
          </div>
        )}

        {currentStatus === ProjectState.TRANSITION_PENDING_REPLANNING_APPROVAL && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => triggerTransition(ProjectState.TRANSITION_PENDING_DESIGN_REPLANNING_APPROVAL)}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-emerald-605 bg-emerald-600 hover:bg-emerald-705 text-white rounded-lg cursor-pointer"
            >
              <CheckCircle size={13} />
              <span>Audit Closure Design Checklist</span>
            </button>
          </div>
        )}

        {currentStatus === ProjectState.TRANSITION_PENDING_DESIGN_REPLANNING_APPROVAL && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => triggerTransition(ProjectState.TRANSITION_PENDING_DELIVERY_REPLANNING_APPROVAL)}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-emerald-600 hover:bg-emerald-705 bg-emerald-700 text-white rounded-lg cursor-pointer"
            >
              <CheckCircle size={13} />
              <span>Approve Delivery closure logs</span>
            </button>
          </div>
        )}

        {currentStatus === ProjectState.TRANSITION_PENDING_DELIVERY_REPLANNING_APPROVAL && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => triggerTransition(ProjectState.TRANSITION_CLOSED)}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg cursor-pointer"
            >
              <span>Permanently Close PRIME Project</span>
            </button>
          </div>
        )}

        {/* ABANDONE ROUTE FOR ACTIVE STAGES */}
        {['In Progress', 'Secured', 'Pending'].some((st) => currentStatus.includes(st)) && (
          <button
            onClick={() => triggerTransition(ProjectState.DESIGN_ABANDONED)}
            className="flex items-center gap-1 text-xs text-rose-300 hover:text-white font-medium px-3 py-2 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 rounded-lg cursor-pointer"
          >
            <span>Abandon Setup</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div id="transition-controller" className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-6 rounded-none shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono font-black tracking-widest uppercase px-2.5 py-1.5 rounded-none ${getPhaseBadgeColor(activePhase)}`}>
              Phase: {activePhase}
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 px-3 py-1 text-xs font-bold rounded-none font-mono">
              State: {currentStatus}
            </span>
          </div>
          <h2 className="text-base font-black text-slate-850 dark:text-slate-250 uppercase tracking-tight mt-3">
            Stage & Transition Control Board
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-1">
            PRIME operates as a strict state machine. Depending on the design or setup milestones and your designated RBAC permissions, use controls below to advance.
          </p>
        </div>

        {/* Transition Lock Notice */}
        <div className="flex flex-col gap-1 items-start lg:items-end font-mono">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">STATE ENFORCEMENT RULES</div>
          <div className="flex items-center gap-1.5 text-xs">
            {['Closed', 'Abandoned', 'Pending'].some((term) => currentStatus.includes(term)) ? (
              <span className="flex items-center gap-1 bg-amber-500/10 text-amber-650 px-2.5 py-1 rounded-none font-bold border border-amber-500/25 uppercase text-[10px]">
                <AlertTriangle size={12} />
                Structure Locked
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-650 px-2.5 py-1 rounded-none font-bold border border-emerald-500/25 uppercase text-[10px]">
                <CheckCircle size={12} />
                Structure Editable
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Notices */}
      {errorText && (
        <div className="mt-4 p-3.5 bg-rose-500/10 border border-rose-500/25 text-rose-655 rounded-none text-xs leading-relaxed flex items-start gap-2 animate-fadeIn">
          <XCircle size={15} className="shrink-0 mt-0.5 text-rose-500" />
          <p><strong>Transition Blocking Error:</strong> {errorText}</p>
        </div>
      )}

      {successText && (
        <div className="mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-655 rounded-none text-xs leading-relaxed flex items-start gap-2 animate-fadeIn">
          <CheckCircle size={15} className="shrink-0 mt-0.5 text-emerald-600" />
          <p>{successText}</p>
        </div>
      )}

      {/* SUBMISSION CHECKLIST (TIER 1 PRECONDITIONS) */}
      {currentStatus === ProjectState.DESIGN_FUNDING_SECURED && (
        <div className="mt-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-none">
          <button
            onClick={() => setShowChecklistDetails(!showChecklistDetails)}
            className="flex items-center justify-between w-full text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 ${validation.success ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                TIER 1: Workspace Submission Preconditions Checklist
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-none ${
                validation.success ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-550' : 'bg-rose-500/15 text-rose-500 border border-rose-550'
              }`}>
                {validation.success ? 'READY' : '6 STEP RULES DETECTED'}
              </span>
              {showChecklistDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </button>

          {showChecklistDetails && (
            <div className="mt-3.5 space-y-2.5 border-t border-slate-200/50 dark:border-slate-800/55 pt-3.5">
              {validation.checklist.map((item) => (
                <div key={item.id} className="flex items-start gap-3 text-xs">
                  {item.passed ? (
                    <span className="text-emerald-500 mt-0.5">
                      <CheckCircle size={15} />
                    </span>
                  ) : (
                    <span className="text-rose-500 mt-0.5">
                      <XCircle size={15} />
                    </span>
                  )}
                  <div>
                    <div className="font-semibold text-slate-700 text-xs">
                      {item.task}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {item.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action triggers container */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Audit/Transition Decision Remarks:
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide brief governance remarks or authorization notes..."
            className="bg-slate-50 dark:bg-slate-850 hover:bg-slate-100/50 border border-slate-200 dark:border-slate-750 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs px-3 py-2.5 rounded-none outline-none focus:border-sky-500 transition-all font-mono"
          />
        </div>
        <div className="md:col-span-4 flex flex-col justify-end text-right">
          <label className="text-xs font-bold text-slate-600 mb-2 md:text-left">
            Trigger Workflows State Transition:
          </label>
          {renderWorkflowButtons()}
        </div>
      </div>
    </div>
  );
};
