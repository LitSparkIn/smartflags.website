import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Armchair, Grid3x3, UsersRound, Waves, Eye, UserCheck, MapPin, Smartphone } from 'lucide-react';

export const UserSidebar = ({ user }) => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  // Menu items for Organisation Admin
  const orgAdminMenu = [
    { name: 'Dashboard', path: '/user/dashboard', icon: LayoutDashboard },
    { name: 'Properties', path: '/user/properties', icon: Building2 }
  ];
  
  // Menu items for Property Admin
  const propertyAdminMenu = [
    { name: 'SmartView', path: '/user/smartview', icon: Eye },
    { name: 'Dashboard', path: '/user/dashboard', icon: LayoutDashboard },
    { name: 'Daily Guest List', path: '/user/guest-list', icon: UserCheck },
    { name: 'Allocation', path: '/user/allocation', icon: MapPin },
    { name: 'Staff', path: '/user/staff', icon: Users },
    { name: 'Seat Types', path: '/user/seat-types', icon: Grid3x3 },
    { name: 'Seats', path: '/user/seats', icon: Armchair },
    { name: 'Groups', path: '/user/groups', icon: UsersRound }
  ];
  
  // Select menu based on user type
  const menuItems = user?.entityType === 'organisation' ? orgAdminMenu : propertyAdminMenu;
  
  return (
    <div className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <Waves className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">SmartFlags</h1>
            <p className="text-xs text-slate-400">
              {user?.entityType === 'organisation' ? 'Organisation Admin' : 'Property Admin'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-teal-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info Section */}
      <div className="p-4 border-t border-slate-800">
        <div className="px-4 py-3 bg-slate-800 rounded-lg">
          <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
          <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
        </div>
      </div>
    </div>
  );
};
