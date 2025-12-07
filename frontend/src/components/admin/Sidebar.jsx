import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Home, LogOut, Waves, Database, ChevronDown, ChevronRight, Globe, MapPin, Map, Shield, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';

export const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(true);

  const mainMenuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/organisations', label: 'Organisations', icon: Building2 },
    { path: '/admin/properties', label: 'Properties', icon: Home }
  ];

  const masterDataItems = [
    { path: '/admin/master-data/countries', label: 'Country', icon: Globe },
    { path: '/admin/master-data/states', label: 'State', icon: Map },
    { path: '/admin/master-data/cities', label: 'City', icon: MapPin }
  ];

  const isActive = (path) => location.pathname === path;
  const isMasterDataActive = () => masterDataItems.some(item => location.pathname === item.path);

  return (
    <div className="w-64 bg-slate-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-2 rounded-lg">
            <Waves className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">SmartFlags</span>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Main Menu Items */}
        {mainMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Master Data Menu */}
        <div className="pt-2">
          <button
            onClick={() => setIsMasterDataOpen(!isMasterDataOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
              isMasterDataActive()
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Database className="w-5 h-5" />
              <span className="font-medium">Master Data</span>
            </div>
            {isMasterDataOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* Nested Items */}
          {isMasterDataOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {masterDataItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-4 mb-3">
          <p className="text-sm font-medium text-white">{user?.name}</p>
          <p className="text-xs text-slate-400">{user?.email}</p>
        </div>
        <Button
          onClick={logout}
          variant="outline"
          className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};