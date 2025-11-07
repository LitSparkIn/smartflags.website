import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Building2, Home, Users, TrendingUp } from 'lucide-react';
import { mockOrganisations, mockProperties } from '../../mockAdmin';

export const Dashboard = () => {
  const stats = [
    {
      label: 'Total Organisations',
      value: mockOrganisations.length || 0,
      icon: Building2,
      color: 'from-teal-500 to-cyan-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600'
    },
    {
      label: 'Total Properties',
      value: mockProperties.length || 0,
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

        {/* Recent Organisations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Organisations</h2>
            <div className="space-y-3">
              {mockOrganisations.slice(0, 3).map((org) => (
                <div key={org.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-900">{org.name}</p>
                    <p className="text-sm text-slate-600">{org.email}</p>
                  </div>
                  <Building2 className="w-5 h-5 text-teal-600" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Properties */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Properties</h2>
            <div className="space-y-3">
              {mockProperties.slice(0, 3).map((prop) => (
                <div key={prop.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-900">{prop.name}</p>
                    <p className="text-sm text-slate-600">{prop.email}</p>
                  </div>
                  <Home className="w-5 h-5 text-cyan-600" />
                </div>
              ))}
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