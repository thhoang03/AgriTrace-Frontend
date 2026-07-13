import { get } from "../../lib/api";
import type { DashboardOverview } from "./dashboard.types";

export const dashboardApi = {
  getOverview: () =>
    get<DashboardOverview>("/dashboard/overview"),
};
