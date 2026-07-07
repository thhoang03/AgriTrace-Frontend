import { createBrowserRouter } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { BatchManagementPage } from "./pages/BatchManagementPage";
import { BatchDetailPage } from "./pages/BatchDetailPage";
import { RecallPage } from "./pages/RecallPage";
import { ReportsPage } from "./pages/ReportsPage";
import { UsersPage } from "./pages/UsersPage";
import { ProfilePage } from "./pages/ProfilePage";
import { InspectionPage } from "./pages/InspectionPage";
import { SupplyChainPage } from "./pages/SupplyChainPage";
import { PublicTracePage } from "./pages/PublicTracePage";

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
      { path: "users", Component: UsersPage },
      { path: "profile", Component: ProfilePage },
    ],
  },
]);
