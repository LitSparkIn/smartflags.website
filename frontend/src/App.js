import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/admin/Login';
import { UserLogin } from './pages/UserLogin';
import { Dashboard } from './pages/admin/Dashboard';
import { Organisations } from './pages/admin/Organisations';
import { OrganisationDetails } from './pages/admin/OrganisationDetails';
import { Properties } from './pages/admin/Properties';
import { PropertyDetails } from './pages/admin/PropertyDetails';
import { Countries } from './pages/admin/Countries';
import { States } from './pages/admin/States';
import { Cities } from './pages/admin/Cities';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from './components/ui/sonner';
import { Toaster as ShadcnToaster } from './components/ui/toaster';

// User Admin Pages
import { Dashboard as UserDashboard } from './pages/user/Dashboard';
import { Properties as UserProperties } from './pages/user/Properties';
import { SmartView } from './pages/user/SmartView';
import { DailyGuestList } from './pages/user/DailyGuestList';
import { Allocation } from './pages/user/Allocation';
import { AllocationDetails } from './pages/user/AllocationDetails';
import { Staff } from './pages/user/Staff';
import { Roles as UserRoles } from './pages/user/Roles';
import { SeatTypes } from './pages/user/SeatTypes';
import { Seats } from './pages/user/Seats';
import { Groups } from './pages/user/Groups';
import { Devices } from './pages/user/Devices';

// Staff Pages
import { StaffLogin } from './pages/staff/StaffLogin';
import { StaffSmartView } from './pages/staff/StaffSmartView';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            
            {/* Admin Login */}
            <Route path="/admin/login" element={<Login />} />
            
            {/* User Login (OTP-based) */}
            <Route path="/user/login" element={<UserLogin />} />
            
            {/* Protected Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/organisations"
              element={
                <ProtectedRoute>
                  <Organisations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/organisations/:id"
              element={
                <ProtectedRoute>
                  <OrganisationDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/properties"
              element={
                <ProtectedRoute>
                  <Properties />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/properties/:id"
              element={
                <ProtectedRoute>
                  <PropertyDetails />
                </ProtectedRoute>
              }
            />
            
            {/* Master Data Routes */}
            <Route
              path="/admin/master-data/countries"
              element={
                <ProtectedRoute>
                  <Countries />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/master-data/states"
              element={
                <ProtectedRoute>
                  <States />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/master-data/cities"
              element={
                <ProtectedRoute>
                  <Cities />
                </ProtectedRoute>
              }
            />
            
            {/* Redirect /admin to dashboard */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* User Admin Routes (for Organisation and Property Admins) */}
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/properties" element={<UserProperties />} />
            <Route path="/user/smartview" element={<SmartView />} />
            <Route path="/user/guest-list" element={<DailyGuestList />} />
            <Route path="/user/allocation" element={<Allocation />} />
            <Route path="/user/allocation/:allocationId" element={<AllocationDetails />} />
            <Route path="/user/devices" element={<Devices />} />
            <Route path="/user/staff" element={<Staff />} />
            <Route path="/user/roles" element={<UserRoles />} />
            <Route path="/user/seat-types" element={<SeatTypes />} />
            <Route path="/user/seats" element={<Seats />} />
            <Route path="/user/groups" element={<Groups />} />
            
            {/* Redirect /user to dashboard */}
            <Route path="/user" element={<Navigate to="/user/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
        <ShadcnToaster />
      </div>
    </AuthProvider>
  );
}

export default App;