// ---------------------------------------------------------------------------
// Employer Dashboard — type definitions
// Provides stats summary, recent applications, and job listing counts
// for the employer/company role dashboard view.
// ---------------------------------------------------------------------------

export type EmployerDashboardMetric = {
  label: string;
  value: number;
  note: string;
};

export type RecentApplication = {
  applicationId: number;
  candidateId: number;
  candidateName: string | null;
  jobTitle: string;
  jobListingId: number;
  status: string;
  createdAt: Date;
};

export type JobStatusBreakdown = {
  status: string;
  count: number;
};

export type EmployerDashboardData = {
  metrics: EmployerDashboardMetric[];
  recentApplications: RecentApplication[];
  jobStatusBreakdown: JobStatusBreakdown[];
  totalJobs: number;
  totalApplications: number;
};
