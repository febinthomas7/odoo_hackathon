import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminDashboard from './pages/AdminDashboard'
import AssetManagerDashboard from './pages/AssetManagerDashboard'
import DepartmentHeadDashboard from './pages/DepartmentHeadDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/asset-manager-dashboard" element={<AssetManagerDashboard />} />
        <Route path="/department-head-dashboard" element={<DepartmentHeadDashboard />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        
        {/* Redirect old dashboard route to admin-dashboard for backward compatibility if needed, or remove */}
        <Route path="/dashboard" element={<Navigate to="/admin-dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
