import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Plus, Pencil, Trash2, Search, Building2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { mockOrganisations as initialOrganisations } from '../../mockAdmin';
import { OrganisationDialog } from '../../components/admin/OrganisationDialog';
import { toast } from 'sonner';
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

export const Organisations = () => {
  const [organisations, setOrganisations] = useState(initialOrganisations);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filteredOrganisations = organisations.filter((org) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setEditingOrg(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (org) => {
    setEditingOrg(org);
    setIsDialogOpen(true);
  };

  const handleSave = (orgData) => {
    if (editingOrg) {
      // Update
      setOrganisations(organisations.map(org =>
        org.id === editingOrg.id ? { ...org, ...orgData } : org
      ));
      toast.success('Organisation updated successfully!');
    } else {
      // Create
      const newOrg = {
        id: `org-${Date.now()}`,
        ...orgData,
        createdAt: new Date().toISOString()
      };
      setOrganisations([...organisations, newOrg]);
      toast.success('Organisation created successfully!');
    }
    setIsDialogOpen(false);
    setEditingOrg(null);
  };

  const handleDelete = (id) => {
    setOrganisations(organisations.filter(org => org.id !== id));
    toast.success('Organisation deleted successfully!');
    setDeleteId(null);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Organisations</h1>
            <p className="text-slate-600">Manage your organisations and their details</p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Organisation
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search organisations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Organisation</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Address</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredOrganisations.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No organisations found</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrganisations.map((org) => (
                    <tr key={org.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{org.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900">{org.email}</p>
                        <p className="text-sm text-slate-500">{org.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 max-w-xs truncate">{org.address}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(org)}
                            className="border-slate-200 hover:bg-slate-50"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteId(org.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 text-sm text-slate-500">
          Showing {filteredOrganisations.length} of {organisations.length} organisations
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <OrganisationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        organisation={editingOrg}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the organisation.
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