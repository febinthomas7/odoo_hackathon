// ----------------------------------------------------
// SHARED MOCK DATA SOURCE
// ----------------------------------------------------
// This file serves as the single source of truth for all mock operations.
// Other api/*.js files mutate these arrays directly to simulate a real backend.

export const mockDepartments = [
  { id: 1, name: "IT Support", headId: 3, parent: null, status: "Active" },
  { id: 2, name: "Human Resources", headId: 2, parent: null, status: "Active" },
  { id: 3, name: "Engineering", headId: null, parent: null, status: "Active" },
  { id: 4, name: "Sales", headId: null, parent: null, status: "Active" },
];

export const mockAssetCategories = [
  {
    id: 1,
    name: "Electronics",
    attributes: ["Warranty Period", "Operating System", "RAM", "Storage"],
  },
  { id: 2, name: "Furniture", attributes: ["Material", "Dimensions", "Color"] },
  {
    id: 3,
    name: "Vehicles",
    attributes: ["License Plate", "Mileage", "Last Serviced"],
  },
  {
    id: 4,
    name: "Software Licenses",
    attributes: ["Expiration Date", "Seats", "License Key"],
  },
];

// Consistent User IDs across the system
// Admin: 1, Dept Head: 2, Asset Manager: 3, Employee: 4, Employee: 5
export const mockEmployees = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@assetflow.com",
    department: "IT Support",
    role: "Admin",
    status: "Active",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@assetflow.com",
    department: "Human Resources",
    role: "Department Head",
    status: "Active",
  },
  {
    id: 3,
    name: "Alice Johnson",
    email: "alice@assetflow.com",
    department: "IT Support",
    role: "Asset Manager",
    status: "Active",
  },
  {
    id: 4,
    name: "Bob Wilson",
    email: "bob@assetflow.com",
    department: "Engineering",
    role: "Employee",
    status: "Active",
  },
  {
    id: 5,
    name: "Charlie Brown",
    email: "charlie@assetflow.com",
    department: "Sales",
    role: "Employee",
    status: "Active",
  },
];

export const mockAssets = [
  {
    id: 1,
    tag: "AF-0001",
    name: "Dell XPS 15",
    category: "Electronics",
    serialNumber: "SN-XPS-123",
    acquisitionDate: "2023-01-15",
    acquisitionCost: 1500,
    condition: "Good",
    location: "IT Store",
    shared: false,
    status: "Allocated",
    department: "Engineering",
    customFields: { "Operating System": "Windows 11", RAM: "16GB" },
  },
  {
    id: 2,
    tag: "AF-0002",
    name: "MacBook Pro M2",
    category: "Electronics",
    serialNumber: "SN-MBP-456",
    acquisitionDate: "2023-05-20",
    acquisitionCost: 2000,
    condition: "Excellent",
    location: "Design Dept",
    shared: false,
    status: "Available",
    department: "Human Resources",
    customFields: {},
  },
  {
    id: 3,
    tag: "AF-0003",
    name: "Conference Room Projector",
    category: "Electronics",
    serialNumber: "SN-PROJ-789",
    acquisitionDate: "2022-11-10",
    acquisitionCost: 800,
    condition: "Fair",
    location: "Room B2",
    shared: true,
    status: "Available",
    department: "IT Support",
    customFields: {},
  },
  {
    id: 4,
    tag: "AF-0004",
    name: "Office Chair Ergonomic",
    category: "Furniture",
    serialNumber: "N/A",
    acquisitionDate: "2021-08-05",
    acquisitionCost: 250,
    condition: "Good",
    location: "Open Workspace",
    shared: false,
    status: "Allocated",
    department: "Sales",
    customFields: {},
  },
  {
    id: 5,
    tag: "AF-0005",
    name: "Company Delivery Van",
    category: "Vehicles",
    serialNumber: "VIN-987654321",
    acquisitionDate: "2020-02-15",
    acquisitionCost: 25000,
    condition: "Under Maintenance",
    location: "Garage",
    shared: true,
    status: "Under Maintenance",
    department: "Logistics",
    customFields: { "License Plate": "XYZ-1234" },
  },
  {
    id: 6,
    tag: "AF-0114",
    name: "ThinkPad T14",
    category: "Electronics",
    serialNumber: "SN-TP-114",
    acquisitionDate: "2023-02-01",
    acquisitionCost: 1200,
    condition: "Good",
    location: "Engineering Floor",
    shared: false,
    status: "Allocated",
    department: "Engineering",
    customFields: {},
  },
];

// Active allocations in the system
export const mockAllocations = [
  {
    id: 1,
    assetId: 1,
    assetTag: "AF-0001",
    assetName: "Dell XPS 15",
    assignedToId: 4,
    assignedTo: "Bob Wilson",
    assignedById: 3,
    assignedDate: "2023-06-01",
    expectedReturnDate: "2026-12-31",
    status: "Active",
  },
  {
    id: 2,
    assetId: 4,
    assetTag: "AF-0004",
    assetName: "Office Chair Ergonomic",
    assignedToId: 5,
    assignedTo: "Charlie Brown",
    assignedById: 3,
    assignedDate: "2023-01-10",
    expectedReturnDate: null,
    status: "Active",
  },
  {
    id: 3,
    assetId: 6,
    assetTag: "AF-0114",
    assetName: "ThinkPad T14",
    assignedToId: 2,
    assignedTo: "Jane Smith",
    assignedById: 3,
    assignedDate: "2023-11-01",
    expectedReturnDate: "2023-11-20",
    status: "Active",
  }, // Overdue example
];

export const mockBookings = [
  {
    id: 1,
    assetId: 3,
    assetName: "Conference Room Projector",
    bookedById: 4,
    bookedBy: "Bob Wilson",
    date: "2023-11-15",
    startTime: "09:00",
    endTime: "10:00",
    status: "Completed",
  },
  {
    id: 2,
    assetId: 5,
    assetName: "Company Delivery Van",
    bookedById: 2,
    bookedBy: "Jane Smith",
    date: "2023-11-16",
    startTime: "13:00",
    endTime: "15:00",
    status: "Upcoming",
  },
];

export const mockMaintenanceRequests = [
  {
    id: 1,
    assetId: 5,
    assetName: "Company Delivery Van",
    reportedById: 4,
    reportedBy: "Bob Wilson",
    issue: "Engine making weird noise",
    priority: "High",
    date: "2023-11-10",
    status: "In Progress",
    technicianId: null,
    technician: "Mike Mechanic",
  },
  {
    id: 2,
    assetId: 2,
    assetName: "MacBook Pro M2",
    reportedById: 2,
    reportedBy: "Jane Smith",
    issue: "Battery drains fast",
    priority: "Medium",
    date: "2023-11-12",
    status: "Pending",
    technicianId: null,
    technician: null,
  },
];

export const mockAuditCycles = [
  {
    id: 1,
    title: "Q4 IT Asset Audit",
    department: "IT Support",
    startDate: "2023-11-01",
    endDate: "2023-11-15",
    auditorIds: [3],
    auditors: ["Alice Johnson"],
    status: "Active",
    results: [],
  },
];

export const mockNotifications = [
  {
    id: 1,
    userId: 1,
    type: "Alert",
    message: "Asset AF-0114 is overdue for return.",
    date: new Date().toISOString(),
    read: false,
  },
];

export const mockActivityLog = [
  {
    id: 1,
    userId: 3,
    userName: "Alice Johnson",
    action: "Allocated Dell XPS 15 (AF-0001) to Bob Wilson",
    timestamp: new Date().toISOString(),
  },
];

export const mockReportsData = {
  utilization: {
    totalAssets: mockAssets.length,
    allocatedAssets: mockAllocations.filter((a) => a.status === "Active")
      .length,
    availableAssets: mockAssets.filter(
      (a) =>
        !mockAllocations.some(
          (alloc) => alloc.assetId === a.id && alloc.status === "Active",
        ),
    ).length,
  },
  maintenance: {
    totalRequests: mockMaintenanceRequests.length,
    inProgress: mockMaintenanceRequests.filter(
      (r) => r.status === "In Progress",
    ).length,
  },
};
