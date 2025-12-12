import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { UserCircle, Lock, Building2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || window.location.origin;

export const StaffLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    pin: '',
    propertyId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    if (!formData.pin.trim()) {
      setError('PIN is required');
      return;
    }

    if (!formData.propertyId.trim()) {
      setError('Property ID is required');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${BACKEND_URL}/api/staff/login`, formData);

      if (response.data.success) {
        // Store staff data
        const staffData = {
          ...response.data.staff,
          entityType: 'staff',
          entityId: response.data.propertyId
        };
        
        // Fetch role details to check if group selection is needed
        const roleResponse = await axios.get(`${BACKEND_URL}/api/roles/${response.data.staff.roleId}`);
        const roleName = roleResponse.data.role?.name || '';
        
        // Roles that require group selection
        const rolesRequiringGroupSelection = [
          'Pool Attendant',
          'Beach Attendant',
          'Food and Beverages Server'
        ];
        
        if (rolesRequiringGroupSelection.includes(roleName)) {
          // Navigate to group selection page with staff data
          navigate('/staff/group-selection', { state: { staffData } });
        } else {
          // For other roles (like Pool and Beach Manager), go directly to dashboard
          localStorage.setItem('userData', JSON.stringify(staffData));
          login(staffData);
          navigate('/staff/smartview');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        setError('Invalid username or PIN');
      } else {
        setError(error.response?.data?.detail || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">SmartFlags</h1>
          <p className="text-slate-600">Staff Login Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-600">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Property ID */}
            <div className="space-y-2">
              <Label htmlFor="propertyId" className="text-slate-700 font-medium">
                Property ID
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="propertyId"
                  name="propertyId"
                  value={formData.propertyId}
                  onChange={handleChange}
                  placeholder="Enter property ID"
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700 font-medium">
                Username
              </Label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            {/* PIN */}
            <div className="space-y-2">
              <Label htmlFor="pin" className="text-slate-700 font-medium">
                PIN
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="pin"
                  name="pin"
                  type="password"
                  inputMode="numeric"
                  value={formData.pin}
                  onChange={handleChange}
                  placeholder="Enter your PIN"
                  className="pl-10"
                  maxLength="6"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white h-12 text-base font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-600">
              Need help? Contact your property manager
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-slate-600 hover:text-slate-900 text-sm font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
