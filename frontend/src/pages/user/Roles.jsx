import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/user/UserLayout';
import { Plus, Pencil, Trash2, Search, Shield } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import axios from 'axios';
import { useToast } from '../../hooks/use-toast';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setEditingRole(null);
    setFormData({ name: '', description: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (role, e) => {
    e.stopPropagation();
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingRole) {
        // Update existing role
        const response = await axios.put(
          `${BACKEND_URL}/api/roles/${editingRole.id}`,
          formData
        );
        
        if (response.data.success) {
          toast({
            title: "Success",
            description: "Role updated successfully"
          });
          fetchRoles();
        }
      } else {
        // Create new role
        const response = await axios.post(`${BACKEND_URL}/api/roles`, formData);
        
        if (response.data.success) {
          toast({
            title: "Success",
            description: "Role created successfully"
          });
          fetchRoles();
        }
      }
      setIsDialogOpen(false);
      setEditingRole(null);
      setFormData({ name: '', description: '' });
    } catch (error) {
      console.error('Error saving role:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save role",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/roles/${id}`);
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Role deleted successfully"
        });
        fetchRoles();
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete role",
        variant: "destructive"
      });
    }
    setDeleteId(null);
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Role Management</h1>
            <p className="text-slate-600 mt-1">Manage roles and permissions for your property</p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Role
          </Button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Roles Grid */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-slate-500">Loading roles...</p>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              {searchTerm ? 'No roles found' : 'No roles yet'}
            </h2>
            <p className="text-slate-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Create your first role to start managing staff permissions'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={handleCreate}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Role
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => (
              <div
                key={role.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-slate-200"
              >
                {/* Header */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => handleEdit(role, e)}
                        className="w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(role.id);
                        }}
                        className="w-9 h-9 bg-white/20 hover:bg-red-500 backdrop-blur-sm rounded-lg flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {role.name}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-3">
                    {role.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </DialogTitle>
              <DialogDescription>
                {editingRole 
                  ? 'Update the role details below'
                  : 'Fill in the details to create a new role'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Pool Manager"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role and its responsibilities..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingRole(null);
                  setFormData({ name: '', description: '' });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                {editingRole ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the role.
                Make sure no staff members are assigned to this role.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDelete(deleteId)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </UserLayout>
  );
};
