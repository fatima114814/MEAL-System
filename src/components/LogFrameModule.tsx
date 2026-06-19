/**
 * @module components/LogFrameModule
 * @description Highly visual, interactive Log Frame editor accompanied by IPTT indicator cells, locking, and traffic-light progress indicators.
 */

import React, { useState } from 'react';
import { useMeal } from '../context/MealContext';
import { LogFrameItem, Indicator, IndicatorType, TargetActualPeriod } from '../types';
import { Plus, Trash2, Edit3, Lock, Unlock, HelpCircle, Check, Percent, FileText } from 'lucide-react';

export const LogFrameModule: React.FC = () => {
  const {
    projectStore,
    addLogFrameItem,
    updateLogFrameItem,
    deleteLogFrameItem,
    updateIndicatorIPTT,
    toggleIPTTLock,
    currentRole,
  } = useMeal();

  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view');

  // Add Item State
  const [newItemType, setNewItemType] = useState<'outcome' | 'output' | 'activity'>('outcome');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCode, setNewItemCode] = useState('');
  const [parentId, setParentId] = useState('');
  // activity properties
  const [category, setCategory] = useState('Thematic');
  const [theme, setTheme] = useState('Child Protection');
  const [subTheme, setSubTheme] = useState('Child Protection in Emergencies');
  const [crossTheme, setCrossTheme] = useState('Gender Equality');
  const [commonApproach, setCommonApproach] = useState('Safe Schools Guidelines');

  // Edit fields modal simulation state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const getParentOptions = () => {
    if (newItemType === 'output') {
      return projectStore.logFrame.filter((x) => x.type === 'outcome');
    }
    if (newItemType === 'activity') {
      return projectStore.logFrame.filter((x) => x.type === 'output');
    }
    return [];
  };

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemCode) return;

    addLogFrameItem({
      id: `${newItemType}-${Date.now()}`,
      type: newItemType,
      code: newItemCode,
      name: newItemName,
      parentId: newItemType !== 'outcome' ? parentId : undefined,
      category: newItemType === 'activity' ? category : undefined,
      theme: newItemType === 'activity' ? theme : undefined,
      subTheme: newItemType === 'activity' ? subTheme : undefined,
      crossCuttingTheme: newItemType === 'activity' ? crossTheme : undefined,
      commonApproach: newItemType === 'activity' ? commonApproach : undefined,
    });

    // Reset
    setNewItemName('');
    setNewItemCode('');
    setParentId('');
    setActiveTab('view');
  };

  /**
   * Performance math logic helper for IPTT indicators
   * Cumulative indicators display most recent non-zero target & actual period
   * Incremental indicators display the dynamic sum of all periods
   */
  const calculateIPTTPerformance = (indicator: Indicator) => {
    let targetSum = 0;
    let actualSum = 0;

    if (indicator.type === IndicatorType.CUMULATIVE) {
      // Find the last period in list with registered target
      const populatedPeriods = indicator.periods.filter((p) => p.target > 0);
      const latestPeriod = populatedPeriods[populatedPeriods.length - 1] || indicator.periods[indicator.periods.length - 1];
      if (latestPeriod) {
        targetSum = latestPeriod.target;
        actualSum = latestPeriod.actual;
      }
    } else {
      // Incremental sums everything
      indicator.periods.forEach((p) => {
        targetSum += p.target;
        actualSum += p.actual;
      });
    }

    const percentage = targetSum > 0 ? Math.round((actualSum / targetSum) * 100) : 0;

    // Traffic light colour coding
    // Red = 0–30%, Amber = 30–70%, Green = >=70% / 100%
    let color = 'bg-rose-500 text-rose-50 border-rose-550';
    let label = 'Low Performance (Critical / Red)';

    if (percentage > 30 && percentage < 70) {
      color = 'bg-amber-500 text-amber-950 border-amber-550';
      label = 'Moderate Performance (Amber)';
    } else if (percentage >= 70) {
      color = 'bg-emerald-600 text-emerald-50 border-emerald-555';
      label = 'Target Achieved (Green)';
    }

    return { targetSum, actualSum, percentage, color, label };
  };

  const handlePeriodCellUpdate = (
    indicatorId: string,
    periodId: string,
    field: 'target' | 'actual',
    value: string,
    periodsList: TargetActualPeriod[]
  ) => {
    const num = parseFloat(value) || 0;
    const updatedPeriods = periodsList.map((p) => {
      if (p.periodId !== periodId) return p;
      return { ...p, [field]: num };
    });
    updateIndicatorIPTT(indicatorId, updatedPeriods);
  };

  // Hierarchy representation
  const renderLogHierarchy = () => {
    const outcomes = projectStore.logFrame.filter((x) => x.type === 'outcome');

    return (
      <div className="space-y-6">
        {outcomes.length === 0 ? (
          <div className="p-10 border border-dashed border-slate-205 py-12 rounded-xl text-center text-slate-500">
            <p className="text-xs font-semibold uppercase">No Logframe structure defined</p>
            <p className="text-[11px] mt-1 text-slate-400">Click on "Structural Builder" to assign outcomes, outputs, and activities.</p>
          </div>
        ) : (
          outcomes.map((outcome) => {
            const outputs = projectStore.logFrame.filter((x) => x.type === 'output' && x.parentId === outcome.id);

            return (
              <div key={outcome.id} className="bg-slate-50/70 dark:bg-slate-900/50 border border-slate-250 dark:border-slate-800 rounded-none p-5 shadow-3xs transition-all">
                {/* Outcome block */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-start gap-2.5">
                    <span className="bg-sky-500 text-white font-mono text-xs font-bold px-2 py-0.5">
                      {outcome.code}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-850 tracking-tight leading-snug">Outcome</h4>
                      <p className="text-xs text-slate-700 mt-1">{outcome.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteLogFrameItem(outcome.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded hover:bg-slate-100 transition-all cursor-pointer"
                    title="Delete Outcome & all children modules"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Outcome Indicators */}
                <div className="mt-3 pl-2.5 border-l-2 border-blue-500/35 space-y-4">
                  {outcome.indicators.map((ind) => renderIndicatorIPTTBlock(ind))}
                </div>

                {/* Nested Outputs */}
                <div className="mt-5 space-y-5">
                  {outputs.map((output) => {
                    const activities = projectStore.logFrame.filter((x) => x.type === 'activity' && x.parentId === output.id);

                    return (
                      <div key={output.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-4">
                        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-805">
                          <div className="flex items-start gap-2.5">
                            <span className="bg-slate-900 dark:bg-slate-800 text-white font-mono text-xs font-bold px-2 py-0.5">
                              {output.code}
                            </span>
                            <div>
                              <h5 className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">Output Module</h5>
                              <p className="text-xs text-slate-800 mt-1">{output.name}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteLogFrameItem(output.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded hover:bg-slate-50 transition-all cursor-pointer"
                            title="Delete Output & Activities"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Output Indicators */}
                        <div className="mt-3 pl-2.5 border-l-2 border-teal-500/35 space-y-4">
                          {output.indicators.map((ind) => renderIndicatorIPTTBlock(ind))}
                        </div>

                        {/* Nested Activities */}
                        <div className="mt-4 space-y-3.5">
                          {activities.map((activity) => {
                            const isSetUpOrLater =
                              projectStore.currentState !== 'Design-In Progress' &&
                              projectStore.currentState !== 'Design-Funding Secured' &&
                              projectStore.currentState !== 'Design-Pending Approval';

                            return (
                              <div key={activity.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 border-dashed dark:border-slate-800 p-4 rounded-none">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-2.5">
                                    <span className="bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono text-xs font-bold px-2 py-0.5 border border-sky-500/20">
                                      {activity.code}
                                    </span>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h6 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Thematic Activity</h6>
                                        {isSetUpOrLater && (
                                          <span className="inline-flex items-center gap-1 text-[9px] bg-slate-205 dark:bg-slate-850 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase border border-slate-300/40">
                                            <Lock size={8} /> DIP LOCKED
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-slate-800 mt-1">{activity.name}</p>

                                      {/* Properties breakdown (LOCKED or editable) */}
                                      <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2.5 text-[10px] text-slate-505 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-805 pt-2 font-mono">
                                        <span>Category: <strong className="text-slate-700 dark:text-slate-300">{activity.category}</strong></span>
                                        <span>Theme: <strong className="text-slate-700 dark:text-slate-300">{activity.theme}</strong></span>
                                        <span>Sub-Theme: <strong className="text-slate-700 dark:text-slate-300">{activity.subTheme}</strong></span>
                                        <span>Cross-Cutting: <strong className="text-slate-700 dark:text-slate-300">{activity.crossCuttingTheme}</strong></span>
                                        <span>Common Approach: <strong className="text-slate-700 dark:text-slate-300">{activity.commonApproach}</strong></span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        if (isSetUpOrLater) {
                                          alert('DIP Lockout Rule: Activity properties are locked once transitioned entering Setup phase.');
                                          return;
                                        }
                                        setEditingItemId(activity.id);
                                        setNewItemName(activity.name);
                                        setNewItemCode(activity.code);
                                        setCategory(activity.category || '');
                                        setTheme(activity.theme || '');
                                        setSubTheme(activity.subTheme || '');
                                        setCrossTheme(activity.crossCuttingTheme || '');
                                        setCommonApproach(activity.commonApproach || '');
                                      }}
                                      className="p-1 px-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-100 rounded text-[10px] flex items-center gap-1 cursor-pointer"
                                    >
                                      <Edit3 size={11} /> Edit
                                    </button>
                                    <button
                                      disabled={isSetUpOrLater}
                                      onClick={() => {
                                        const success = deleteLogFrameItem(activity.id);
                                        if (!success) {
                                          alert('DIP Rules Lock: Activity deletion is disabled once project Setup processes start.');
                                        }
                                      }}
                                      className={`p-1 text-slate-400 rounded hover:bg-slate-100 cursor-pointer ${
                                        isSetUpOrLater ? 'opacity-30 cursor-not-allowed hover:text-slate-400' : 'hover:text-rose-500'
                                      }`}
                                      title={isSetUpOrLater ? 'Deletion Locked' : 'Delete Activity'}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>

                                {/* Activity Indicators */}
                                <div className="mt-3 pl-2.5 border-l-2 border-amber-500/35 space-y-4">
                                  {activity.indicators.map((ind) => renderIndicatorIPTTBlock(ind))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  // Indicator Block rendering with cell editors, locking overrides, and sums
  const renderIndicatorIPTTBlock = (indicator: Indicator) => {
    const { targetSum, actualSum, percentage, color, label } = calculateIPTTPerformance(indicator);
    const selfCreatedId = projectStore.metadata.createdBy;

    // Concurrency Lock checks
    const isLockedByOthers = indicator.lockedBy && indicator.lockedBy.userId !== selfCreatedId;
    const isLockedByMe = indicator.lockedBy && indicator.lockedBy.userId === selfCreatedId;

    return (
      <div key={indicator.id} id={`ind-card-${indicator.id}`} className="bg-slate-10 shadow-3xs dark:bg-slate-900 border border-slate-150/80 dark:border-slate-800 rounded-lg p-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-start gap-2">
            <span className="text-[10px] bg-slate-205 dark:bg-slate-800 text-slate-600 dark:text-slate-350 px-2 py-0.5 rounded font-mono font-bold tracking-wider">
              {indicator.code}
            </span>
            <div>
              <div className="text-[11px] text-slate-705 dark:text-slate-200 font-semibold leading-relaxed">
                {indicator.name} (Unit: <span className="font-mono">{indicator.unit}</span> | Baseline: {indicator.baseline})
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-200">
                  Type: {indicator.type}
                </span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                  indicator.type === IndicatorType.CUMULATIVE ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-orange-50 text-orange-600 border-orange-200'
                }`}>
                  {indicator.type === IndicatorType.CUMULATIVE ? 'Displays Last Value' : 'Accumulates Period Sums'}
                </span>
              </div>
            </div>
          </div>

          {/* Locked indicators check */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Lock Control Action */}
            <button
              onClick={() => toggleIPTTLock(indicator.id)}
              className={`flex items-center gap-1 text-[10px] px-2 py-1.5 rounded-md border font-semibold cursor-pointer transition-colors ${
                isLockedByMe
                  ? 'bg-blue-500/10 text-blue-500 border-blue-500/30 hover:bg-blue-500/15'
                  : isLockedByOthers
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 cursor-not-allowed opacity-80'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {indicator.lockedBy ? (
                <>
                  <Lock size={11} />
                  <span>
                    Locked {isLockedByMe ? '(By Me)' : `(By ${indicator.lockedBy.userName.split(' ')[0]})`}
                  </span>
                </>
              ) : (
                <>
                  <Unlock size={11} />
                  <span>Interactive Edit Log</span>
                </>
              )}
            </button>

            {/* Performance Level */}
            <div className={`p-1.5 px-3 rounded-md text-[10px] font-bold border flex items-center gap-1 font-mono tracking-tight shrink-0 ${color}`} title={label}>
              <Percent size={11} />
              <span>LOP Achievement: {percentage}%</span>
            </div>
          </div>
        </div>

        {/* IPTT Matrix inputs list */}
        <div className="mt-3">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {indicator.periods.map((p) => {
              const disabled = isLockedByOthers;

              return (
                <div key={p.periodId} className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-100/80 dark:border-slate-805">
                  <div className="text-[10px] font-bold text-slate-500 truncate mb-1">
                    {p.periodId}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[9px] gap-1">
                      <span className="text-slate-400">Target:</span>
                      <input
                        type="number"
                        disabled={disabled}
                        value={p.target || 0}
                        onChange={(e) =>
                          handlePeriodCellUpdate(indicator.id, p.periodId, 'target', e.target.value, indicator.periods)
                        }
                        className={`w-12 text-right bg-white dark:bg-slate-900 border text-[10px] font-bold px-1 rounded outline-none focus:border-slate-400 ${
                          disabled ? 'opacity-40 cursor-not-allowed border-transparent' : 'border-slate-200'
                        }`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] gap-1">
                      <span className="text-slate-400">Actual:</span>
                      <input
                        type="number"
                        disabled={disabled}
                        value={p.actual || 0}
                        onChange={(e) =>
                          handlePeriodCellUpdate(indicator.id, p.periodId, 'actual', e.target.value, indicator.periods)
                        }
                        className={`w-12 text-right bg-white dark:bg-slate-900 border text-[10px] font-bold px-1 rounded outline-none focus:border-slate-450 ${
                          disabled ? 'opacity-40 cursor-not-allowed border-transparent' : 'border-slate-250 font-bold text-slate-800 dark:text-slate-100'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Total calculated Period Summary cell */}
            <div className="bg-slate-100/50 dark:bg-slate-850 p-2 rounded border border-slate-200/55 dark:border-slate-750 flex flex-col justify-center">
              <div className="text-[10px] font-bold text-slate-500 mb-1">
                IPTT Summary Sum
              </div>
              <div className="text-[10px] space-y-0.5 leading-snug font-mono">
                <div>Period Target: <strong className="text-slate-800 dark:text-slate-100">{targetSum}</strong></div>
                <div>Period Actuals: <strong className="text-slate-850 dark:text-slate-100">{actualSum}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="log-frame-module" className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-6 rounded-none shadow-sm animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h3 className="text-base font-black text-slate-850 dark:text-slate-100 flex items-center gap-2 uppercase tracking-tight">
            <FileText size={18} className="text-sky-500" />
            Logical Framework & IPTT Tracking System
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Build outcome/output modules, assign thematic activities, track period LOP targets, and simulate concurrent cell adjustments.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-50 dark:bg-slate-950 p-1 rounded-none border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          <button
            onClick={() => setActiveTab('view')}
            className={`px-3 py-1.5 rounded-none font-bold cursor-pointer transition-colors ${
              activeTab === 'view' ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-sm' : 'hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Log Frame & Metrics
          </button>
          <button
            onClick={() => setActiveTab('add')}
            disabled={['Closed', 'Abandoned', 'Pending'].some((term) => projectStore.currentState.includes(term))}
            className={`px-3 py-1.5 rounded-none font-bold cursor-pointer transition-colors ${
              activeTab === 'add' ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-sm' : 'hover:text-slate-800 dark:hover:text-slate-200'
            } ${
              ['Closed', 'Abandoned', 'Pending'].some((term) => projectStore.currentState.includes(term))
                ? 'opacity-30 cursor-not-allowed'
                : ''
            }`}
          >
            Structural Builder
          </button>
        </div>
      </div>

      {activeTab === 'view' ? (
        <div className="mt-5 space-y-4">
          {renderLogHierarchy()}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {/* Form area for building module types */}
          <form onSubmit={handleAddItemSubmit} className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-805 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Create New Log Frame Entry Definition
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Module Type:
                </label>
                <select
                  value={newItemType}
                  onChange={(e) => setNewItemType(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-slate-400"
                >
                  <option value="outcome">Outcome Definition</option>
                  <option value="output">Output Definition</option>
                  <option value="activity">Thematic Activity</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Reference Code (ID String):
                </label>
                <input
                  type="text"
                  required
                  value={newItemCode}
                  onChange={(e) => setNewItemCode(e.target.value)}
                  placeholder="e.g., OC.1, OUT.1.1, ACT.1.1.3"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-slate-400"
                />
              </div>

              <div className="md:col-span-6">
                {newItemType !== 'outcome' && (
                  <>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      Parent Relational Item:
                    </label>
                    <select
                      value={parentId}
                      required
                      onChange={(e) => setParentId(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-slate-400"
                    >
                      <option value="">Select associated parent...</option>
                      {getParentOptions().map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          [{opt.code}] {opt.name.substring(0, 75)}...
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Description / Title Content:
              </label>
              <textarea
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Declare details, objectives, or descriptions here..."
                rows={3}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 text-xs p-3 rounded-lg outline-none focus:border-slate-400"
              />
            </div>

            {/* Extra fields for activity */}
            {newItemType === 'activity' && (
              <div className="p-4 bg-white dark:bg-slate-900 border rounded-lg space-y-3">
                <h5 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  Metadata Activity Classification Properties
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Category</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 p-2 border rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Theme</label>
                    <input
                      type="text"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 p-2 border rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Sub-Theme</label>
                    <input
                      type="text"
                      value={subTheme}
                      onChange={(e) => setSubTheme(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 p-2 border rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Cross-Theme</label>
                    <input
                      type="text"
                      value={crossTheme}
                      onChange={(e) => setCrossTheme(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 p-2 border rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Common Approach</label>
                    <input
                      type="text"
                      value={commonApproach}
                      onChange={(e) => setCommonApproach(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 p-2 border rounded text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Insert into logframe structure</span>
            </button>
          </form>
        </div>
      )}

      {/* Editing activity modal/popup mockup */}
      {editingItemId && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full border border-slate-205 py-6 px-5 rounded-xl shadow-2xl">
            <h4 className="text-sm font-bold text-slate-800">Assign Activity metadata details</h4>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1 font-bold">Activity Name</label>
                <textarea
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full border p-2 text-xs rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-xs text-slate-500 mb-1 font-bold">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1 font-bold">Theme</label>
                  <input
                    type="text"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1 font-bold">Sub-Theme</label>
                  <input
                    type="text"
                    value={subTheme}
                    onChange={(e) => setSubTheme(e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1 font-bold">Cross-cutting Theme</label>
                  <input
                    type="text"
                    value={crossTheme}
                    onChange={(e) => setCrossTheme(e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-500 mb-1 font-bold">Common Approach</label>
                  <input
                    type="text"
                    value={commonApproach}
                    onChange={(e) => setCommonApproach(e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setEditingItemId(null)}
                  className="px-3 py-1.5 border hover:bg-slate-50 text-xs rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const matchItem = projectStore.logFrame.find((x) => x.id === editingItemId);
                    if (matchItem) {
                      updateLogFrameItem({
                        ...matchItem,
                        name: newItemName,
                        category,
                        theme,
                        subTheme,
                        crossCuttingTheme: crossTheme,
                        commonApproach,
                      });
                    }
                    setEditingItemId(null);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-semibold cursor-pointer"
                >
                  Save Amendments
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
