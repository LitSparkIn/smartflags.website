import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { MapPin, Users } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || window.location.origin;

export const StaffSectionSelection = () => {
  const [sections, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Get staff data from location.state or localStorage
  let staffData = location.state?.staffData;
  if (!staffData) {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      staffData = JSON.parse(storedUserData);
    }
  }

  useEffect(() => {
    // If no staff data, redirect back to login
    if (!staffData) {
      navigate('/staff/login');
      return;
    }
    
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/sections/${staffData.propertyId}`);
      
      if (response.data.success) {
        setGroups(response.data.sections || []);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setError('Failed to load sections. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedGroup) {
      setError('Please select a section');
      return;
    }

    // Add selected section to staff data
    const updatedStaffData = {
      ...staffData,
      selectedGroupId: selectedGroup,
      selectedGroupName: sections.find(g => g.id === selectedGroup)?.name
    };

    // Store in localStorage and login
    localStorage.setItem('userData', JSON.stringify(updatedStaffData));
    login(updatedStaffData);
    
    // Navigate to staff dashboard
    navigate('/staff/smartview');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {staffData?.selectedGroupId ? 'Switch Your Group' : 'Select Your Group'}
          </h1>
          <p className="text-slate-600">
            {staffData?.selectedGroupId 
              ? 'Choose a different area to serve' 
              : 'Choose which area you\'ll be serving today'}
          </p>
        </div>

        {/* Selection Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              Welcome, {staffData?.name}!
            </h2>
            <p className="text-slate-600 text-sm">
              {staffData?.selectedGroupId 
                ? `Currently serving: ${staffData?.selectedGroupName || 'Unknown'}` 
                : 'Select your service area below'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Groups Selection */}
            {sections.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                <Users className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm text-amber-800">No sections available at this property</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      setSelectedGroup(section.id);
                      setError('');
                    }}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedGroup === section.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedGroup === section.id
                            ? 'bg-blue-500'
                            : 'bg-slate-100'
                        }`}>
                          <MapPin className={`w-5 h-5 ${
                            selectedGroup === section.id ? 'text-white' : 'text-slate-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{section.name}</h3>
                          {section.description && (
                            <p className="text-sm text-slate-500">{section.description}</p>
                          )}
                        </div>
                      </div>
                      {selectedGroup === section.id && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

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
              disabled={sections.length === 0}
            >
              Continue to Dashboard
            </Button>
          </form>
        </div>

        {/* Back Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/staff/login')}
            className="text-slate-600 hover:text-slate-900 text-sm font-medium"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};
