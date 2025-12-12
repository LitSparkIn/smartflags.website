import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserSidebar } from './UserSidebar';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';

export const UserLayout = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('userData');
    const authToken = localStorage.getItem('authToken');

    if (!userData || !authToken) {
      // Redirect to user login if not authenticated
      navigate('/user/login');
      return;
    }

    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    navigate('/user/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <UserSidebar user={user} />
      
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {user.entityType === 'organisation' ? 'Organisation Management' : 'Property Management'}
              </h2>
              <p className="text-sm text-slate-500">Manage your {user.entityType === 'organisation' ? 'properties and settings' : 'staff, seats, and sections'}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
