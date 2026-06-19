/**
 * @module types
 * @description Domain models and TypeScript declarations for the PRIME MEAL System.
 */

export enum ProjectRole {
  RECORD_MANAGER = 'Project Record Manager',
  DESIGN_APPROVER = 'Project Design Approver',
  DELIVERY_APPROVER = 'Project Delivery Approver',
  PDQ_DIRECTOR = 'PDQ Director',
  BUDGET_HOLDERS_APPROVER = 'Project Budget Holders Approver',
  LOCAL_ADMIN = 'Local System Administrator',
  GLOBAL_ADMIN = 'Global System Administrator',
}

export enum ProjectPhase {
  DESIGN = 'Design',
  SET_UP = 'Set Up',
  IMPLEMENTATION = 'Implementation',
  TRANSITION = 'End of Project Transition',
}

export enum ProjectState {
  // Design phase states
  DESIGN_IN_PROGRESS = 'Design-In Progress',
  DESIGN_FUNDING_SECURED = 'Design-Funding Secured',
  DESIGN_PENDING_APPROVAL = 'Design-Pending Approval',
  DESIGN_PENDING_PROJECT_DESIGN_APPROVAL = 'Design-Pending Project Design Approval',
  DESIGN_PENDING_PROJECT_DELIVERY_APPROVAL = 'Design-Pending Project Delivery Approval',
  DESIGN_ABANDONED = 'Design-Abandoned',
  DESIGN_CLOSED = 'Design-Closed',

  // Set Up phase states
  SET_UP_IN_PROGRESS = 'Set Up-In Progress',
  SET_UP_PENDING_REPLANNING_APPROVAL = 'Set Up-Pending Re-planning Approval',
  SET_UP_PENDING_DESIGN_REPLANNING_APPROVAL = 'Set Up-Pending Project Design Re-planning Approval',
  SET_UP_PENDING_DELIVERY_REPLANNING_APPROVAL = 'Set Up-Pending Project Delivery Re-planning Approval',
  SET_UP_CLOSED = 'Set Up-Closed',

  // Implementation phase states
  IMPLEMENTATION_IN_PROGRESS = 'Implementation-In Progress',
  IMPLEMENTATION_PENDING_REPLANNING_APPROVAL = 'Implementation-Pending Re-planning Approval',
  IMPLEMENTATION_PENDING_DESIGN_REPLANNING_APPROVAL = 'Implementation-Pending Project Design Re-planning Approval',
  IMPLEMENTATION_PENDING_DELIVERY_REPLANNING_APPROVAL = 'Implementation-Pending Project Delivery Re-planning Approval',
  IMPLEMENTATION_CLOSED = 'Implementation-Closed',

  // End of Project Transition phase states
  TRANSITION_IN_PROGRESS = 'End of Project Transition-In Progress',
  TRANSITION_PENDING_REPLANNING_APPROVAL = 'End of Project Transition-Pending Re-planning Approval',
  TRANSITION_PENDING_DESIGN_REPLANNING_APPROVAL = 'End of Project Transition-Pending Project Design Re-planning Approval',
  TRANSITION_PENDING_DELIVERY_REPLANNING_APPROVAL = 'End of Project Transition-Pending Project Delivery Re-planning Approval',
  TRANSITION_CLOSED = 'End of Project Transition-Closed',
}

export interface ProjectMetadata {
  id: string;
  projectCode: string;
  name: string;
  theme: string;
  subTheme: string;
  enablingSubthemes: string[];
  programmeOfficeUnits: string[]; // e.g. ["Asia-East-PO", "Africa-West-PO"]
  programmeOfficeUnitsApproved: Record<string, boolean>; // locked on transitions
  implementingOffices: string[]; // linked to Programme Offices
  settlementSubThemeSplit: Array<{ subTheme: string; percentage: number }>;
  startDate: string;
  endDate: string;
  deliveryStartDate?: string;
  createdBy: string;
}

export enum IndicatorType {
  CUMULATIVE = 'Cumulative',
  INCREMENTAL = 'Incremental',
}

export interface TargetActualPeriod {
  periodId: string; // e.g. "Q1 2026", "Q2 2026"
  target: number;
  actual: number;
}

export interface Indicator {
  id: string;
  code: string;
  name: string;
  baseline: number;
  type: IndicatorType;
  unit: string;
  periods: TargetActualPeriod[];
  // IPTT locking details
  lockedBy?: {
    userId: string;
    userName: string;
    timestamp: string;
  } | null;
}

export interface LogFrameItem {
  id: string;
  type: 'outcome' | 'output' | 'activity';
  code: string; // e.g. "OC.1", "OUT.1.1", "ACT.1.1.1"
  name: string;
  category?: string; // e.g., "Thematic" or "Cross-Cutting"
  theme?: string;
  subTheme?: string;
  crossCuttingTheme?: string;
  commonApproach?: string;
  indicators: Indicator[];
  parentId?: string; // Links output -> outcome, activity -> output
}

export interface Milestone {
  id: string;
  name: string;
  dueDate: string;
  progress: number; // 0 to 100
  dueDatePassed: boolean;
}

export interface DipActivity {
  id: string;
  logFrameItemId: string; // references activity id in LogFrame
  name: string;
  startDate: string;
  endDate: string;
  progress: number; // 0 - 100
  milestones: Milestone[];
}

export enum BudgetHolderState {
  DRAFT = 'Draft',
  PENDING_APPROVAL = 'Pending Approval',
  APPROVED = 'Approved',
}

export interface CostCentre {
  id: string;
  code: string;
  name: string;
  programmeOffice: string; // linked office name/code
  isActive: boolean;
}

export interface BudgetHolderRecord {
  id: string;
  costCentres: CostCentre[];
  status: BudgetHolderState;
  submittedAt?: string;
  approvedAt?: string;
  comments?: string;
}

export interface Partner {
  id: string;
  name: string;
  code: string;
  role: string;
  contactPerson: string;
  email: string;
}

export interface ActionItem {
  id: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  comments?: string;
  createdAt: string;
}

export interface StrategicGoal {
  year: number;
  targetAchieved: boolean;
  goalDescription: string;
}

export interface ProjectStore {
  metadata: ProjectMetadata;
  currentState: ProjectState;
  logFrame: LogFrameItem[];
  dipActivities: DipActivity[];
  budgetHolders: BudgetHolderRecord;
  partners: Partner[];
  actionItems: ActionItem[];
  strategicGoals: StrategicGoal[];
  history: Array<{
    timestamp: string;
    fromState: ProjectState;
    toState: ProjectState;
    user: string;
    role: ProjectRole;
    reason?: string;
  }>;
}
