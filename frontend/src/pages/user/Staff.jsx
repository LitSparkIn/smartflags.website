import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/user/UserLayout';
import { Button } from '../../components/ui/button';
import { Plus, Users, Search, Pencil, Trash2, Mail, Phone, Shield } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { StaffDialog } from '../../components/user/StaffDialog';
import axios from 'axios';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchRoles();
      fetchStaff(parsedUser.entityId);
    }
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/roles`);
      if (response.data.success) {
        setRoles(response.data.roles);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch roles",
        variant: "destructive"
      });
    }
  };

  const fetchStaff = async (propertyId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/staff/${propertyId}`);
      if (response.data.success) {
        setStaffList(response.data.staff);
        setFilteredStaff(response.data.staff);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        title: "Error",
        description: "Failed to fetch staff members",
        variant: "destructive"
      });
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredStaff(staffList);
    } else {
      const filtered = staffList.filter(staff => 
        staff.name.toLowerCase().includes(term) ||
        staff.email.toLowerCase().includes(term) ||
        (staff.phone && staff.phone.includes(term))
      );
      setFilteredStaff(filtered);
    }
  };

  const handleSave = async (data) => {
    try {
      if (selectedStaff) {
        // Update existing
        const response = await axios.put(
          `${BACKEND_URL}/api/staff/${selectedStaff.id}`,
          data
        );
        
        if (response.data.success) {
          toast({
            title: "Success",
            description: "Staff member updated successfully"
          });
          fetchStaff(user.entityId);
        }
      } else {
        // Create new
        const response = await axios.post(`${BACKEND_URL}/api/staff`, data);
        
        if (response.data.success) {
          toast({
            title: "Success",
            description: "Staff member created successfully"
          });
          fetchStaff(user.entityId);
        }
      }
      
      setIsDialogOpen(false);
      setSelectedStaff(null);
    } catch (error) {
      console.error('Error saving staff:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save staff member",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (staff) => {
    setSelectedStaff(staff);
    setIsDialogOpen(true);
  };

  const handleDelete = async (staffId) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    try {
      const response = await axios.delete(`${BACKEND_URL}/api/staff/${staffId}`);
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Staff member deleted successfully"
        });
        fetchStaff(user.entityId);
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast({
        title: "Error",
        description: "Failed to delete staff member",
        variant: "destructive"
      });
    }
  };

  const handleAddNew = () => {
    setSelectedStaff(null);
    setIsDialogOpen(true);
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown Role';
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Staff Management</h1>
            <p className="text-slate-600 mt-1">Manage your staff members and their roles</p>
          </div>
          <Button 
            onClick={handleAddNew}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            disabled={roles.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Staff Member
          </Button>
        </div>

        {/* No Roles Warning */}
        {roles.length === 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              ⚠️ Please create roles in Master Data before adding staff members.
            </p>
          </div>
        )}

        {/* Search Bar */}
        {staffList.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by name, email, or phone..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        )}

        {/* Staff List or Empty State */}
        {filteredStaff.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                {searchTerm ? 'No staff members found' : 'No staff members yet'}
              </h2>
              <p className="text-slate-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Add your first staff member to start managing your team. You can assign roles and permissions.'}
              </p>
              {!searchTerm && roles.length > 0 && (
                <Button 
                  onClick={handleAddNew}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Staff Member
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((staff) => (
              <div
                key={staff.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-slate-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {staff.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{staff.name}</h3>
                      <div className="flex items-center space-x-1 mt-1">
                        <Shield className="w-3 h-3 text-blue-600" />
                        <span className="text-xs text-blue-600 font-semibold">
                          {getRoleName(staff.roleId)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(staff)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(staff.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail className="w-4 h-4 mr-2 text-slate-400" />
                    <span className="truncate">{staff.email}</span>
                  </div>
                  {staff.phone && (
                    <div className="flex items-center text-sm text-slate-600">
                      <Phone className="w-4 h-4 mr-2 text-slate-400" />
                      <span>{staff.phone}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    Added {new Date(staff.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog */}
      <StaffDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedStaff(null);
        }}
        staff={selectedStaff}
        onSave={handleSave}
        propertyId={user?.entityId}
        roles={roles}
      />
    </UserLayout>
  );
};
