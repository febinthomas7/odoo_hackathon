import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminDashboard from './pages/AdminDashboard'
import AssetManagerDashboard from './pages/AssetManagerDashboard'
import DepartmentHeadDashboard from './pages/DepartmentHeadDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Dashboard Routes based on role */}
        <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/asset-manager-dashboard" element={<ProtectedRoute allowedRoles={['Asset Manager']}><AssetManagerDashboard /></ProtectedRoute>} />
        <Route path="/department-head-dashboard" element={<ProtectedRoute allowedRoles={['Department Head']}><DepartmentHeadDashboard /></ProtectedRoute>} />
        <Route path="/employee-dashboard" element={<ProtectedRoute allowedRoles={['Employee']}><EmployeeDashboard /></ProtectedRoute>} />
        
        {/* Redirect old dashboard route to admin-dashboard for backward compatibility if needed, or remove */}
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
