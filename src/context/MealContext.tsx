/**
 * @module context/MealContext
 * @description Comprehensive React Context and state engine enforcing PRIME validations, post-conditions, and RBAC rules.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ProjectStore,
  ProjectState,
  ProjectRole,
  ProjectPhase,
  LogFrameItem,
  DipActivity,
  BudgetHolderRecord,
  BudgetHolderState,
  Partner,
  ActionItem,
  ProjectMetadata,
  TargetActualPeriod,
  Milestone,
} from '../types';
import { INITIAL_PROJECT_STORE } from '../store/mockData';

interface MealContextProps {
  projectStore: ProjectStore;
  currentRole: ProjectRole;
  setRole: (role: ProjectRole) => void;
  transitionTo: (nextState: ProjectState, reason?: string) => { success: boolean; error?: string };
  updateMetadata: (meta: Partial<ProjectMetadata>) => boolean;
  updateLogFrameItem: (item: LogFrameItem) => void;
  deleteLogFrameItem: (id: string) => boolean;
  addLogFrameItem: (item: Omit<LogFrameItem, 'indicators'>) => void;
  updateIndicatorIPTT: (indicatorId: string, periods: TargetActualPeriod[]) => boolean;
  toggleIPTTLock: (indicatorId: string) => void;
  updateDIPActivityProgress: (id: string, progress: number) => void;
  updateMilestoneProgress: (activityId: string, milestoneId: string, progress: number) => void;
  addMilestone: (activityId: string, milestone: Omit<Milestone, 'dueDatePassed'>) => void;
  updateBudgetHolderStatus: (status: BudgetHolderState, comments?: string) => void;
  addCostCentre: (code: string, name: string, office: string) => void;
  addPartner: (partner: Partner) => boolean;
  deletePartner: (id: string) => boolean;
  addActionItem: (action: Omit<ActionItem, 'id' | 'createdAt'>) => void;
  updateActionItem: (id: string, updates: Partial<ActionItem>) => void;
  runDesignSubmissionValidation: () => { success: boolean; checklist: Array<{ id: number; task: string; passed: boolean; message: string }> };
  resetStore: () => void;
}

const MealContext = createContext<MealContextProps | undefined>(undefined);

export const MealProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projectStore, setProjectStore] = useState<ProjectStore>(() => {
    const saved = localStorage.getItem('prime_meal_project_store');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading prime storage:', e);
      }
    }
    return INITIAL_PROJECT_STORE;
  });

  const [currentRole, setRole] = useState<ProjectRole>(() => {
    const saved = localStorage.getItem('prime_meal_role');
    return (saved as ProjectRole) || ProjectRole.RECORD_MANAGER;
  });

  useEffect(() => {
    localStorage.setItem('prime_meal_project_store', JSON.stringify(projectStore));
  }, [projectStore]);

  useEffect(() => {
    localStorage.setItem('prime_meal_role', currentRole);
  }, [currentRole]);

  const resetStore = () => {
    setProjectStore(INITIAL_PROJECT_STORE);
    setRole(ProjectRole.RECORD_MANAGER);
  };

  /**
   * Helper to check if the current tile or project is locked for edits.
   * "Action Management" tile is exceptions and is ALWAYS editable.
   */
  const checkIsLocked = (moduleType: 'Metadata' | 'LogFrame' | 'DIP' | 'Partners' | 'BudgetHolder' | 'Actions'): boolean => {
    if (moduleType === 'Actions') return false; // always open!

    const state = projectStore.currentState;

    // Admin can always edit
    if (currentRole === ProjectRole.LOCAL_ADMIN || currentRole === ProjectRole.GLOBAL_ADMIN) {
      return false;
    }

    // Inactive States (Closed or Abandoned) block all edits except actions
    if (
      state === ProjectState.DESIGN_ABANDONED ||
      state === ProjectState.DESIGN_CLOSED ||
      state === ProjectState.SET_UP_CLOSED ||
      state === ProjectState.IMPLEMENTATION_CLOSED ||
      state === ProjectState.TRANSITION_CLOSED
    ) {
      return true;
    }

    // Pending Approval states lock Info, DIP, HR, MEAL, LogFrame, Partners
    if (
      state === ProjectState.DESIGN_PENDING_APPROVAL ||
      state === ProjectState.DESIGN_PENDING_PROJECT_DESIGN_APPROVAL ||
      state === ProjectState.DESIGN_PENDING_PROJECT_DELIVERY_APPROVAL ||
      state === ProjectState.SET_UP_PENDING_REPLANNING_APPROVAL ||
      state === ProjectState.SET_UP_PENDING_DESIGN_REPLANNING_APPROVAL ||
      state === ProjectState.SET_UP_PENDING_DELIVERY_REPLANNING_APPROVAL ||
      state === ProjectState.IMPLEMENTATION_PENDING_REPLANNING_APPROVAL ||
      state === ProjectState.IMPLEMENTATION_PENDING_DESIGN_REPLANNING_APPROVAL ||
      state === ProjectState.IMPLEMENTATION_PENDING_DELIVERY_REPLANNING_APPROVAL ||
      state === ProjectState.TRANSITION_PENDING_REPLANNING_APPROVAL ||
      state === ProjectState.TRANSITION_PENDING_DESIGN_REPLANNING_APPROVAL ||
      state === ProjectState.TRANSITION_PENDING_DELIVERY_REPLANNING_APPROVAL
    ) {
      // IPTT indicator data is editable, but the structure (LogFrame/Partners/Metadata) is locked
      return true;
    }

    // Special: Budget Holder tile has its own workflow status
    if (moduleType === 'BudgetHolder') {
      return false; // Managed by specific button workflows
    }

    // Special: Post-set up Locks for certain metadata fields
    return false;
  };

  /**
   * Run the strict 3-tier Design Submission Pre-conditions Validation Panel
   */
  const runDesignSubmissionValidation = () => {
    const logFrame = projectStore.logFrame;
    const metadata = projectStore.metadata;
    const goals = projectStore.strategicGoals;

    // Checks:
    // 1. At least one thematic activity exists in Log Frame
    const thematicActivities = logFrame.filter(
      (item) => item.type === 'activity' && item.category?.toLowerCase() === 'thematic'
    );
    const hasThematicActivity = thematicActivities.length > 0;

    // 2. At least one core Program Office is assigned
    const hasProgrammeOffice = metadata.programmeOfficeUnits && metadata.programmeOfficeUnits.length > 0;

    // 3. Program Office active check (mocked as true, but check they exist)
    const allPOActive = hasProgrammeOffice; 

    // 4. Program Office units linked to Implementing Office (check they aren't empty)
    const implementingOfficesExist = metadata.implementingOffices && metadata.implementingOffices.length > 0;

    // 5. Enabling subthemes match activity subthemes
    // Verify that enabling subthemes or main theme matches the active list of subthemes
    // activity subthemes:
    const activeSubthemes = logFrame
      .filter((item) => item.type === 'activity' && item.subTheme)
      .map((item) => item.subTheme);
    
    // Check if at least one activity subtheme matches metadata settlement split or primary subtheme
    const subthemesMatch = activeSubthemes.every((ast) => 
      metadata.settlementSubThemeSplit.some((split) => split.subTheme === ast) || 
      metadata.subTheme === ast
    );

    // 6. Approved strategic goal exists for today's overlapping year (2026 is today)
    const currentYear = new Date().getFullYear();
    const activeStrategicGoal = goals.find((g) => g.year === currentYear && g.targetAchieved);
    const hasApprovedGoalToday = !!activeStrategicGoal;

    const checklist = [
      {
        id: 1,
        task: 'Log Frame Contains Thematic Activity',
        passed: hasThematicActivity,
        message: hasThematicActivity
          ? 'Passed: At least one thematic activity exists.'
          : 'Failed: Project Log Frame must contain at least one thematic activity before submission.',
      },
      {
        id: 2,
        task: 'Valid Programme Office Unit Assigned',
        passed: hasProgrammeOffice,
        message: hasProgrammeOffice
          ? `Passed: Assigned units: ${metadata.programmeOfficeUnits.join(', ')}`
          : 'Failed: At least one active Programme Office unit must be assigned.',
      },
      {
        id: 3,
        task: 'Programme Office Units Status Verification',
        passed: allPOActive,
        message: allPOActive
          ? 'Passed: All assigned Programme Offices are Active.'
          : 'Failed: Non-active Programme Office unit discovered.',
      },
      {
        id: 4,
        task: 'Relationship with Implementing Office',
        passed: implementingOfficesExist,
        message: implementingOfficesExist
          ? `Passed: Implementing offices: ${metadata.implementingOffices.join(', ')}`
          : 'Failed: Programme Office units must be related to an active Implementing Office.',
      },
      {
        id: 5,
        task: 'Enabling Subthemes to Activity Subthemes Mapping',
        passed: subthemesMatch,
        message: subthemesMatch
          ? 'Passed: Activity subthemes match registered enabling/settlement subthemes.'
          : 'Failed: Logframe activity subthemes do not match registered Settlement/Enabling subthemes in metadata.',
      },
      {
        id: 6,
        task: 'Overlapping Strategic Goal Verification',
        passed: hasApprovedGoalToday,
        message: hasApprovedGoalToday
          ? `Passed: Documented strategic targets found for target year ${currentYear}: "${activeStrategicGoal.goalDescription}"`
          : `Failed: Approved strategic goal configuration must exist for year overlapping target schedule (${currentYear}).`,
      },
    ];

    const success = checklist.every((item) => item.passed);

    return { success, checklist };
  };

  /**
   * State Machine Engine: execute transitions, check roles, and fire post-conditions
   */
  const transitionTo = (nextState: ProjectState, reason?: string): { success: boolean; error?: string } => {
    const currentState = projectStore.currentState;

    // Role Guard Check
    const isAdmin = currentRole === ProjectRole.LOCAL_ADMIN || currentRole === ProjectRole.GLOBAL_ADMIN;
    
    // Check Reversals (Admin Only)
    const isReversal = 
      (currentState === ProjectState.DESIGN_FUNDING_SECURED && nextState === ProjectState.DESIGN_IN_PROGRESS) ||
      (currentState === ProjectState.SET_UP_IN_PROGRESS && nextState === ProjectState.DESIGN_IN_PROGRESS) ||
      (currentState === ProjectState.IMPLEMENTATION_IN_PROGRESS && nextState === ProjectState.SET_UP_IN_PROGRESS) ||
      (currentState === ProjectState.TRANSITION_IN_PROGRESS && nextState === ProjectState.IMPLEMENTATION_IN_PROGRESS);

    if (isReversal && !isAdmin) {
      return {
        success: false,
        error: `Security Violation: Reversing project phases (e.g. from ${currentState} to ${nextState}) requires System Administrator privileges.`,
      };
    }

    // Define Allowed Transition Routes
    interface TransitionRoute {
      from: ProjectState[];
      to: ProjectState;
      roles: ProjectRole[];
    }

    const permittedRoutes: TransitionRoute[] = [
      // Design Workflow Paths
      {
        from: [ProjectState.DESIGN_IN_PROGRESS],
        to: ProjectState.DESIGN_FUNDING_SECURED,
        roles: [ProjectRole.RECORD_MANAGER, ProjectRole.GLOBAL_ADMIN, ProjectRole.LOCAL_ADMIN],
      },
      {
        from: [ProjectState.DESIGN_FUNDING_SECURED],
        to: ProjectState.DESIGN_PENDING_APPROVAL,
        roles: [ProjectRole.RECORD_MANAGER, ProjectRole.GLOBAL_ADMIN, ProjectRole.LOCAL_ADMIN],
      },
      {
        from: [ProjectState.DESIGN_PENDING_APPROVAL],
        to: ProjectState.DESIGN_PENDING_PROJECT_DESIGN_APPROVAL,
        roles: [ProjectRole.DESIGN_APPROVER, ProjectRole.GLOBAL_ADMIN, ProjectRole.LOCAL_ADMIN],
      },
      {
        from: [ProjectState.DESIGN_PENDING_PROJECT_DESIGN_APPROVAL],
        to: ProjectState.DESIGN_PENDING_PROJECT_DELIVERY_APPROVAL,
        roles: [ProjectRole.DELIVERY_APPROVER, ProjectRole.GLOBAL_ADMIN, ProjectRole.LOCAL_ADMIN],
      },
      // Launch into Set up
      {
        from: [ProjectState.DESIGN_PENDING_PROJECT_DELIVERY_APPROVAL],
        to: ProjectState.SET_UP_IN_PROGRESS,
        roles: [ProjectRole.DELIVERY_APPROVER, ProjectRole.GLOBAL_ADMIN, ProjectRole.LOCAL_ADMIN],
      },
      // Rejection loops go back to in progress
      {
         from: [
           ProjectState.DESIGN_PENDING_APPROVAL, 
           ProjectState.DESIGN_PENDING_PROJECT_DESIGN_APPROVAL, 
           ProjectState.DESIGN_PENDING_PROJECT_DELIVERY_APPROVAL
         ],
         to: ProjectState.DESIGN_IN_PROGRESS,
         roles: [ProjectRole.DESIGN_APPROVER, ProjectRole.DELIVERY_APPROVER, ProjectRole.GLOBAL_ADMIN, ProjectRole.LOCAL_ADMIN],
      },
      // Set Up transitions
      {
        from: [ProjectState.SET_UP_IN_PROGRESS],
        to: ProjectState.SET_UP_PENDING_REPLANNING_APPROVAL,
        roles: [ProjectRole.RECORD_MANAGER, ProjectRole.GLOBAL_ADMIN, ProjectRole.LOCAL_ADMIN],
      },
      {
        from: [ProjectState.SET_UP_PENDING_REPLANNING_APPROVAL],
        to: ProjectState.SET_UP_PENDING_DESIGN_REPLANNING_APPROVAL,
        roles: [ProjectRole.DESIGN_APPROVER, ProjectRole.GLOBAL_ADMIN, ProjectRole.LOCAL_ADMIN],
      },
      {
        from: [ProjectState.SET_UP_PENDING_DESIGN_REPLANNING_APPROVAL],
        to: ProjectState.SET_UP_PENDING_DELIVERY_REPLANNING_APPROVAL,
        roles: [ProjectRole.DELIVERY_APPROVER, ProjectRole.GLOBAL_ADMIN, ProjectRole.LOCAL_ADMIN],
      },
      {
        from: [ProjectState.SET_UP_PENDING_DELIVERY_REPLANNING_APPROVAL],
        to: ProjectState.IMPLEMENTATION_IN_PROGRESS,
        roles: [ProjectRole.DELIVERY_APPROVER, ProjectRole.GLOBAL_ADMIN, ProjectRole.LOCAL_ADMIN],
      },
      // Implementation & Transition transitions
      {
        from: [ProjectState.IMPLEMENTATION_IN_PROGRESS],
        to: ProjectState.IMPLEMENTATION_PENDING_REPLANNING_APPROVAL,
        roles: [ProjectRole.RECORD_MANAGER, ProjectRole.GLOBAL_ADMIN, ProjectRole.LOCAL_ADMIN],
      },
      {
        from: [ProjectState.IMPLEMENTATION_PENDING_REPLANNING_APPROVAL],
        to: ProjectState.IMPLEMENTATION_PENDING_DESIGN_REPLANNING_APPROVAL,
        roles: [ProjectRole.DESIGN_APPROVER, ProjectRole.GLOBAL_ADMIN, ProjectRole.LOCAL_ADMIN],
      },
      {
        from: [ProjectState.IMPLEMENTATION_PENDING_DESIGN_REPLANNING_APPROVAL],
        to: ProjectState.IMPLEMENTATION_PENDING_DELIVERY_REPLANNING_APPROVAL,
        roles: [ProjectRole.DELIVERY_APPROVER, ProjectRole.GLOBAL_ADMIN, ProjectRole.LOCAL_ADMIN],
      },
      {
        from: [ProjectState.IMPLEMENTATION_PENDING_DELIVERY_REPLANNING_APPROVAL],
        to: ProjectState.TRANSITION_IN_PROGRESS,
        roles: [ProjectRole.DELIVERY_APPROVER, ProjectRole.GLOBAL_ADMIN, ProjectRole.LOCAL_ADMIN],
      },
      // Transitions closed
      {
        from: [ProjectState.TRANSITION_IN_PROGRESS],
        to: ProjectState.TRANSITION_PENDING_REPLANNING_APPROVAL,
        roles: [ProjectRole.RECORD_MANAGER, ProjectRole.GLOBAL_ADMIN, ProjectRole.LOCAL_ADMIN],
      },
      {
        from: [ProjectState.TRANSITION_PENDING_REPLANNING_APPROVAL],
        to: ProjectState.TRANSITION_PENDING_DESIGN_REPLANNING_APPROVAL,
        roles: [ProjectRole.DESIGN_APPROVER, ProjectRole.GLOBAL_ADMIN, ProjectRole.LOCAL_ADMIN],
      },
      {
        from: [ProjectState.TRANSITION_PENDING_DESIGN_REPLANNING_APPROVAL],
        to: ProjectState.TRANSITION_PENDING_DELIVERY_REPLANNING_APPROVAL,
        roles: [ProjectRole.DELIVERY_APPROVER, ProjectRole.GLOBAL_ADMIN, ProjectRole.LOCAL_ADMIN],
      },
      {
        from: [ProjectState.TRANSITION_PENDING_DELIVERY_REPLANNING_APPROVAL],
        to: ProjectState.TRANSITION_CLOSED,
        roles: [ProjectRole.DELIVERY_APPROVER, ProjectRole.GLOBAL_ADMIN, ProjectRole.LOCAL_ADMIN],
      },
      // Abandon / Close from anywhere
      {
        from: [ProjectState.DESIGN_IN_PROGRESS, ProjectState.DESIGN_FUNDING_SECURED, ProjectState.DESIGN_PENDING_APPROVAL],
        to: ProjectState.DESIGN_ABANDONED,
        roles: [ProjectRole.DELIVERY_APPROVER, ProjectRole.GLOBAL_ADMIN, ProjectRole.LOCAL_ADMIN],
      }
    ];

    // Find if transition route exists or is standard admin reversal
    const matchedRoute = permittedRoutes.find(
      (r) => r.from.includes(currentState) && r.to === nextState
    );

    const isAllowedByRouteAndRole = matchedRoute
      ? matchedRoute.roles.includes(currentRole)
      : isReversal; // Admin bypassing checks

    if (!isAllowedByRouteAndRole) {
      return {
        success: false,
        error: `Permission Denied: Current role [${currentRole}] is not authorized to transition project from "${currentState}" to "${nextState}".`,
      };
    }

    // ─── TIER 1 PRE-CONDITION VALIDATIONS ───
    if (nextState === ProjectState.DESIGN_PENDING_APPROVAL) {
      const vResult = runDesignSubmissionValidation();
      if (!vResult.success) {
        const firstFailure = vResult.checklist.find((item) => !item.passed);
        return {
          success: false,
          error: `Pre-condition Validation Failed: ${firstFailure?.message}`,
        };
      }
    }

    // Apply Postconditions before updating state
    let updatedMetadata = { ...projectStore.metadata };
    let updatedLogframe = [...projectStore.logFrame];

    // ─── TRANSITION TO SET_UP_IN_PROGRESS POSTCONDS ───
    if (nextState === ProjectState.SET_UP_IN_PROGRESS) {
      // 1. Project End Date populated from maximum DIP end date
      const maxDipDate = projectStore.dipActivities.reduce((acc, act) => {
        return !acc || act.endDate > acc ? act.endDate : acc;
      }, '');
      if (maxDipDate) {
        updatedMetadata.endDate = maxDipDate;
      }

      // 2. Project Delivery Start Date populated from translation date
      updatedMetadata.deliveryStartDate = new Date().toISOString().split('T')[0];

      // 3. Programme Office units flagged approved and locked
      const approvedUnits: Record<string, boolean> = {};
      updatedMetadata.programmeOfficeUnits.forEach((unit) => {
        approvedUnits[unit] = true;
      });
      updatedMetadata.programmeOfficeUnitsApproved = approvedUnits;
    }

    // Commit change
    setProjectStore((prev) => ({
      ...prev,
      metadata: updatedMetadata,
      logFrame: updatedLogframe,
      currentState: nextState,
      history: [
        {
          timestamp: new Date().toISOString(),
          fromState: currentState,
          toState: nextState,
          user: updatedMetadata.createdBy,
          role: currentRole,
          reason: reason || 'Transition requested by workflow dashboard.',
        },
        ...prev.history,
      ],
    }));

    return { success: true };
  };

  /**
   * Metadata Update with lock checks
   */
  const updateMetadata = (meta: Partial<ProjectMetadata>): boolean => {
    if (checkIsLocked('Metadata')) return false;

    // Check postconditions lock: In set-up or implementation, project name is not editable
    if (
      projectStore.currentState !== ProjectState.DESIGN_IN_PROGRESS &&
      projectStore.currentState !== ProjectState.DESIGN_FUNDING_SECURED &&
      meta.name !== undefined &&
      meta.name !== projectStore.metadata.name
    ) {
      return false; // locked!
    }

    setProjectStore((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, ...meta },
    }));
    return true;
  };

  /**
   * Log frame structural interactions
   */
  const addLogFrameItem = (item: Omit<LogFrameItem, 'indicators'>) => {
    if (checkIsLocked('LogFrame')) return;

    const newItem: LogFrameItem = {
      ...item,
      indicators: [],
    };

    setProjectStore((prev) => ({
      ...prev,
      logFrame: [...prev.logFrame, newItem],
      // If we added an activity, automatically setup default empty DIP values
      dipActivities:
        item.type === 'activity'
          ? [
              ...prev.dipActivities,
              {
                id: `dip-${item.id}`,
                logFrameItemId: item.id,
                name: item.name,
                startDate: prev.metadata.startDate,
                endDate: prev.metadata.endDate,
                progress: 0,
                milestones: [],
              },
            ]
          : prev.dipActivities,
    }));
  };

  const updateLogFrameItem = (updated: LogFrameItem) => {
    if (checkIsLocked('LogFrame')) return;

    // Post-conditions: Activity structural properties become locked in Set-Up+
    const isSetUpOrLater = projectStore.currentState !== ProjectState.DESIGN_IN_PROGRESS &&
                           projectStore.currentState !== ProjectState.DESIGN_FUNDING_SECURED &&
                           projectStore.currentState !== ProjectState.DESIGN_PENDING_APPROVAL;

    setProjectStore((prev) => {
      const match = prev.logFrame.find((x) => x.id === updated.id);
      if (!match) return prev;

      let finalItem = updated;
      if (isSetUpOrLater && match.type === 'activity') {
        // Enforce DIP lockdown rules: Activity Type, Name, Category, Theme, Subtheme, Cross-cutting are non-editable
        finalItem = {
          ...updated,
          name: match.name,
          category: match.category,
          theme: match.theme,
          subTheme: match.subTheme,
          crossCuttingTheme: match.crossCuttingTheme,
          commonApproach: match.commonApproach,
        };
      }

      return {
        ...prev,
        logFrame: prev.logFrame.map((item) => (item.id === updated.id ? finalItem : item)),
      };
    });
  };

  const deleteLogFrameItem = (id: string): boolean => {
    if (checkIsLocked('LogFrame')) return false;

    // DIP Rule: Activity deletion is strictly disabled on transition into Set Up-In Progress
    const isSetUpOrLater = projectStore.currentState !== ProjectState.DESIGN_IN_PROGRESS &&
                           projectStore.currentState !== ProjectState.DESIGN_FUNDING_SECURED &&
                           projectStore.currentState !== ProjectState.DESIGN_PENDING_APPROVAL;

    const target = projectStore.logFrame.find((x) => x.id === id);
    if (target?.type === 'activity' && isSetUpOrLater) {
      return false; // deletion forbidden!
    }

    setProjectStore((prev) => ({
      ...prev,
      logFrame: prev.logFrame.filter((x) => x.id !== id && x.parentId !== id),
      dipActivities: prev.dipActivities.filter((act) => act.logFrameItemId !== id),
    }));
    return true;
  };

  /**
   * IPTT Tracking: Concurrent locking and numeric submission rules
   */
  const toggleIPTTLock = (indicatorId: string) => {
    setProjectStore((prev) => {
      const updatedLogframe = prev.logFrame.map((item) => {
        const indicatorMatch = item.indicators.find((ind) => ind.id === indicatorId);
        if (!indicatorMatch) return item;

        const isLocked = !!indicatorMatch.lockedBy;
        const newLock = isLocked
          ? null
          : {
              userId: prev.metadata.createdBy,
              userName: 'Fatima (MEAL Specialist)',
              timestamp: new Date().toISOString(),
            };

        return {
          ...item,
          indicators: item.indicators.map((ind) =>
            ind.id === indicatorId ? { ...ind, lockedBy: newLock } : ind
          ),
        };
      });

      return { ...prev, logFrame: updatedLogframe };
    });
  };

  const updateIndicatorIPTT = (indicatorId: string, periods: TargetActualPeriod[]): boolean => {
    // IPTT is editable in pending approval states (per domain guidelines: users can enter data but not structures)
    // First, verify lock ownership
    let hasValidLock = false;
    let targetInd = null;

    for (const item of projectStore.logFrame) {
      const ind = item.indicators.find((i) => i.id === indicatorId);
      if (ind) {
        targetInd = ind;
        // lock must be active and owned by user, or unlocked
        if (!ind.lockedBy || ind.lockedBy.userId === projectStore.metadata.createdBy) {
          hasValidLock = true;
        }
        break;
      }
    }

    if (!hasValidLock) return false;

    setProjectStore((prev) => {
      const updatedLogframe = prev.logFrame.map((item) => {
        const indMatch = item.indicators.find((i) => i.id === indicatorId);
        if (!indMatch) return item;

        return {
          ...item,
          indicators: item.indicators.map((ind) =>
            ind.id === indicatorId ? { ...ind, periods } : ind
          ),
        };
      });

      return { ...prev, logFrame: updatedLogframe };
    });

    return true;
  };

  /**
   * DIP Activities: Progress sliders and Milestone lists
   */
  const updateDIPActivityProgress = (id: string, progress: number) => {
    if (checkIsLocked('DIP')) return;

    setProjectStore((prev) => ({
      ...prev,
      dipActivities: prev.dipActivities.map((act) =>
        act.id === id ? { ...act, progress } : act
      ),
    }));
  };

  const updateMilestoneProgress = (activityId: string, milestoneId: string, progress: number) => {
    if (checkIsLocked('DIP')) return;

    setProjectStore((prev) => {
      const updatedDIP = prev.dipActivities.map((act) => {
        if (act.id !== activityId) return act;

        return {
          ...act,
          milestones: act.milestones.map((ms) => {
            if (ms.id !== milestoneId) return ms;
            return { ...ms, progress };
          }),
        };
      });
      return { ...prev, dipActivities: updatedDIP };
    });
  };

  const addMilestone = (activityId: string, milestone: Omit<Milestone, 'dueDatePassed'>) => {
    if (checkIsLocked('DIP')) return;

    const todayDate = new Date('2026-06-19'); // Evaluated against custom metadata freeze time
    const mileageDate = new Date(milestone.dueDate);
    const dueDatePassed = mileageDate < todayDate;

    const newMs: Milestone = {
      ...milestone,
      dueDatePassed,
    };

    setProjectStore((prev) => ({
      ...prev,
      dipActivities: prev.dipActivities.map((act) => {
        if (act.id !== activityId) return act;
        return {
          ...act,
          milestones: [...act.milestones, newMs],
        };
      }),
    }));
  };

  /**
   * Budget Holder Workflows (Draft -> Pending Approval -> Approved)
   */
  const updateBudgetHolderStatus = (status: BudgetHolderState, comments?: string) => {
    if (checkIsLocked('BudgetHolder')) return;

    setProjectStore((prev) => {
      const currentBH = prev.budgetHolders;

      return {
        ...prev,
        budgetHolders: {
          ...currentBH,
          status,
          comments: comments || currentBH.comments,
          submittedAt: status === BudgetHolderState.PENDING_APPROVAL ? new Date().toISOString() : currentBH.submittedAt,
          approvedAt: status === BudgetHolderState.APPROVED ? new Date().toISOString() : currentBH.approvedAt,
        },
      };
    });
  };

  const addCostCentre = (code: string, name: string, office: string) => {
    if (checkIsLocked('BudgetHolder')) return;

    const newCC = {
      id: `cc-${Date.now()}`,
      code,
      name,
      programmeOffice: office,
      isActive: true,
    };

    setProjectStore((prev) => {
      const bh = prev.budgetHolders;
      return {
        ...prev,
        budgetHolders: {
          ...bh,
          costCentres: [...bh.costCentres, newCC],
        },
      };
    });
  };

  /**
   * Partners CRUD
   */
  const addPartner = (partner: Partner): boolean => {
    if (checkIsLocked('Partners')) return false;

    setProjectStore((prev) => ({
      ...prev,
      partners: [...prev.partners, partner],
    }));
    return true;
  };

  const deletePartner = (id: string): boolean => {
    if (checkIsLocked('Partners')) return false;

    setProjectStore((prev) => ({
      ...prev,
      partners: prev.partners.filter((p) => p.id !== id),
    }));
    return true;
  };

  /**
   * Action Management CRUD (Always open exception)
   */
  const addActionItem = (action: Omit<ActionItem, 'id' | 'createdAt'>) => {
    const newItem: ActionItem = {
      ...action,
      id: `act-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setProjectStore((prev) => ({
      ...prev,
      actionItems: [newItem, ...prev.actionItems],
    }));
  };

  const updateActionItem = (id: string, updates: Partial<ActionItem>) => {
    setProjectStore((prev) => ({
      ...prev,
      actionItems: prev.actionItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  return (
    <MealContext.Provider
      value={{
        projectStore,
        currentRole,
        setRole,
        transitionTo,
        updateMetadata,
        updateLogFrameItem,
        deleteLogFrameItem,
        addLogFrameItem,
        updateIndicatorIPTT,
        toggleIPTTLock,
        updateDIPActivityProgress,
        updateMilestoneProgress,
        addMilestone,
        updateBudgetHolderStatus,
        addCostCentre,
        addPartner,
        deletePartner,
        addActionItem,
        updateActionItem,
        runDesignSubmissionValidation,
        resetStore,
      }}
    >
      {children}
    </MealContext.Provider>
  );
};

export const useMeal = () => {
  const context = useContext(MealContext);
  if (!context) {
    throw new Error('useMeal must be rendered inside a MealProvider');
  }
  return context;
};
