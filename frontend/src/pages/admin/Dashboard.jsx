import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Building2, Home, Users, TrendingUp, Trash2, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || window.location.origin;

export const Dashboard = () => {
  const [orgCount, setOrgCount] = useState(0);
  const [propCount, setPropCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearing, setClearing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      const orgsResponse = await axios.get(`${BACKEND_URL}/api/organisations`);
      if (orgsResponse.data.success) {
        setOrgCount(orgsResponse.data.organisations.length);
      }
      
      const propsResponse = await axios.get(`${BACKEND_URL}/api/properties`);
      if (propsResponse.data.success) {
        setPropCount(propsResponse.data.properties.length);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllData = async () => {
    try {
      setClearing(true);
      const response = await axios.post(`${BACKEND_URL}/api/admin/clear-all-data`);
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "All data has been cleared successfully",
        });
        
        // Refresh stats
        setOrgCount(0);
        setPropCount(0);
        fetchStats();
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to clear data",
        variant: "destructive",
      });
    } finally {
      setClearing(false);
      setShowClearDialog(false);
    }
  };

  const stats = [
    {
      label: 'Total Organisations',
      value: orgCount,
      icon: Building2,
      color: 'from-teal-500 to-cyan-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600'
    },
    {
      label: 'Total Properties',
      value: propCount,
      icon: Home,
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600'
    },
    {
      label: 'Active Users',
      value: '0',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Growth Rate',
      value: '0%',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Welcome back! Here's an overview of your system.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* System Overview */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-4">System Overview</h2>
          <div className="text-center py-8">
            <div className="text-6xl font-bold text-gradient bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent mb-2">
              {orgCount + propCount}
            </div>
            <p className="text-slate-600">Total Entities in System</p>
            <div className="mt-6 flex justify-center gap-8">
              <div>
                <p className="text-2xl font-bold text-teal-600">{orgCount}</p>
                <p className="text-sm text-slate-600">Organisations</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-cyan-600">{propCount}</p>
                <p className="text-sm text-slate-600">Properties</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl shadow-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg p-4 text-left transition-all">
              <Building2 className="w-8 h-8 mb-2" />
              <p className="font-semibold">Add Organisation</p>
            </button>
            <button className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg p-4 text-left transition-all">
              <Home className="w-8 h-8 mb-2" />
              <p className="font-semibold">Add Property</p>
            </button>
            <button className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg p-4 text-left transition-all">
              <Users className="w-8 h-8 mb-2" />
              <p className="font-semibold">View Reports</p>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 bg-red-50 border-2 border-red-200 rounded-xl shadow-lg p-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-red-900 mb-2">Danger Zone</h2>
              <p className="text-red-700 mb-4">
                Clear all data from the database. This action cannot be undone and will permanently delete all organisations, properties, seats, groups, staff, and menu data.
              </p>
              <button
                onClick={() => setShowClearDialog(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                <span>Clear All Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Clear Data Confirmation Dialog */}
        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="w-6 h-6" />
                <span>Are you absolutely sure?</span>
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3 pt-2">
                <p className="font-semibold text-slate-900">
                  This action will permanently delete:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>All Organisations</li>
                  <li>All Properties</li>
                  <li>All Seats & Groups</li>
                  <li>All Seat Types</li>
                  <li>All Staff & Roles</li>
                  <li>All Allocations</li>
                  <li>All Devices</li>
                  <li>All Menu Items, Categories, Tags & Dietary Restrictions</li>
                  <li>All Guests</li>
                </ul>
                <p className="font-semibold text-red-600 mt-3">
                  This action cannot be undone. All data will be lost forever.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={clearing}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearAllData}
                disabled={clearing}
                className="bg-red-600 hover:bg-red-700"
              >
                {clearing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Clearing...
                  </>
                ) : (
                  'Yes, Clear All Data'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};