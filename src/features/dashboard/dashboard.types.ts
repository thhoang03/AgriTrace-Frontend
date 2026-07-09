export interface DashboardStats {
  totalBatches: number;
  activeBatches: number;
  totalUsers: number;
  activeRecalls: number;
  totalInspections: number;
  passedInspections: number;
}

export interface DashboardActivity {
  id: string;
  type: "batch_created" | "batch_updated" | "recall_issued" | "inspection_completed" | "user_joined";
  message: string;
  timestamp: string;
  userId: string;
  userName: string;
}

export interface DashboardOverview {
  stats: DashboardStats;
  recentActivity: DashboardActivity[];
  batchStatusDistribution: { status: string; count: number }[];
  inspectionPassRate: number;
}
