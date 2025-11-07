import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Plus, Pencil, Trash2, Search, Shield } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { mockRoles as initialRoles } from '../../mockAdmin';
import { RoleDialog } from '../../components/admin/RoleDialog';
import { toast } from 'sonner';
import { useLocalStorage } from '../../hooks/useLocalStorage';
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

export const Roles = () => {
  const [roles, setRoles] = useLocalStorage('smartflags_roles', initialRoles);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setEditingRole(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (role, e) => {
    e.stopPropagation();
    setEditingRole(role);
    setIsDialogOpen(true);
  };

  const handleSave = (roleData) => {
    if (editingRole) {
      setRoles(roles.map(r =>
        r.id === editingRole.id ? { ...r, ...roleData } : r
      ));
      toast.success('Role updated successfully!');
    } else {
      const newRole = {
        id: `role-${Date.now()}`,
        ...roleData,
        createdAt: new Date().toISOString()
      };
      setRoles([...roles, newRole]);
      toast.success('Role created successfully!');
    }
    setIsDialogOpen(false);
    setEditingRole(null);
  };

  const handleDelete = (id) => {
    setRoles(roles.filter(r => r.id !== id));
    toast.success('Role deleted successfully!');
    setDeleteId(null);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Roles</h1>
            <p className="text-slate-600">Manage role and permissions</p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Role
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
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

        {/* Grid View */}
        {filteredRoles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-12 text-center">
            <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No roles found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoles.map((role) => (
                <div
                  key={role.id}
                  className="bg-white rounded-xl shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden"
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
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                      {role.name}
                    </h3>
                    
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {role.description}
                    </p>

                    {/* Permissions */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Permissions</p>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.slice(0, 3).map((permission, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-md font-medium"
                          >
                            {permission}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-sm text-slate-500">
              Showing {filteredRoles.length} of {roles.length} roles
            </div>
          </>
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