/**
 * @module store/mockData
 * @description Rich default mock records representing a fully loaded PRIME project workspace.
 */

import {
  ProjectStore,
  ProjectState,
  ProjectRole,
  IndicatorType,
  BudgetHolderState,
} from '../types';

export const INITIAL_PROJECT_STORE: ProjectStore = {
  metadata: {
    id: 'proj-sci-2026-004',
    projectCode: 'SCI-2026-CH-004',
    name: 'Integrated Child Protection & Primary Education Support Program',
    theme: 'Child Protection',
    subTheme: 'Child Protection in Emergencies',
    enablingSubthemes: ['Community-based structures', 'Education systems strengthening'],
    programmeOfficeUnits: ['Asia-East-PO', 'Africa-West-PO'],
    programmeOfficeUnitsApproved: {
      'Asia-East-PO': false,
      'Africa-West-PO': false,
    },
    implementingOffices: ['Jakarta Field Office', 'Freetown Regional Office'],
    settlementSubThemeSplit: [
      { subTheme: 'Child Protection in Emergencies', percentage: 60 },
      { subTheme: 'Early Childhood Care and Development', percentage: 40 },
    ],
    startDate: '2026-01-01',
    endDate: '2027-12-31',
    createdBy: 'fatima114814@gmail.com',
  },
  currentState: ProjectState.DESIGN_IN_PROGRESS,
  logFrame: [
    {
      id: 'oc-1',
      type: 'outcome',
      code: 'OC.1',
      name: 'Vulnerable children in priority districts enjoy enhanced safety, psycho-social recovery, and equitable access to early education resources.',
      indicators: [
        {
          id: 'ind-oc-1',
          code: 'IND-OC.1.a',
          name: 'Percentage of targeted kids reporting increased sense of community safety & belonging services',
          baseline: 28,
          type: IndicatorType.CUMULATIVE,
          unit: '%',
          periods: [
            { periodId: 'Year 1 Mid', target: 50, actual: 48 },
            { periodId: 'Year 1 Final', target: 70, actual: 64 },
            { periodId: 'Year 2 Mid', target: 80, actual: 0 },
            { periodId: 'Year 2 Final', target: 90, actual: 0 },
          ],
        },
      ],
    },
    {
      id: 'out-1-1',
      type: 'output',
      code: 'OUT.1.1',
      name: 'Safe Spaces and responsive Community Support Centers established and fully supplied with child-friendly kits.',
      parentId: 'oc-1',
      indicators: [
        {
          id: 'ind-out-1-1-1',
          code: 'IND-OUT.1.1.a',
          name: 'Number of Safe-Spaces (hubs) actively operating and staffed by trained monitors',
          baseline: 0,
          type: IndicatorType.INCREMENTAL,
          unit: 'spaces',
          periods: [
            { periodId: 'Q1-2026', target: 4, actual: 4 },
            { periodId: 'Q2-2026', target: 4, actual: 2 }, // incremental example
            { periodId: 'Q3-2026', target: 8, actual: 0 },
            { periodId: 'Q4-2026', target: 12, actual: 0 },
          ],
        },
      ],
    },
    {
      id: 'act-1-1-1',
      type: 'activity',
      code: 'ACT.1.1.1',
      name: 'Acquire child-friendly curriculum kits, deploy training modules for teachers, and organize community safeguards briefings.',
      parentId: 'out-1-1',
      category: 'Thematic',
      theme: 'Child Protection',
      subTheme: 'Child Protection in Emergencies',
      crossCuttingTheme: 'Gender Equality',
      commonApproach: 'Safe Schools Guidelines',
      indicators: [
        {
          id: 'ind-act-1-1-1',
          code: 'IND-ACT.1.1.1.a',
          name: 'Total count of local community monitors certified via safeguards briefings',
          baseline: 0,
          type: IndicatorType.INCREMENTAL,
          unit: 'monitors',
          periods: [
            { periodId: 'Q1-2026', target: 15, actual: 18 },
            { periodId: 'Q2-2026', target: 15, actual: 12 },
            { periodId: 'Q3-2026', target: 20, actual: 0 },
            { periodId: 'Q4-2026', target: 20, actual: 0 },
          ],
        },
      ],
    },
    {
      id: 'act-1-1-2',
      type: 'activity',
      code: 'ACT.1.1.2',
      name: 'Conduct weekly mobile therapy loops and distribute educational play supplies to remote children groups.',
      parentId: 'out-1-1',
      category: 'Thematic',
      theme: 'Child Protection',
      subTheme: 'Child Protection in Emergencies',
      crossCuttingTheme: 'Child Rights Governance',
      commonApproach: 'Children on the Move',
      indicators: [
        {
          id: 'ind-act-1-1-2',
          code: 'IND-ACT.1.1.2.a',
          name: 'Number of educational play item packs distributed to households',
          baseline: 0,
          type: IndicatorType.INCREMENTAL,
          unit: 'packs',
          periods: [
            { periodId: 'Q1-2026', target: 200, actual: 235 },
            { periodId: 'Q2-2026', target: 250, actual: 120 },
            { periodId: 'Q3-2026', target: 300, actual: 0 },
            { periodId: 'Q4-2026', target: 150, actual: 0 },
          ],
        },
      ],
    }
  ],
  dipActivities: [
    {
      id: 'dip-act-1-1-1',
      logFrameItemId: 'act-1-1-1',
      name: 'Acquire child-friendly curriculum kits, deploy training modules for teachers',
      startDate: '2026-01-10',
      endDate: '2026-06-25',
      progress: 85,
      milestones: [
        {
          id: 'm-1',
          name: 'Procurement list finalized and validated',
          dueDate: '2026-02-15',
          progress: 100,
          dueDatePassed: true,
        },
        {
          id: 'm-2',
          name: 'First batch of 30 trainers certified',
          dueDate: '2026-05-10',
          progress: 100,
          dueDatePassed: true,
        },
        {
          id: 'm-3',
          name: 'Refresher sessions concluded',
          dueDate: '2026-06-20',
          progress: 40,
          // Today is 2026-06-19, so 2026-06-20 is tomorrow, not overdue (unless custom evaluation)
          dueDatePassed: false,
        }
      ],
    },
    {
      id: 'dip-act-1-1-2',
      logFrameItemId: 'act-1-1-2',
      name: 'Conduct weekly mobile therapy loops and distribute educational play supplies',
      startDate: '2026-03-01',
      endDate: '2026-09-30',
      progress: 30,
      milestones: [
        {
          id: 'm-4',
          name: 'Therapist schedule finalized',
          dueDate: '2026-03-15',
          progress: 100,
          dueDatePassed: true,
        },
        {
          id: 'm-5',
          name: 'Mid-term distribution validation audit',
          dueDate: '2026-06-10', // past date (today is June 19)
          progress: 50, // in progress, but past due -> Overdue!
          dueDatePassed: true,
        },
        {
          id: 'm-6',
          name: 'Logistics loop closure',
          dueDate: '2026-09-25',
          progress: 0,
          dueDatePassed: false,
        }
      ]
    }
  ],
  budgetHolders: {
    id: 'bh-rec-001',
    costCentres: [
      {
        id: 'cc-1',
        code: '11004-90',
        name: 'Protection Core Fund (Asia)',
        programmeOffice: 'Asia-East-PO',
        isActive: true,
      },
      {
        id: 'cc-2',
        code: '23012-45',
        name: 'Emergencies Relief (Africa)',
        programmeOffice: 'Africa-West-PO',
        isActive: true,
      }
    ],
    status: BudgetHolderState.PENDING_APPROVAL,
    submittedAt: '2026-06-10T14:30:00Z',
  },
  partners: [
    {
      id: 'part-01',
      name: 'Save Children Indonesia Alliance',
      code: 'SCIA-091',
      role: 'Implementing Partner',
      contactPerson: 'Budi Santoso',
      email: 'budi.santoso@savingchildren.org.id',
    },
    {
      id: 'part-02',
      name: 'West African Child Safety Forum',
      code: 'WACSF-112',
      role: 'Technical Advisor Partner',
      contactPerson: 'Mariama Diallo',
      email: 'm.diallo@safekidforum.org',
    }
  ],
  actionItems: [
    {
      id: 'act-001',
      title: 'Upload final donor approval letters to project files',
      assignedTo: 'Fatima',
      dueDate: '2026-06-30',
      status: 'In Progress',
      comments: 'Waiting on signs from London office.',
      createdAt: '2026-06-12',
    },
    {
      id: 'act-002',
      title: 'Coordinate child-safe code of conduct briefing session',
      assignedTo: 'Budi Santoso',
      dueDate: '2026-06-25',
      status: 'Open',
      createdAt: '2026-06-15',
    }
  ],
  strategicGoals: [
    {
      year: 2026,
      targetAchieved: true,
      goalDescription: 'SGG.1: Empower local child protections through community structures.',
    },
    {
      year: 2027,
      targetAchieved: true,
      goalDescription: 'SGG.4: Consolidate education recovery programs in emergency risk areas.',
    }
  ],
  history: [
    {
      timestamp: '2026-06-01T09:00:00Z',
      fromState: ProjectState.DESIGN_IN_PROGRESS,
      toState: ProjectState.DESIGN_IN_PROGRESS,
      user: 'fatima114814@gmail.com',
      role: ProjectRole.RECORD_MANAGER,
      reason: 'Initial setup of project structure & metadata.',
    }
  ],
};
