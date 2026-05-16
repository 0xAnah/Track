export const dailyReportsMetrics = [
  { label: 'Reports Submitted', value: '65', iconColor: '#0B3B91', trend: { value: '+20%', isPositive: true } },
  { label: 'Draft Reports', value: '18', iconColor: '#6B7280', trend: { value: '+20%', isPositive: true } },
  { label: 'Missing Reports', value: '3', iconColor: '#F59E0B', trend: { value: '+2.0%', isPositive: false } },
  { label: 'Reporting Consistency', value: '92%', iconColor: '#16A34A', trend: { value: '+2.0%', isPositive: true } },
]

export const dailyReports = [
  {
    id: 1, date: '2026-05-16', title: 'Ketu Lagos site inspection summary', department: 'Operations',
    submissionTime: '05:06 PM', lastUpdated: '05:06 PM', status: 'submitted', submitted_by: 'John Williams',
    description: 'Conducted a full site inspection at the Ketu Lagos facility. All equipment was checked for compliance and safety standards. Identified 3 minor issues that were resolved on-site.',
    tasks: [
      { title: 'Site walkthrough', description: 'Completed full perimeter inspection of the Ketu facility.', initiated_by: 'Site Manager', handed_to: 'Security Lead', start_time: '08:00 AM', end_time: '10:30 AM' },
      { title: 'Equipment audit', description: 'Inspected all heavy machinery and logged maintenance records.', initiated_by: 'Operations Head', handed_to: 'Maintenance Team', start_time: '10:45 AM', end_time: '01:00 PM' },
      { title: 'Compliance report', description: 'Documented all findings and submitted compliance checklist.', initiated_by: 'HSE Officer', handed_to: 'Admin', start_time: '02:00 PM', end_time: '04:30 PM' },
    ],
  },
  {
    id: 2, date: '2026-05-15', title: 'Budget analysis and documentation', department: 'Finance',
    submissionTime: '05:06 PM', lastUpdated: '05:06 PM', status: 'submitted', submitted_by: 'Ada Okonkwo',
    description: 'Prepared the monthly budget analysis report covering all departments. Variance analysis completed with recommendations for cost optimization.',
    tasks: [
      { title: 'Data collection', description: 'Gathered financial data from all departmental heads.', initiated_by: 'CFO', handed_to: 'Finance Team', start_time: '08:00 AM', end_time: '11:00 AM' },
      { title: 'Variance analysis', description: 'Compared actual spend against budget for April 2026.', initiated_by: 'Finance Lead', handed_to: 'Ada Okonkwo', start_time: '11:15 AM', end_time: '02:30 PM' },
      { title: 'Report compilation', description: 'Compiled final budget report with actionable recommendations.', initiated_by: 'CFO', handed_to: 'Executive Team', start_time: '02:45 PM', end_time: '05:00 PM' },
    ],
  },
  {
    id: 3, date: '2026-05-14', title: 'Field Operations Activity', department: 'Infrastructure',
    submissionTime: null, lastUpdated: '2 days ago', status: 'draft', submitted_by: 'Emeka Okafor',
    description: 'Draft report of the field operations conducted at various infrastructure sites. Pending review and finalization.',
    tasks: [
      { title: 'Site assessments', description: 'Visited 3 infrastructure sites for condition assessment.', initiated_by: 'Project Manager', handed_to: 'Field Team', start_time: '07:30 AM', end_time: '01:00 PM' },
      { title: 'Photo documentation', description: 'Captured site photos for project records.', initiated_by: 'Documentation Lead', handed_to: 'Emeka Okafor', start_time: '01:30 PM', end_time: '03:00 PM' },
    ],
  },
  {
    id: 4, date: '2026-05-13', title: 'Equipment maintenance log', department: 'Operations',
    submissionTime: '05:06 PM', lastUpdated: '05:06 PM', status: 'completed', submitted_by: 'John Williams',
    description: 'Weekly maintenance log for all operational equipment. All servicing completed according to schedule.',
    tasks: [
      { title: 'Generator servicing', description: 'Serviced all 4 backup generators across the facility.', initiated_by: 'Facility Manager', handed_to: 'Tech Team', start_time: '08:00 AM', end_time: '10:00 AM' },
      { title: 'HVAC inspection', description: 'Inspected HVAC systems and replaced air filters.', initiated_by: 'Facility Manager', handed_to: 'Maintenance', start_time: '10:30 AM', end_time: '12:30 PM' },
      { title: 'Log update', description: 'Updated maintenance log and flagged items for next week.', initiated_by: 'Operations Head', handed_to: 'John Williams', start_time: '01:00 PM', end_time: '02:00 PM' },
    ],
  },
  {
    id: 5, date: '2026-05-12', title: 'Vendor coordination report', department: 'Procurement',
    submissionTime: '05:06 PM', lastUpdated: '05:06 PM', status: 'completed', submitted_by: 'Fatima Bello',
    description: 'Coordinated with 5 vendors for Q3 supply contracts. Negotiated pricing and finalized delivery schedules.',
    tasks: [
      { title: 'Vendor meetings', description: 'Held virtual meetings with 5 shortlisted vendors.', initiated_by: 'Procurement Head', handed_to: 'Fatima Bello', start_time: '09:00 AM', end_time: '12:00 PM' },
      { title: 'Price negotiation', description: 'Negotiated bulk pricing for stationery and equipment supplies.', initiated_by: 'Procurement Head', handed_to: 'Vendors', start_time: '12:30 PM', end_time: '03:00 PM' },
      { title: 'Contract finalization', description: 'Drafted and reviewed contracts for 3 selected vendors.', initiated_by: 'Legal', handed_to: 'Fatima Bello', start_time: '03:15 PM', end_time: '05:00 PM' },
    ],
  },
  {
    id: 6, date: '2026-05-11', title: 'Equipment safety compliance checklist', department: 'HSE',
    submissionTime: null, lastUpdated: '4 days ago', status: 'draft', submitted_by: 'Chidi Nwosu',
    description: 'Monthly safety compliance checklist for all equipment. Partially completed - awaiting sign-off from site supervisors.',
    tasks: [
      { title: 'Safety gear inspection', description: 'Inspected all safety gear and PPE inventory.', initiated_by: 'HSE Manager', handed_to: 'Chidi Nwosu', start_time: '08:30 AM', end_time: '10:00 AM' },
    ],
  },
  {
    id: 7, date: '2026-05-10', title: 'Ajah project progress update', department: 'Infrastructure',
    submissionTime: '05:06 PM', lastUpdated: '05:06 PM', status: 'completed', submitted_by: 'Emeka Okafor',
    description: 'Progress update for the Ajah infrastructure project. Milestone 3 completed ahead of schedule.',
    tasks: [
      { title: 'Milestone review', description: 'Assessed progress against Milestone 3 deliverables.', initiated_by: 'Project Director', handed_to: 'Emeka Okafor', start_time: '08:00 AM', end_time: '11:00 AM' },
      { title: 'Stakeholder update', description: 'Prepared progress presentation for stakeholders.', initiated_by: 'Project Director', handed_to: 'Communications', start_time: '11:30 AM', end_time: '01:30 PM' },
      { title: 'Site photos', description: 'Took updated site photos and updated project dashboard.', initiated_by: 'PMO', handed_to: 'Site Team', start_time: '02:00 PM', end_time: '04:00 PM' },
    ],
  },
  {
    id: 8, date: '2026-05-09', title: 'Weekly team summary', department: 'Operations',
    submissionTime: '05:06 PM', lastUpdated: '05:06 PM', status: 'completed', submitted_by: 'Ada Okonkwo',
    description: 'Weekly summary of Operations team activities. All KPIs met for the week ending May 9.',
    tasks: [
      { title: 'KPI review', description: 'Reviewed team KPIs and performance metrics for the week.', initiated_by: 'Operations Head', handed_to: 'Ada Okonkwo', start_time: '08:00 AM', end_time: '10:00 AM' },
      { title: 'Report writing', description: 'Compiled weekly summary report with highlights and challenges.', initiated_by: 'Operations Head', handed_to: 'Ada Okonkwo', start_time: '10:30 AM', end_time: '01:00 PM' },
      { title: 'Team meeting', description: 'Led weekly team standup and discussed upcoming priorities.', initiated_by: 'Ada Okonkwo', handed_to: 'Operations Team', start_time: '02:00 PM', end_time: '03:00 PM' },
    ],
  },
  {
    id: 9, date: '2026-05-08', title: 'Budget analysis and documentation', department: 'Finance',
    submissionTime: '05:06 PM', lastUpdated: '05:06 PM', status: 'completed', submitted_by: 'Ada Okonkwo',
    description: 'Follow-up budget analysis for mid-month review. Updated projections based on actual spend.',
    tasks: [
      { title: 'Mid-month review', description: 'Compared mid-month spend against budget allocations.', initiated_by: 'CFO', handed_to: 'Finance Team', start_time: '09:00 AM', end_time: '12:00 PM' },
      { title: 'Forecast update', description: 'Updated financial forecasts for the remainder of the month.', initiated_by: 'Finance Lead', handed_to: 'Ada Okonkwo', start_time: '01:00 PM', end_time: '04:00 PM' },
    ],
  },
  {
    id: 10, date: '2026-05-07', title: 'Field Operations Activity', department: 'Infrastructure',
    submissionTime: null, lastUpdated: '8 days ago', status: 'draft', submitted_by: 'Emeka Okafor',
    description: 'Field operations report for infrastructure maintenance activities. Draft pending review.',
    tasks: [
      { title: 'Site visit', description: 'Visited 2 infrastructure sites for routine inspection.', initiated_by: 'Infra Lead', handed_to: 'Field Team', start_time: '07:00 AM', end_time: '12:00 PM' },
    ],
  },
  {
    id: 11, date: '2026-05-06', title: 'Ketu Lagos site inspection summary', department: 'Operations',
    submissionTime: '05:06 PM', lastUpdated: '05:06 PM', status: 'completed', submitted_by: 'John Williams',
    description: 'Follow-up inspection at Ketu Lagos. Verified that previous issues were resolved satisfactorily.',
    tasks: [
      { title: 'Re-inspection', description: 'Re-inspected areas with previous compliance issues.', initiated_by: 'HSE Officer', handed_to: 'John Williams', start_time: '08:00 AM', end_time: '11:30 AM' },
      { title: 'Closure report', description: 'Prepared closure report for all resolved items.', initiated_by: 'Operations Head', handed_to: 'Admin', start_time: '12:00 PM', end_time: '03:00 PM' },
    ],
  },
  {
    id: 12, date: '2026-05-05', title: 'Vendor coordination report', department: 'Procurement',
    submissionTime: '05:06 PM', lastUpdated: '05:06 PM', status: 'completed', submitted_by: 'Fatima Bello',
    description: 'Finalized vendor contracts for Q3 supplies. All documentation submitted for approval.',
    tasks: [
      { title: 'Contract review', description: 'Final review of all vendor contracts before submission.', initiated_by: 'Legal', handed_to: 'Fatima Bello', start_time: '09:00 AM', end_time: '11:00 AM' },
      { title: 'Approval routing', description: 'Routed contracts through the approval workflow.', initiated_by: 'Procurement Head', handed_to: 'Director', start_time: '11:30 AM', end_time: '01:00 PM' },
      { title: 'Vendor notification', description: 'Notified all vendors of contract status and next steps.', initiated_by: 'Fatima Bello', handed_to: 'Vendors', start_time: '02:00 PM', end_time: '04:00 PM' },
    ],
  },
  {
    id: 13, date: '2026-05-04', title: 'Equipment safety compliance checklist', department: 'HSE',
    submissionTime: null, lastUpdated: null, status: 'missing', submitted_by: '—',
    description: 'No report submitted for this date.',
    tasks: [],
  },
  {
    id: 14, date: '2026-05-03', title: 'Ajah project progress update', department: 'Infrastructure',
    submissionTime: null, lastUpdated: null, status: 'missing', submitted_by: '—',
    description: 'No report submitted for this date.',
    tasks: [],
  },
  {
    id: 15, date: '2026-05-02', title: 'Weekly team summary', department: 'Operations',
    submissionTime: '05:06 PM', lastUpdated: '05:06 PM', status: 'completed', submitted_by: 'Ada Okonkwo',
    description: 'Weekly team summary for Operations. All weekly targets achieved.',
    tasks: [
      { title: 'Weekly metrics', description: 'Compiled weekly performance metrics for the team.', initiated_by: 'Operations Head', handed_to: 'Ada Okonkwo', start_time: '08:00 AM', end_time: '10:30 AM' },
      { title: 'Report submission', description: 'Submitted weekly summary report to management.', initiated_by: 'Ada Okonkwo', handed_to: 'Management', start_time: '11:00 AM', end_time: '12:00 PM' },
    ],
  },
]
