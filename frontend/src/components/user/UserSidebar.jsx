import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Armchair, Grid3x3, UsersRound, Waves, Eye, UserCheck, MapPin, Smartphone, Shield, ChefHat, ChevronDown, ChevronRight, UtensilsCrossed } from 'lucide-react';

export const UserSidebar = ({ user }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(true);
  
  const isActive = (path) => location.pathname === path;
  const isMenuActive = () => location.pathname.startsWith('/user/menu');
  
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
    { name: 'Devices', path: '/user/devices', icon: Smartphone },
    { name: 'Staff', path: '/user/staff', icon: Users },
    { name: 'Roles', path: '/user/roles', icon: Shield },
    { name: 'Seat Types', path: '/user/seat-types', icon: Grid3x3 },
    { name: 'Seats', path: '/user/seats', icon: Armchair },
    { name: 'Groups', path: '/user/groups', icon: UsersRound }
  ];

  // Menu sub-items
  const menuSubItems = [
    { name: 'Categories', path: '/user/menu/categories', icon: ChefHat },
    { name: 'Items', path: '/user/menu/items', icon: UtensilsCrossed }
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
      <nav className="flex-1 p-4 overflow-y-auto">
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

          {/* Menu Section - Only for Property Admin */}
          {user?.entityType === 'property' && (
            <li>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                  isMenuActive()
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ChefHat className="w-5 h-5" />
                  <span className="font-medium">Menu</span>
                </div>
                {menuOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {/* Sub-menu */}
              {menuOpen && (
                <ul className="mt-2 ml-4 space-y-1">
                  {menuSubItems.map((subItem) => {
                    const SubIcon = subItem.icon;
                    return (
                      <li key={subItem.path}>
                        <Link
                          to={subItem.path}
                          className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all text-sm ${
                            isActive(subItem.path)
                              ? 'bg-teal-500 text-white'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <SubIcon className="w-4 h-4" />
                          <span>{subItem.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          )}
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
