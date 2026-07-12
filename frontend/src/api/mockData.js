// Consolidated Mock Data Source of Truth

export let mockDepartments = [
  { id: 1, name: 'IT Support', headId: 1, parentId: null, status: 'Active' },
  { id: 2, name: 'Human Resources', headId: 2, parentId: null, status: 'Active' },
  { id: 3, name: 'Engineering', headId: 3, parentId: null, status: 'Active' },
  { id: 4, name: 'Sales', headId: null, parentId: null, status: 'Active' },
];

export let mockAssetCategories = [
  { id: 1, name: 'Electronics', attributes: ['Warranty Period', 'Serial Number', 'OS Version'] },
  { id: 2, name: 'Furniture', attributes: ['Material', 'Dimensions'] },
  { id: 3, name: 'Vehicles', attributes: ['License Plate', 'Mileage'] },
];

export let mockEmployees = [
  { id: 1, name: 'John Doe', email: 'admin@assetflow.com', departmentId: 1, role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@assetflow.com', departmentId: 2, role: 'Department Head', status: 'Active' },
  { id: 3, name: 'Alice Johnson', email: 'alice@assetflow.com', departmentId: 3, role: 'Asset Manager', status: 'Active' },
  { id: 4, name: 'Bob Wilson', email: 'bob@assetflow.com', departmentId: 3, role: 'Employee', status: 'Active' },
  { id: 5, name: 'Charlie Brown', email: 'charlie@assetflow.com', departmentId: 1, role: 'Employee', status: 'Active' },
];

export let mockAssets = [
  { id: 1, tag: 'AF-0001', name: 'Dell XPS 15', categoryId: 1, customFields: {'Warranty Period': '2 Years', 'Serial Number': 'SN-XPS-123'}, acquisitionDate: '2023-01-15', acquisitionCost: 1500, condition: 'Good', location: 'IT Store', shared: false, status: 'Available' },
  { id: 2, tag: 'AF-0002', name: 'MacBook Pro M2', categoryId: 1, customFields: {'Warranty Period': '1 Year', 'Serial Number': 'SN-MBP-456'}, acquisitionDate: '2023-05-20', acquisitionCost: 2000, condition: 'Excellent', location: 'Design Dept', shared: false, status: 'Allocated' },
  { id: 3, tag: 'AF-0003', name: 'Conference Room Projector', categoryId: 1, customFields: {'Serial Number': 'SN-PROJ-789'}, acquisitionDate: '2022-11-10', acquisitionCost: 800, condition: 'Fair', location: 'Room B2', shared: true, status: 'Available' },
  { id: 4, tag: 'AF-0004', name: 'Office Chair Ergonomic', categoryId: 2, customFields: {'Material': 'Mesh'}, acquisitionDate: '2021-08-05', acquisitionCost: 250, condition: 'Good', location: 'Open Workspace', shared: false, status: 'Allocated' },
  { id: 5, tag: 'AF-0005', name: 'Company Delivery Van', categoryId: 3, customFields: {'License Plate': 'XYZ-1234', 'Mileage': '15000'}, acquisitionDate: '2020-02-15', acquisitionCost: 25000, condition: 'Fair', location: 'Garage', shared: true, status: 'Under Maintenance' },
];

export let mockAllocations = [
  // asset 2 allocated to Alice
  { id: 1, assetId: 2, assignedToId: 3, assignedById: 1, assignedDate: '2023-06-01', expectedReturnDate: '2026-12-31', status: 'Active', conditionNotes: null },
  // asset 4 allocated to Jane
  { id: 2, assetId: 4, assignedToId: 2, assignedById: 1, assignedDate: '2023-01-10', expectedReturnDate: '2023-11-01', status: 'Active', conditionNotes: null }, // Overdue
];

export let mockTransferRequests = [
  // Bob requests MacBook from Alice
  { id: 1, assetId: 2, requestedById: 4, requestDate: '2023-10-25', status: 'Pending' }
];

export let mockBookings = [
  { id: 1, assetId: 3, bookedById: 1, date: new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '10:00', status: 'Completed' },
  { id: 2, assetId: 5, bookedById: 2, date: new Date().toISOString().split('T')[0], startTime: '13:00', endTime: '15:00', status: 'Upcoming' },
];

export let mockMaintenanceRequests = [
  { id: 1, assetId: 5, reportedById: 4, issue: 'Engine making weird noise', priority: 'High', date: '2023-11-10', status: 'In Progress', technicianId: null },
  { id: 2, assetId: 1, reportedById: 1, issue: 'Keyboard keys sticky', priority: 'Low', date: '2023-11-12', status: 'Pending', technicianId: null },
];

export let mockAuditCycles = [
  { id: 1, title: 'Q4 IT Asset Audit', departmentId: 1, startDate: '2023-11-01', endDate: '2023-11-15', auditorIds: [3], status: 'Active', results: [] },
  { id: 2, title: 'Annual Furniture Check', departmentId: 2, startDate: '2023-01-01', endDate: '2023-01-31', auditorIds: [2], status: 'Closed', results: [{ assetId: 4, status: 'Verified' }] },
];

export let mockNotifications = [
  { id: 1, userId: 1, type: 'Alert', message: 'Asset AF-0004 is overdue for return.', date: new Date().toISOString(), read: false },
  { id: 2, userId: 1, type: 'Info', message: 'Jane Smith booked Conference Room Projector.', date: new Date().toISOString(), read: true },
  { id: 3, userId: 3, type: 'Action', message: 'Maintenance request #2 requires approval.', date: new Date().toISOString(), read: false },
];

export let mockActivityLogs = [
  { id: 1, userId: 1, action: 'Allocated MacBook Pro M2 to Alice Johnson', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, userId: 2, action: 'Booked Company Delivery Van', timestamp: new Date(Date.now() - 7200000).toISOString() },
];

export let mockReportsData = {
  utilization: [
    { category: 'Electronics', percentage: 85 },
    { category: 'Furniture', percentage: 95 },
    { category: 'Vehicles', percentage: 60 }
  ],
  departmentAllocation: [
    { dept: 'IT Support', count: 120 },
    { dept: 'Engineering', count: 85 },
    { dept: 'Sales', count: 40 },
    { dept: 'HR', count: 15 }
  ],
  maintenance: [
    { asset: 'Dell XPS 15', incidents: 12 },
    { asset: 'Conference Room Projector', incidents: 8 },
    { asset: 'Company Delivery Van', incidents: 5 },
    { asset: 'Office Chair Ergonomic', incidents: 2 }
  ]
};
