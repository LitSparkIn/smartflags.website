import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Plus, Pencil, Trash2, Search, Building2, Mail, Phone, MapPin, Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { OrganisationDialog } from '../../components/admin/OrganisationDialog';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
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

export const Organisations = () => {
  const navigate = useNavigate();
  const [organisations, setOrganisations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganisations();
  }, []);

  const fetchOrganisations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/organisations`);
      if (response.data.success) {
        setOrganisations(response.data.organisations);
      }
    } catch (error) {
      console.error('Error fetching organisations:', error);
      toast.error('Failed to load organisations');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrganisations = organisations.filter((org) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setEditingOrg(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (org, e) => {
    e.stopPropagation();
    setEditingOrg(org);
    setIsDialogOpen(true);
  };

  const handleView = (orgId) => {
    navigate(`/admin/organisations/${orgId}`);
  };

  const handleSave = async (orgData) => {
    try {
      if (editingOrg) {
        // Update
        const response = await axios.put(`${BACKEND_URL}/api/organisations/${editingOrg.id}`, orgData);
        if (response.data.success) {
          toast.success('Organisation updated successfully!');
          fetchOrganisations();
        }
      } else {
        // Create
        const response = await axios.post(`${BACKEND_URL}/api/organisations`, orgData);
        if (response.data.success) {
          toast.success('Organisation created successfully!');
          fetchOrganisations();
        }
      }
      setIsDialogOpen(false);
      setEditingOrg(null);
    } catch (error) {
      console.error('Error saving organisation:', error);
      toast.error(error.response?.data?.detail || 'Failed to save organisation');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/organisations/${id}`);
      if (response.data.success) {
        toast.success('Organisation deleted successfully!');
        fetchOrganisations();
      }
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting organisation:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete organisation');
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading organisations...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

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

        {/* Grid View */}
        {filteredOrganisations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-12 text-center">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No organisations found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrganisations.map((org) => (
                <div
                  key={org.id}
                  onClick={() => handleView(org.id)}
                  className="bg-white rounded-xl shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer section overflow-hidden"
                >
                  {/* Header with Icon */}
                  <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-6">
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Building2 className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => handleEdit(org, e)}
                          className="w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Pencil className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(org.id);
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
                    <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-teal-600 transition-colors">
                      {org.name}
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-600 break-all">{org.email}</p>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Phone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-600">{org.phone || 'N/A'}</p>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-600 line-clamp-2">{org.address || 'N/A'}</p>
                      </div>
                    </div>

                    {/* View Details Link */}
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-teal-600 group-hover:text-teal-700">
                        <span className="text-sm font-medium">View Details</span>
                        <Eye className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-6 text-sm text-slate-500">
              Showing {filteredOrganisations.length} of {organisations.length} organisations
            </div>
          </>
        )}
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