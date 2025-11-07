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
import { Roles } from './pages/admin/Roles';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from './components/ui/sonner';

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
            <Route
              path="/admin/master-data/roles"
              element={
                <ProtectedRoute>
                  <Roles />
                </ProtectedRoute>
              }
            />
            
            {/* Redirect /admin to dashboard */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
}

export default App;