import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/user/UserLayout';
import { Settings, Clock, Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import axios from 'axios';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || window.location.origin;

export const Configuration = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    checkInTime: '14:00',
    checkOutTime: '11:00'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchConfiguration(parsedUser.entityId);
    }
  }, []);

  const fetchConfiguration = async (propertyId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/configuration/${propertyId}`);
      if (response.data.success && response.data.configuration) {
        setFormData({
          checkInTime: response.data.configuration.checkInTime || '14:00',
          checkOutTime: response.data.configuration.checkOutTime || '11:00'
        });
      }
    } catch (error) {
      console.error('Error fetching configuration:', error);
      toast({ title: "Error", description: "Failed to load configuration", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.checkInTime || !formData.checkOutTime) {
      toast({ title: "Validation Error", description: "Both check-in and check-out times are required", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      const response = await axios.post(`${BACKEND_URL}/api/configuration`, {
        propertyId: user.entityId,
        ...formData
      });

      if (response.data.success) {
        toast({ title: "Success", description: "Configuration saved successfully" });
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to save configuration", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading configuration...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Configuration</h1>
              <p className="text-slate-600">Manage property settings and preferences</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Guest Check-in/Check-out Times
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Set the standard check-in and check-out times for your property. These times will be used to validate guest allocations.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="checkInTime" className="text-slate-700 font-medium">
                    Check-in Time *
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="checkInTime"
                      name="checkInTime"
                      type="time"
                      value={formData.checkInTime}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Guests can create allocations from this time on their check-in date
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkOutTime" className="text-slate-700 font-medium">
                    Check-out Time *
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="checkOutTime"
                      name="checkOutTime"
                      type="time"
                      value={formData.checkOutTime}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Guests cannot create allocations after this time on their check-out date
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                How it works
              </h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>
                  <strong>Check-in:</strong> If a guest's check-in date is today and current time is before check-in time, 
                  they cannot create allocations yet.
                </li>
                <li>
                  <strong>Check-out:</strong> If a guest's check-out date is today and current time is after check-out time, 
                  they cannot create allocations anymore.
                </li>
                <li>
                  <strong>Example:</strong> Check-in at 2:00 PM, Check-out at 11:00 AM. 
                  Guest checks in on Jan 1st and checks out on Jan 5th. 
                  They can create allocations from 2:00 PM on Jan 1st until 11:00 AM on Jan 5th.
                </li>
              </ul>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </UserLayout>
  );
};
