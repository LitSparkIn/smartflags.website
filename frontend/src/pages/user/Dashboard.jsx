import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/user/UserLayout';
import { Building2, Users, Armchair, TrendingUp } from 'lucide-react';

export const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalStaff: 0,
    totalSeats: 0,
    totalSeatTypes: 0,
    totalGroups: 0
  });

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Fetch stats based on user type
      if (parsedUser.entityType === 'organisation') {
        fetchOrganisationStats(parsedUser.entityId);
      } else if (parsedUser.entityType === 'property') {
        fetchPropertyStats(parsedUser.entityId);
      }
    }
  }, []);

  const fetchOrganisationStats = (orgId) => {
    try {
      // Get properties for this organisation
      const storedProperties = localStorage.getItem('smartflags_properties');
      const allProperties = storedProperties ? JSON.parse(storedProperties) : [];
      const orgProperties = allProperties.filter(prop => prop.organisationId === orgId);
      
      setStats(prev => ({
        ...prev,
        totalProperties: orgProperties.length
      }));
    } catch (error) {
      console.error('Error fetching organisation stats:', error);
    }
  };

  const fetchPropertyStats = (propertyId) => {
    try {
      // In future, fetch actual staff, seats, etc. for this property
      // For now, keeping as 0 until those features are implemented
      setStats({
        totalStaff: 0,
        totalSeatTypes: 0,
        totalSeats: 0,
        totalGroups: 0
      });
    } catch (error) {
      console.error('Error fetching property stats:', error);
    }
  };

  // Stats for Organisation Admin
  const orgStats = [
    { label: 'Total Properties', value: stats.totalProperties.toString(), icon: Building2, color: 'from-blue-500 to-blue-600' },
    { label: 'Active Staff', value: '0', icon: Users, color: 'from-green-500 to-green-600' },
    { label: 'Total Seats', value: '0', icon: Armchair, color: 'from-purple-500 to-purple-600' },
    { label: 'Growth Rate', value: '0%', icon: TrendingUp, color: 'from-orange-500 to-orange-600' }
  ];

  // Stats for Property Admin
  const propertyStats = [
    { label: 'Total Staff', value: stats.totalStaff.toString(), icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Seat Types', value: stats.totalSeatTypes.toString(), icon: Armchair, color: 'from-green-500 to-green-600' },
    { label: 'Total Seats', value: stats.totalSeats.toString(), icon: Armchair, color: 'from-purple-500 to-purple-600' },
    { label: 'Active Groups', value: stats.totalGroups.toString(), icon: Users, color: 'from-orange-500 to-orange-600' }
  ];

  const displayStats = user?.entityType === 'organisation' ? orgStats : propertyStats;

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-teal-50">
            {user?.entityType === 'organisation' 
              ? 'Manage your properties and monitor performance across your organization.'
              : 'Manage your staff, seats, and groups for optimal pool and beach operations.'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</h3>
                <p className="text-sm text-slate-600">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Info */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Getting Started</h2>
          <div className="space-y-3">
            {user?.entityType === 'organisation' ? (
              <>
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Add Your First Property</h3>
                    <p className="text-sm text-slate-600">Navigate to Properties section to add and manage your properties.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Assign Property Admins</h3>
                    <p className="text-sm text-slate-600">Add admin users to manage individual properties.</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Add Staff Members</h3>
                    <p className="text-sm text-slate-600">Navigate to Staff section to add and manage your team.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Configure Seat Types</h3>
                    <p className="text-sm text-slate-600">Set up different types of seats for your pool or beach area.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Create Seats & Groups</h3>
                    <p className="text-sm text-slate-600">Add individual seats and organize them into groups for better management.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};
