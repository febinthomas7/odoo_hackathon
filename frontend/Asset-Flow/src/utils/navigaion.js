import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  User,
  Users,
  LayoutDashboard,
  Building2,
  Stethoscope,
  Calendar,
  Activity,
  Package,
  FileText,
} from "lucide-react";

export const assetManagerNavigation = [
  { name: "Dashboard", href: "/asset-manager/dashboard", icon: LayoutDashboard },
  { name: "Report", href: "/asset-manager/report", icon: DocumentTextIcon },
  {
    name: "Appointment",
    href: "/asset-manager/appointment-booking",
    icon: MagnifyingGlassIcon,
  },
  { name: "My Appointment", href: "/asset-manager/my-appointment", icon: Calendar },
];

export const adminNavigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Branch", href: "/admin/branch", icon: Building2 },
  {
    name: "charges",
    href: "/admin/charges",
    icon: DocumentTextIcon,
  },
];

export const departmentNavigation = [
  { name: "Dashboard", href: "/department/dashboard", icon: LayoutDashboard },
  { name: "Report", href: "/department/report-upload", icon: DocumentTextIcon },
  { name: "Assign", href: "/department/assign-report", icon: User },
  { name: "Patients", href: "/department/patient", icon: Users },
];

export const employeeNavigation = [
  { name: "Dashboard", href: "/employee/dashboard", icon: Activity },
  {
    name: "Insurance",
    icon: FileText,
    subItems: [
      { name: "Claims", href: "/employee/claims", icon: Package },
      {name: "Provider", href: "/employee/provider", icon: User},
      {name: "Billing", href: "/employee/billing", icon: FileText},
      {name: "Upload", href: "/employee/upload", icon: Package},
      {name: "Preview", href: "/employee/preview", icon: User},
      {name: "Status", href: "/employee/status", icon: Stethoscope},
    ],
  },
];

