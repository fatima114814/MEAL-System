/**
 * @module components/PartnersModule
 * @description Manages partners registries and the complete Budget Holder Cost Center validation workflow.
 */

import React, { useState } from 'react';
import { useMeal } from '../context/MealContext';
import { BudgetHolderState, ProjectRole, Partner } from '../types';
import { Users, CreditCard, ShieldAlert, Plus, Trash2, FolderPlus, HelpCircle } from 'lucide-react';

export const PartnersModule: React.FC = () => {
  const {
    projectStore,
    currentRole,
    updateBudgetHolderStatus,
    addCostCentre,
    addPartner,
    deletePartner,
  } = useMeal();

  const [activeTab, setActiveTab] = useState<'partners' | 'budget'>('partners');
  
  // Create partner state
  const [partnerName, setPartnerName] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [partnerRole, setPartnerRole] = useState('Implementing Partner');
  const [partnerContact, setPartnerContact] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');

  // Create CC state
  const [ccCode, setCcCode] = useState('');
  const [ccName, setCcName] = useState('');
  const [ccOffice, setCcOffice] = useState('Asia-East-PO');

  const bh = projectStore.budgetHolders;

  // Domain rule check: Budget Holder tile is non-editable by Design Approver or Delivery Approver
  const isBHTileEditable =
    currentRole !== ProjectRole.DESIGN_APPROVER &&
    currentRole !== ProjectRole.DELIVERY_APPROVER;

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName || !partnerCode) return;

    addPartner({
      id: `p-${Date.now()}`,
      name: partnerName,
      code: partnerCode,
      role: partnerRole,
      contactPerson: partnerContact,
      email: partnerEmail,
    });

    setPartnerName('');
    setPartnerCode('');
    setPartnerContact('');
    setPartnerEmail('');
  };

  const handleCreateCostCentre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ccCode || !ccName) return;

    addCostCentre(ccCode, ccName, ccOffice);
    setCcCode('');
    setCcName('');
  };

  /**
   * Domain rules: alphanumeric ordering
   * Cost centres grouped by programme office in alpha-numerical order; 
   * programme offices in alphabetical order (name + code).
   */
  const getGroupedAndSortedCostCentres = () => {
    const list = [...bh.costCentres];

    // Grouping
    const grouped: Record<string, typeof list> = {};
    list.forEach((cc) => {
      if (!grouped[cc.programmeOffice]) {
        grouped[cc.programmeOffice] = [];
      }
      grouped[cc.programmeOffice].push(cc);
    });

    // Sort programme offices alphabetically
    const sortedOffices = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

    // Sort each group's budget cost centres alphanumerically by code then name
    sortedOffices.forEach((office) => {
      grouped[office].sort((a, b) => {
        const codeCompare = a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' });
        if (codeCompare !== 0) return codeCompare;
        return a.name.localeCompare(b.name);
      });
    });

    return { sortedOffices, grouped };
  };

  const { sortedOffices, grouped } = getGroupedAndSortedCostCentres();

  return (
    <div id="partners-module" className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-6 rounded-none shadow-sm animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h3 className="text-base font-black text-slate-850 dark:text-slate-100 flex items-center gap-2 uppercase tracking-tight">
            <Users size={18} className="text-sky-500" />
            Partners & Financial Cost Center Allocation
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Register authorized program implementing partners and coordinate Agresso Cost Centers with designated workflows.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-50 dark:bg-slate-950 p-1 rounded-none border border-slate-200 text-xs text-slate-500 shrink-0">
          <button
            onClick={() => setActiveTab('partners')}
            className={`px-3 py-1.5 rounded-none font-bold cursor-pointer transition-colors ${
              activeTab === 'partners' ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-sm' : 'hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Implementing Partners
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className={`px-3 py-1.5 rounded-none font-bold cursor-pointer transition-colors ${
              activeTab === 'budget' ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-sm' : 'hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Agresso Cost Centre Workspace
          </button>
        </div>
      </div>

      {activeTab === 'partners' ? (
        <div className="mt-5 space-y-6">
          {/* Partners Registry UI */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form */}
            <div className="lg:col-span-4 bg-slate-50/50 p-5 border border-slate-200 rounded-none">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">
                Register New Partner
              </h4>
              <form onSubmit={handleCreatePartner} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Partner Name</label>
                  <input
                    type="text"
                    required
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="SC Alliance Partner"
                    className="w-full bg-white border border-slate-200 p-2 text-xs rounded-none outline-none focus:border-sky-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Partner Code</label>
                    <input
                      type="text"
                      required
                      value={partnerCode}
                      onChange={(e) => setPartnerCode(e.target.value)}
                      placeholder="SC-IDN"
                      className="w-full bg-white border border-slate-200 p-2 text-xs rounded-none outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Designated Role</label>
                    <select
                      value={partnerRole}
                      onChange={(e) => setPartnerRole(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 text-[11px] rounded-none outline-none focus:border-sky-500"
                    >
                      <option value="Implementing Partner">Implementing</option>
                      <option value="Assisting Partner">Assisting Partner</option>
                      <option value="Technical Advisor Partner">Tech Advisor</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Contact Officer</label>
                  <input
                    type="text"
                    value={partnerContact}
                    onChange={(e) => setPartnerContact(e.target.value)}
                    placeholder="Budi Santoso"
                    className="w-full bg-white border border-slate-200 p-2 text-xs rounded-none outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Officer Email</label>
                  <input
                    type="email"
                    value={partnerEmail}
                    onChange={(e) => setPartnerEmail(e.target.value)}
                    placeholder="budi@sc.org"
                    className="w-full bg-white border border-slate-200 p-2 text-xs rounded-none outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={['Closed', 'Abandoned', 'Pending'].some((term) => projectStore.currentState.includes(term))}
                  className="w-full py-2 bg-sky-500 hover:bg-sky-600 font-bold text-white rounded-none cursor-pointer text-xs disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wider transition-colors"
                >
                  Confirm Alliance Registration
                </button>
              </form>
            </div>

            {/* List */}
            <div className="lg:col-span-8">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">
                Registered Project Partners ({projectStore.partners.length})
              </h4>

              {projectStore.partners.length === 0 ? (
                <div className="py-12 border border-dashed text-center text-slate-400 text-xs rounded-xl bg-slate-50/20">
                  No registered alliances found for this project record.
                </div>
              ) : (
                <div className="space-y-2">
                  {projectStore.partners.map((p) => {
                    return (
                      <div key={p.id} className="p-3 bg-white border border-slate-150 rounded-lg flex items-center justify-between shadow-3xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-100 text-slate-700 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                              {p.code}
                            </span>
                            <span className="text-xs font-bold text-slate-800">{p.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                            <span>Role: <strong className="text-slate-600">{p.role}</strong></span>
                            <span>•</span>
                            <span>POC: {p.contactPerson} ({p.email})</span>
                          </div>
                        </div>

                        <button
                          onClick={() => deletePartner(p.id)}
                          disabled={['Closed', 'Abandoned', 'Pending'].some((term) => projectStore.currentState.includes(term))}
                          className="text-slate-355 hover:text-rose-500 p-1.5 text-slate-400 rounded transition-all cursor-pointer disabled:opacity-30"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-6">
          {/* Agresso workflows */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-none flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono tracking-wide uppercase text-slate-500 dark:text-slate-400">
                  Agresso Cost Center status:
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-none border uppercase ${
                  bh.status === BudgetHolderState.APPROVED
                    ? 'bg-emerald-50 text-emerald-650 border-emerald-250 font-black'
                    : bh.status === BudgetHolderState.PENDING_APPROVAL
                    ? 'bg-amber-50 text-amber-650 border-amber-250 animate-pulse font-black'
                    : 'bg-slate-100 text-slate-700 border-slate-205 font-black'
                }`}>
                  {bh.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Agresso workspace links. Cost centers only act as fully active funds after completing the 3-state workflow approvals.
              </p>
              {bh.comments && (
                <div className="text-[10px] bg-slate-100/50 text-slate-500 px-2 py-1 rounded-none max-w-md mt-2 italic border border-slate-200">
                  Approver Remarks: "{bh.comments}"
                </div>
              )}
            </div>

            {/* Workflow Action Triggers */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {!isBHTileEditable && (
                <div className="text-[10px] flex items-center gap-1 text-rose-500 bg-rose-50 border border-rose-200 p-2 rounded-none font-semibold leading-normal">
                  <ShieldAlert size={14} className="shrink-0" />
                  <span>Design/Delivery Approvers cannot modify budget structures.</span>
                </div>
              )}

              {isBHTileEditable && (
                <>
                  {bh.status === BudgetHolderState.DRAFT && (
                    <button
                      onClick={() => updateBudgetHolderStatus(BudgetHolderState.PENDING_APPROVAL)}
                      className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-none cursor-pointer uppercase tracking-wider transition-colors"
                    >
                      Submit Budget Holders for Approval
                    </button>
                  )}

                  {bh.status === BudgetHolderState.PENDING_APPROVAL && (
                    <div className="flex items-center gap-1.5 font-mono">
                      <button
                        onClick={() => updateBudgetHolderStatus(BudgetHolderState.APPROVED, 'Agresso credentials verified. Budget holders approved.')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-none cursor-pointer uppercase tracking-wider"
                      >
                        Approve Cost Centers
                      </button>
                      <button
                        onClick={() => updateBudgetHolderStatus(BudgetHolderState.DRAFT, 'Budget assignments rejected. Revise cost centers.')}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-none cursor-pointer uppercase tracking-wider"
                      >
                        Reject Workspace
                      </button>
                    </div>
                  )}

                  {bh.status === BudgetHolderState.APPROVED && (
                    <button
                      onClick={() => updateBudgetHolderStatus(BudgetHolderState.DRAFT, 'Amendments requested on active budgets.')}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-750 text-xs font-bold rounded-none cursor-pointer uppercase tracking-wider transition-colors"
                    >
                      Make Amendments (Return to Draft)
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Create cost centre */}
            <div className="lg:col-span-4 bg-slate-50/50 p-5 border border-slate-200 rounded-none">
              <h4 className="text-xs font-black text-slate-705 uppercase tracking-wide mb-3">
                Assign Agresso Cost Center
              </h4>
              <form onSubmit={handleCreateCostCentre} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Cost Center Code</label>
                  <input
                    type="text"
                    required
                    value={ccCode}
                    onChange={(e) => setCcCode(e.target.value)}
                    placeholder="e.g., 11004-90"
                    className="w-full bg-white border border-slate-200 p-2 text-xs rounded-none outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Fund Name Description</label>
                  <input
                    type="text"
                    required
                    value={ccName}
                    onChange={(e) => setCcName(e.target.value)}
                    placeholder="SC-Protection Core Fund"
                    className="w-full bg-white border border-slate-200 p-2 text-xs rounded-none outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Linked Programme Office</label>
                  <select
                    value={ccOffice}
                    onChange={(e) => setCcOffice(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-2 text-[11px] rounded-none outline-none focus:border-sky-500 cursor-pointer"
                  >
                    {projectStore.metadata.programmeOfficeUnits.map((office) => (
                      <option key={office} value={office}>
                        {office}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!isBHTileEditable || bh.status === BudgetHolderState.APPROVED}
                  className="w-full py-2 bg-sky-500 hover:bg-sky-600 font-bold text-white rounded-none cursor-pointer text-xs disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wider transition-colors"
                >
                  Add Cost Center
                </button>
              </form>
            </div>

            {/* List with alphanumerical sorting grouping */}
            <div className="lg:col-span-8">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1">
                Active Project Cost Center Assignments ({bh.costCentres.length})
              </h4>

              {sortedOffices.length === 0 ? (
                <div className="py-12 border border-dashed border-slate-200 rounded-none text-center text-slate-400 text-xs">
                  No cost centers registered. Please assign an Agresso code.
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedOffices.map((officeName) => {
                    const groupCc = grouped[officeName] || [];

                    return (
                      <div key={officeName} className="border border-slate-200 rounded-none p-4 bg-white">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-2 mb-3 font-mono header-sub">
                          🏢 Programme Office: {officeName}
                        </div>

                        <div className="space-y-2">
                          {groupCc.map((cc) => {
                            const isCCActive = bh.status === BudgetHolderState.APPROVED;

                            return (
                              <div key={cc.id} className="p-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-none flex items-center justify-between text-xs transition-colors">
                                <div>
                                  <span className="font-mono bg-slate-900 text-white px-2 py-0.5 rounded-none font-bold mr-2 text-[10px]">
                                    {cc.code}
                                  </span>
                                  <span className="font-semibold text-slate-800">{cc.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded-none border ${
                                    isCCActive
                                      ? 'bg-emerald-50 text-emerald-650 border-emerald-200'
                                      : 'bg-amber-50 text-amber-650 border-amber-200'
                                  }`}>
                                    {isCCActive ? 'Operational Funding' : 'Awaiting Approval'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
