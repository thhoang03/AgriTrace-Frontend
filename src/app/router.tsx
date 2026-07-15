import { createBrowserRouter } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../features/auth/LoginPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { BatchManagementPage } from "../features/batches/BatchManagementPage";
import { BatchDetailPage } from "../features/batches/BatchDetailPage";
import { RecallPage } from "../features/recall/RecallPage";
import { ReportsPage } from "../features/reports/ReportsPage";
import { UsersListPage } from "../features/users/UsersListPage";
import { ProfilePage } from "../features/users/ProfilePage";
import { InspectionPage } from "../features/inspection/InspectionPage";
import { SupplyChainPage } from "../features/supply-chain/SupplyChainPage";
import { PublicTracePage } from "../pages/PublicTracePage";
import { OrganizationsPage } from "../features/organizations/OrganizationsPage";

export const router = createBrowserRouter([
  { path: "/", Component: HomePage },
  { path: "/login", Component: LoginPage },
  { path: "/trace/:id", Component: PublicTracePage },
  {
    path: "/app",
    Component: AppLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: "dashboard", Component: DashboardPage },
      { path: "batches", Component: BatchManagementPage },
      { path: "batches/:id", Component: BatchDetailPage },
      { path: "supply-chain", Component: SupplyChainPage },
      { path: "inspection", Component: InspectionPage },
      { path: "recall", Component: RecallPage },
      { path: "reports", Component: ReportsPage },
      { path: "users", Component: UsersListPage },
      { path: "profile", Component: ProfilePage },
      { path: "organizations", Component: OrganizationsPage },
    ],
  },
]);
