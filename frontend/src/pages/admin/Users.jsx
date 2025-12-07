import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Users as UsersIcon, Search, Building2, Home, UserCog, Mail, Calendar } from 'lucide-react';
import { Input } from '../../components/ui/input';
import axios from 'axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || window.location.origin;

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterType, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/admin/users`);
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by user type
    if (filterType !== 'all') {
      filtered = filtered.filter(user => user.userType === filterType);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.entityName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const getUserTypeIcon = (userType) => {
    switch (userType) {
      case 'Organisation Admin':
        return <Building2 className="w-5 h-5 text-teal-600" />;
      case 'Property Admin':
        return <Home className="w-5 h-5 text-cyan-600" />;
      case 'Staff':
        return <UserCog className="w-5 h-5 text-blue-600" />;
      default:
        return <UsersIcon className="w-5 h-5 text-slate-600" />;
    }
  };

  const getUserTypeBadge = (userType) => {
    const badges = {
      'Organisation Admin': 'bg-teal-100 text-teal-800 border-teal-300',
      'Property Admin': 'bg-cyan-100 text-cyan-800 border-cyan-300',
      'Staff': 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return badges[userType] || 'bg-slate-100 text-slate-800 border-slate-300';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  };

  const getStats = () => {
    const orgAdmins = users.filter(u => u.userType === 'Organisation Admin').length;
    const propAdmins = users.filter(u => u.userType === 'Property Admin').length;
    const staff = users.filter(u => u.userType === 'Staff').length;
    return { orgAdmins, propAdmins, staff, total: users.length };
  };

  const stats = getStats();

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading users...</p>
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Users</h1>
          <p className="text-slate-600">Manage all user accounts across the system</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <UsersIcon className="w-10 h-10 text-slate-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-sm text-slate-600">Total Users</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-teal-100">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-10 h-10 text-teal-600" />
            </div>
            <p className="text-3xl font-bold text-teal-900">{stats.orgAdmins}</p>
            <p className="text-sm text-teal-600">Organisation Admins</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-cyan-100">
            <div className="flex items-center justify-between mb-2">
              <Home className="w-10 h-10 text-cyan-600" />
            </div>
            <p className="text-3xl font-bold text-cyan-900">{stats.propAdmins}</p>
            <p className="text-sm text-cyan-600">Property Admins</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <UserCog className="w-10 h-10 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-900">{stats.staff}</p>
            <p className="text-sm text-blue-600">Staff Members</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by name, email, or entity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="Organisation Admin">Organisation Admins</SelectItem>
                <SelectItem value="Property Admin">Property Admins</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <UsersIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No users found</h3>
              <p className="text-slate-600">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'No users in the system yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      User Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Entity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsers.map((user, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-slate-900">
                              {user.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-slate-500 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {user.email || user.username || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getUserTypeIcon(user.userType)}
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getUserTypeBadge(user.userType)}`}>
                            {user.userType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-slate-900">
                            {user.entityName || 'N/A'}
                          </div>
                          <div className="text-slate-500 text-xs">
                            {user.entityType === 'organisation' ? 'Organisation' : 'Property'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-slate-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Results Count */}
        {filteredUsers.length > 0 && (
          <div className="mt-4 text-center text-sm text-slate-600">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
