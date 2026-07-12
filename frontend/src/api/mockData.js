export const mockDepartments = [
  { id: 1, name: 'IT Support', head: 'John Doe', parent: null, status: 'Active' },
  { id: 2, name: 'Human Resources', head: 'Jane Smith', parent: null, status: 'Active' },
  { id: 3, name: 'Engineering', head: 'Alice Johnson', parent: null, status: 'Active' },
];

export const mockAssetCategories = [
  { id: 1, name: 'Electronics', attributes: ['Warranty Period', 'Serial Number'] },
  { id: 2, name: 'Furniture', attributes: ['Material', 'Dimensions'] },
  { id: 3, name: 'Vehicles', attributes: ['License Plate', 'Mileage'] },
];

export const mockEmployees = [
  { id: 1, name: 'John Doe', email: 'john@example.com', department: 'IT Support', role: 'Department Head', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', department: 'Human Resources', role: 'Department Head', status: 'Active' },
  { id: 3, name: 'Alice Johnson', email: 'alice@example.com', department: 'Engineering', role: 'Asset Manager', status: 'Active' },
  { id: 4, name: 'Bob Wilson', email: 'bob@example.com', department: 'Engineering', role: 'Employee', status: 'Active' },
  { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', department: 'IT Support', role: 'Employee', status: 'Active' },
];

export const mockDashboardData = {
  kpi: {
    available: 128,
    allocated: 76,
    maintenance: 4,
    activeBookings: 9,
    pendingTransfers: 3,
    upcomingReturns: 12
  },
  alerts: [
    { id: 1, message: "3 assets overdue for return - flagged for follow-up", type: "error" }
  ],
  recentActivity: [
    { id: 1, log: "Laptop AF-0114 - allocated to Priya shah - IT dept", timestamp: "10 mins ago" },
    { id: 2, log: "Room B2 - booking confirmed - 2:00 to 3:00 PM", timestamp: "1 hour ago" },
    { id: 3, log: "Projector AF-0062 - maintenance resolved", timestamp: "2 hours ago" }
  ]
};

export const mockAssets = [
  { id: 1, tag: 'AF-0001', name: 'Dell XPS 15', category: 'Electronics', serialNumber: 'SN-XPS-123', acquisitionDate: '2023-01-15', acquisitionCost: 1500, condition: 'Good', location: 'IT Store', shared: false, status: 'Available', assignedTo: null, department: 'IT Support' },
  { id: 2, tag: 'AF-0002', name: 'MacBook Pro M2', category: 'Electronics', serialNumber: 'SN-MBP-456', acquisitionDate: '2023-05-20', acquisitionCost: 2000, condition: 'Excellent', location: 'Design Dept', shared: false, status: 'Allocated', assignedTo: 'Alice Johnson', department: 'Engineering' },
  { id: 3, tag: 'AF-0003', name: 'Conference Room Projector', category: 'Electronics', serialNumber: 'SN-PROJ-789', acquisitionDate: '2022-11-10', acquisitionCost: 800, condition: 'Fair', location: 'Room B2', shared: true, status: 'Available', assignedTo: null, department: 'Facilities' },
  { id: 4, tag: 'AF-0004', name: 'Office Chair Ergonomic', category: 'Furniture', serialNumber: 'N/A', acquisitionDate: '2021-08-05', acquisitionCost: 250, condition: 'Good', location: 'Open Workspace', shared: false, status: 'Available', assignedTo: null, department: 'Human Resources' },
  { id: 5, tag: 'AF-0005', name: 'Company Delivery Van', category: 'Vehicles', serialNumber: 'VIN-987654321', acquisitionDate: '2020-02-15', acquisitionCost: 25000, condition: 'Under Maintenance', location: 'Garage', shared: true, status: 'Under Maintenance', assignedTo: null, department: 'Logistics' },
];

export const mockAllocations = [
  { id: 1, assetId: 2, assetTag: 'AF-0002', assetName: 'MacBook Pro M2', assignedTo: 'Alice Johnson', assignedById: 1, assignedDate: '2023-06-01', expectedReturnDate: '2026-12-31', status: 'Active' },
  { id: 2, assetId: 4, assetTag: 'AF-0004', assetName: 'Office Chair Ergonomic', assignedTo: 'Jane Smith', assignedById: 1, assignedDate: '2023-01-10', expectedReturnDate: null, status: 'Active' },
];

export const mockTransferRequests = [
  { id: 1, assetId: 2, assetTag: 'AF-0002', assetName: 'MacBook Pro M2', currentHolder: 'Alice Johnson', requestedBy: 'Bob Wilson', requestDate: '2023-10-25', status: 'Pending' }
];

export const mockBookings = [
  { id: 1, assetId: 3, assetName: 'Conference Room Projector', bookedBy: 'John Doe', date: '2023-11-15', startTime: '09:00', endTime: '10:00', status: 'Completed' },
  { id: 2, assetId: 5, assetName: 'Company Delivery Van', bookedBy: 'Jane Smith', date: '2023-11-16', startTime: '13:00', endTime: '15:00', status: 'Upcoming' },
];

export const mockMaintenanceRequests = [
  { id: 1, assetId: 5, assetName: 'Company Delivery Van', reportedBy: 'Bob Wilson', issue: 'Engine making weird noise', priority: 'High', date: '2023-11-10', status: 'In Progress', technician: 'Mike Mechanic' },
  { id: 2, assetId: 1, assetName: 'Dell XPS 15', reportedBy: 'John Doe', issue: 'Keyboard keys sticky', priority: 'Low', date: '2023-11-12', status: 'Pending', technician: null },
];

export const mockAuditCycles = [
  { id: 1, title: 'Q4 IT Asset Audit', department: 'IT Support', startDate: '2023-11-01', endDate: '2023-11-15', auditors: ['Alice Johnson'], status: 'Active', results: [] },
  { id: 2, title: 'Annual Furniture Check', department: 'Human Resources', startDate: '2023-01-01', endDate: '2023-01-31', auditors: ['Jane Smith'], status: 'Closed', results: [{ assetId: 4, status: 'Verified' }] },
];

export const mockNotifications = [
  { id: 1, type: 'Alert', message: 'Asset AF-0005 (Company Van) is overdue for return.', date: '2023-11-20 09:00', read: false },
  { id: 2, type: 'Info', message: 'John Doe booked Conference Room Projector for Nov 15.', date: '2023-11-14 14:30', read: true },
  { id: 3, type: 'Action', message: 'Maintenance request #2 requires approval.', date: '2023-11-12 10:15', read: false },
];

export const mockReportsData = {
  utilization: [
    { category: 'Electronics', percentage: 85 },
    { category: 'Vehicles', percentage: 60 },
    { category: 'Furniture', percentage: 95 },
  ],
  maintenance: [
    { asset: 'Delivery Van', incidents: 4 },
    { asset: 'Projector', incidents: 2 },
    { asset: 'Printers', incidents: 7 },
  ],
  departmentAllocation: [
    { dept: 'IT Support', count: 45 },
    { dept: 'Engineering', count: 30 },
    { dept: 'HR', count: 15 },
    { dept: 'Sales', count: 25 },
  ]
};
