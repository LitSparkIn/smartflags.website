import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Plus, Pencil, Trash2, Search, Home, Building2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { mockProperties as initialProperties, mockOrganisations, getOrganisationById } from '../../mockAdmin';
import { PropertyDialog } from '../../components/admin/PropertyDialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

export const Properties = () => {
  const [properties, setProperties] = useState(initialProperties);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrgId, setFilterOrgId] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filteredProperties = properties.filter((prop) => {
    const matchesSearch =
      prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrg = filterOrgId === 'all' || prop.organisationId === filterOrgId;
    return matchesSearch && matchesOrg;
  });

  const handleCreate = () => {
    setEditingProperty(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setIsDialogOpen(true);
  };

  const handleSave = (propertyData) => {
    if (editingProperty) {
      // Update
      setProperties(properties.map(prop =>
        prop.id === editingProperty.id ? { ...prop, ...propertyData } : prop
      ));
      toast.success('Property updated successfully!');
    } else {
      // Create
      const newProperty = {
        id: `prop-${Date.now()}`,
        ...propertyData,
        createdAt: new Date().toISOString()
      };
      setProperties([...properties, newProperty]);
      toast.success('Property created successfully!');
    }
    setIsDialogOpen(false);
    setEditingProperty(null);
  };

  const handleDelete = (id) => {
    setProperties(properties.filter(prop => prop.id !== id));
    toast.success('Property deleted successfully!');
    setDeleteId(null);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Properties</h1>
            <p className="text-slate-600">Manage properties across all organisations</p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Property
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterOrgId} onValueChange={setFilterOrgId}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filter by organisation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organisations</SelectItem>
              {mockOrganisations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Property</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Organisation</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Address</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProperties.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No properties found</p>
                    </td>
                  </tr>
                ) : (
                  filteredProperties.map((property) => {
                    const organisation = getOrganisationById(property.organisationId);
                    return (
                      <tr key={property.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <Home className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{property.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-teal-600" />
                            <span className="text-sm text-slate-700">{organisation?.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-900">{property.email}</p>
                          <p className="text-sm text-slate-500">{property.phone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600 max-w-xs truncate">{property.address}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(property)}
                              className="border-slate-200 hover:bg-slate-50"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteId(property.id)}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 text-sm text-slate-500">
          Showing {filteredProperties.length} of {properties.length} properties
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <PropertyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        property={editingProperty}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the property.
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