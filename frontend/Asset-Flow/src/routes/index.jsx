import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import Layout from "../components/Layout/index.jsx";

import {
  assetManagerNavigation,
  employeeNavigation,
  departmentNavigation,
  adminNavigation,
} from "../utils/navigaion.js";

const AdminDashboard = lazy(() => import("../pages/Admin/index.jsx"));

const admin = "Admin Dashboard";

const router = createBrowserRouter([
  {
    path: "/admin/dashboard",
    element: (
      <Layout navigation={adminNavigation} name={admin}>
        <AdminDashboard />
      </Layout>
    ),
  },
  {
    path: "/",
    element: (
      <Layout navigation={adminNavigation} name={admin}>
        <AdminDashboard />
      </Layout>
    ),
  },
]);

export default router;
