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
      </div>
    </AdminLayout>
  );
};