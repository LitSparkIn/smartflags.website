import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Plus, Pencil, Trash2, Search, Shield } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { RoleDialog } from '../../components/admin/RoleDialog';
import { toast } from 'sonner';
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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || window.location.origin;

export const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);

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
      toast.error('Failed to load roles');
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
    setIsDialogOpen(true);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setIsDialogOpen(true);
  };

  const handleSave = async (roleData) => {
    try {
      if (editingRole) {
        const response = await axios.put(`${BACKEND_URL}/api/roles/${editingRole.id}`, roleData);
        if (response.data.success) {
          toast.success('Role updated successfully!');
          fetchRoles();
        }
      } else {
        const response = await axios.post(`${BACKEND_URL}/api/roles`, roleData);
        if (response.data.success) {
          toast.success('Role created successfully!');
          fetchRoles();
        }
      }
      setIsDialogOpen(false);
      setEditingRole(null);
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error(error.response?.data?.detail || 'Failed to save role');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/roles/${id}`);
      if (response.data.success) {
        toast.success('Role deleted successfully!');
        fetchRoles();
      }
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete role');
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading roles...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Roles</h1>
            <p className="text-slate-600">Define roles and permissions for users</p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Role
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredRoles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No roles found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first role to get started'}
            </p>
            {!searchTerm && (
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add Role
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => (
              <div
                key={role.id}
                className="bg-white rounded-xl shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-4">{role.name}</h3>
                </div>

                <div className="p-6">
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{role.description}</p>

                  {role.permissions && role.permissions.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Permissions</p>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.slice(0, 3).map((permission, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md"
                          >
                            {permission}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded-md font-medium">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(role)}
                      className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(role.id)}
                      className="text-red-600 hover:text-red-900 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <RoleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        role={editingRole}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the role.
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
    </AdminLayout>
  );
};
