/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MealProvider, useMeal } from './context/MealContext';
import { RoleSelector } from './components/RoleSelector';
import { TransitionController } from './components/TransitionController';
import { LogFrameModule } from './components/LogFrameModule';
import { DipModule } from './components/DipModule';
import { PartnersModule } from './components/PartnersModule';
import { ActionManagementModule } from './components/ActionManagementModule';
import { AuditHistoryModule } from './components/AuditHistoryModule';
import { ProjectState } from './types';
import {
  Folder,
  Sliders,
  Users,
  Grid,
  FileText,
  Calendar,
  Layers,
  History,
  Lock,
  Edit2,
  Clock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

function DashboardContent() {
  const { projectStore, updateMetadata, currentRole } = useMeal();
  const [activeTab, setActiveTab] = useState<'logframe' | 'dip' | 'partners' | 'actions' | 'audit'>('logframe');
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);

  // Editable metadata state fields
  const [editName, setEditName] = useState(projectStore.metadata.name);
  const [editTheme, setEditTheme] = useState(projectStore.metadata.theme);
  const [editSubTheme, setEditSubTheme] = useState(projectStore.metadata.subTheme);
  const [editStartDate, setEditStartDate] = useState(projectStore.metadata.startDate);
  const [editEndDate, setEditEndDate] = useState(projectStore.metadata.endDate);

  const meta = projectStore.metadata;
  const isStructureLocked = ['Closed', 'Abandoned', 'Pending Approval', 'Pending Project'].some((term) =>
    projectStore.currentState.includes(term)
  );

  const handleMetadataSave = (e: React.FormEvent) => {
    e.preventDefault();
    const success = updateMetadata({
      name: editName,
      theme: editTheme,
      subTheme: editSubTheme,
      startDate: editStartDate,
      endDate: editEndDate,
    });
    if (success) {
      setIsEditingMetadata(false);
    } else {
      alert('Action Blocked: Name and split details are locked once you transition past the Design phase.');
    }
  };

  const getActiveTabComponent = () => {
    switch (activeTab) {
      case 'logframe':
        return <LogFrameModule />;
      case 'dip':
        return <DipModule />;
      case 'partners':
        return <PartnersModule />;
      case 'actions':
        return <ActionManagementModule />;
      case 'audit':
        return <AuditHistoryModule />;
    }
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-150 flex flex-col font-sans select-none antialiased selection:bg-sky-100 selection:text-sky-900 transition-colors duration-200">
      
      {/* GLOBAL BANNER HEADER (Geometric Balance Style) */}
      <header className="h-20 bg-white dark:bg-slate-950 border-b border-slate-300 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center font-bold text-white text-base">P</div>
          <h1 className="text-slate-900 dark:text-white font-bold text-lg tracking-tight uppercase flex items-center gap-2">
            PRIME Workspace <span className="text-slate-400 font-light">/ Project MEAL Portal</span>
          </h1>
        </div>
        <div className="flex gap-4 items-center">
          <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold rounded-sm uppercase tracking-widest border border-emerald-250 dark:border-emerald-800">
            Active
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500 border-l border-slate-200 dark:border-slate-800 pl-4">
            <span className="text-slate-450">SCI-V4.12</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>June 19, 2026</span>
          </div>
        </div>
      </header>

      {/* CORE WRAPPER container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ROLE SIMULATOR GUARD AREA */}
        <RoleSelector />

        {/* PROJECT INFO summary card (Geometric Balance style) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-6 flex flex-col justify-between relative shadow-sm">
          {/* Stark indicator tag in top-right */}
          <div className="absolute top-0 right-0 p-4 flex items-center gap-2">
            <span className="hidden sm:inline text-[9px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider font-mono">
              Phase Status:
            </span>
            <span className="text-[10px] font-bold uppercase bg-slate-900 dark:bg-slate-800 text-white px-2.5 py-1 font-mono tracking-wide">
              {projectStore.currentState}
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-[10px] bg-slate-900 text-white font-mono font-bold px-2.5 py-0.5">
                01
              </span>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                Project Code: {meta.projectCode}
              </span>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold uppercase tracking-wider bg-sky-500/10 px-2.5 py-1 border border-sky-500/20">
                Theme: {meta.theme} ({meta.subTheme})
              </span>
            </div>

            {!isEditingMetadata ? (
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {meta.name}
                </h2>
                <p className="text-slate-500 dark:text-slate-450 text-xs leading-relaxed max-w-4xl">
                  This MEAL portal processes real-time indicator tracking performance tracking tables (IPTT), assigns Agresso Cost Centers, and details localized partners to comply with SCI governance validation checkpoints.
                </p>
              </div>
            ) : (
              <form onSubmit={handleMetadataSave} className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-250 dark:border-slate-800 space-y-4 animate-fadeIn">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-805 pb-2">
                  Modify Project Key Metadata
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                  <div className="md:col-span-12">
                    <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Project Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 text-xs outline-none focus:border-sky-500 text-slate-800 dark:text-slate-100 rounded-none"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Theme</label>
                    <input
                      type="text"
                      value={editTheme}
                      onChange={(e) => setEditTheme(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 text-xs outline-none focus:border-sky-500 text-slate-800 dark:text-slate-100 rounded-none"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Subtheme</label>
                    <input
                      type="text"
                      value={editSubTheme}
                      onChange={(e) => setEditSubTheme(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 text-xs outline-none focus:border-sky-500 text-slate-800 dark:text-slate-100 rounded-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Start Date</label>
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 text-xs font-mono outline-none focus:border-sky-500 text-slate-800 dark:text-slate-100 rounded-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">End Date</label>
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 text-xs font-mono outline-none focus:border-sky-500 text-slate-800 dark:text-slate-100 rounded-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 text-xs pt-2 border-t border-slate-250 dark:border-slate-805">
                  <button
                    type="button"
                    onClick={() => setIsEditingMetadata(false)}
                    className="px-3 py-1.5 border border-slate-250 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-350"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* Mini details list - Geometric row style */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 py-4 border-t border-slate-200 dark:border-slate-805 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              <div>
                <div className="text-slate-400 uppercase tracking-wider">PROJECT TIMELINE:</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-1">{meta.startDate} to {meta.endDate}</div>
              </div>
              <div>
                <div className="text-slate-400 uppercase tracking-wider">FIELD OFFICES:</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-1">{meta.implementingOffices.join(', ')}</div>
              </div>
              <div>
                <div className="text-slate-400 uppercase tracking-wider">DELIVERY START:</div>
                <div className="font-bold text-emerald-600 mt-1">
                  {meta.deliveryStartDate ? meta.deliveryStartDate : 'Not Initiated'}
                </div>
              </div>
              <div>
                <div className="text-slate-400 uppercase tracking-wider">CORE ALLIANCES:</div>
                <div className="font-bold text-sky-600 dark:text-sky-400 mt-1">
                  {projectStore.partners.length} Registered Alliances
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metadata parameters button locks */}
          <div className="shrink-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-805 pt-4 mt-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono">
              Workspace Registry Management
            </span>

            {!isEditingMetadata && (
              <button
                onClick={() => setIsEditingMetadata(true)}
                disabled={isStructureLocked}
                className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 border cursor-pointer select-none transition-colors rounded-none ${
                  isStructureLocked
                    ? 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-805 dark:border-slate-800 dark:text-slate-500 cursor-not-allowed opacity-55'
                    : 'bg-white hover:bg-slate-50 border-slate-300 dark:bg-slate-900 dark:border-slate-700 text-slate-805 dark:text-slate-200'
                }`}
              >
                <Edit2 size={12} className="text-sky-500" />
                <span>Configure Project Metadata</span>
              </button>
            )}
          </div>
        </div>

        {/* WORKFLOW STATE HUB CONTROLLER */}
        <TransitionController />

        {/* MODULE DRAWERS / BENTO SELECTOR SLIDER */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* LEFT: Bento-styled Modular Tiles Picker (Structured Sidebar Theme) */}
          <aside className="w-full md:w-64 bg-slate-900 flex flex-col border border-slate-800 shrink-0 self-stretch">
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-sky-500 rounded-sm flex items-center justify-center font-bold text-white text-xs">M</div>
                <h3 className="text-slate-300 font-bold text-xs tracking-tight uppercase">Meal Framework</h3>
              </div>
            </div>
            <nav className="flex-1 py-4">
              <ul className="space-y-1">
                {/* tab 1 */}
                <li id="tab-logframe">
                  <button
                    onClick={() => setActiveTab('logframe')}
                    className={`w-full px-5 py-3 flex items-center gap-3 text-xs transition-colors cursor-pointer border-r-4 text-left ${
                      activeTab === 'logframe'
                        ? 'bg-sky-500/10 border-sky-500 text-sky-400 font-medium'
                        : 'border-transparent hover:bg-slate-800/60 text-slate-400'
                    }`}
                  >
                    <span className={`text-[10px] font-mono ${activeTab === 'logframe' ? 'text-sky-400' : 'opacity-40'}`}>01</span>
                    <span className="flex-1">Log Frame & IPTT</span>
                  </button>
                </li>

                {/* tab 2 */}
                <li id="tab-dip">
                  <button
                    onClick={() => setActiveTab('dip')}
                    className={`w-full px-5 py-3 flex items-center gap-3 text-xs transition-colors cursor-pointer border-r-4 text-left ${
                      activeTab === 'dip'
                        ? 'bg-sky-500/10 border-sky-500 text-sky-400 font-medium'
                        : 'border-transparent hover:bg-slate-800/60 text-slate-400'
                    }`}
                  >
                    <span className={`text-[10px] font-mono ${activeTab === 'dip' ? 'text-sky-400' : 'opacity-40'}`}>02</span>
                    <span className="flex-1">DIP & Gantt Scheduler</span>
                  </button>
                </li>

                {/* tab 3 */}
                <li id="tab-partners">
                  <button
                    onClick={() => setActiveTab('partners')}
                    className={`w-full px-5 py-3 flex items-center gap-3 text-xs transition-colors cursor-pointer border-r-4 text-left ${
                      activeTab === 'partners'
                        ? 'bg-sky-500/10 border-sky-500 text-sky-400 font-medium'
                        : 'border-transparent hover:bg-slate-800/60 text-slate-400'
                    }`}
                  >
                    <span className={`text-[10px] font-mono ${activeTab === 'partners' ? 'text-sky-400' : 'opacity-40'}`}>03</span>
                    <span className="flex-1">Partners & Agresso</span>
                  </button>
                </li>

                {/* tab 4 */}
                <li id="tab-actions">
                  <button
                    onClick={() => setActiveTab('actions')}
                    className={`w-full px-5 py-3 flex items-center gap-3 text-xs transition-colors cursor-pointer border-r-4 text-left ${
                      activeTab === 'actions'
                        ? 'bg-sky-500/10 border-sky-500 text-sky-400 font-medium'
                        : 'border-transparent hover:bg-slate-800/60 text-slate-400'
                    }`}
                  >
                    <span className={`text-[10px] font-mono ${activeTab === 'actions' ? 'text-sky-400' : 'opacity-40'}`}>04</span>
                    <span className="flex-1 flex items-center justify-between font-medium">
                      <span>Task Actions</span>
                      <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-bold px-1 rounded uppercase">
                        open
                      </span>
                    </span>
                  </button>
                </li>

                {/* tab 5 */}
                <li id="tab-audit">
                  <button
                    onClick={() => setActiveTab('audit')}
                    className={`w-full px-5 py-3 flex items-center gap-3 text-xs transition-colors cursor-pointer border-r-4 text-left ${
                      activeTab === 'audit'
                        ? 'bg-sky-500/10 border-sky-500 text-sky-400 font-medium'
                        : 'border-transparent hover:bg-slate-800/60 text-slate-400'
                    }`}
                  >
                    <span className={`text-[10px] font-mono ${activeTab === 'audit' ? 'text-sky-400' : 'opacity-40'}`}>05</span>
                    <span className="flex-1">Governance Audit Log</span>
                  </button>
                </li>
              </ul>
            </nav>
            <div className="p-4 border-t border-slate-800 text-slate-500 text-[10px] font-mono uppercase tracking-wider">
              PRIME Live Env
            </div>
          </aside>

          {/* RIGHT: Selected Active Tile Canvas Container */}
          <div className="flex-1 w-full min-w-0">
            {getActiveTabComponent()}
          </div>
        </div>

      </main>

      {/* FOOTER credit info (Geometric Balance Style) */}
      <footer className="h-14 bg-white dark:bg-slate-950 border-t border-slate-250 dark:border-slate-850 px-8 flex items-center justify-between text-[11px] font-medium text-slate-500 uppercase tracking-widest shrink-0">
        <div className="flex gap-6 items-center">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Status: Synchronized
          </span>
          <span className="hidden md:inline">Server: ASIA-EAST-RUN-PORT-3000</span>
        </div>
        <div className="flex gap-4">
          <span className="text-slate-400 truncate max-w-xs sm:max-w-md">System Log: {new Date().toLocaleTimeString()} - Framework Theme Initialized</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <MealProvider>
      <DashboardContent />
    </MealProvider>
  );
}
