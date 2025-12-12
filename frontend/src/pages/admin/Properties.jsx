import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Plus, Pencil, Trash2, Search, Home, Building2, Mail, Phone, MapPin, Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { PropertyDialog } from '../../components/admin/PropertyDialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || window.location.origin;

export const Properties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrgId, setFilterOrgId] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch properties
      const propertiesResponse = await axios.get(`${BACKEND_URL}/api/properties`);
      if (propertiesResponse.data.success) {
        setProperties(propertiesResponse.data.properties);
      }
      
      // Fetch organisations for filter
      const orgsResponse = await axios.get(`${BACKEND_URL}/api/organisations`);
      if (orgsResponse.data.success) {
        setOrganisations(orgsResponse.data.organisations);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

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

  const handleEdit = (property, e) => {
    e.stopPropagation();
    setEditingProperty(property);
    setIsDialogOpen(true);
  };

  const handleView = (propertyId) => {
    navigate(`/admin/properties/${propertyId}`);
  };

  const handleSave = async (propertyData) => {
    try {
      if (editingProperty) {
        // Update
        const response = await axios.put(`${BACKEND_URL}/api/properties/${editingProperty.id}`, propertyData);
        if (response.data.success) {
          toast.success('Property updated successfully!');
          fetchData();
        }
      } else {
        // Create
        const response = await axios.post(`${BACKEND_URL}/api/properties`, propertyData);
        if (response.data.success) {
          toast.success('Property created successfully!');
          fetchData();
        }
      }
      setIsDialogOpen(false);
      setEditingProperty(null);
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error(error.response?.data?.detail || 'Failed to save property');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/properties/${id}`);
      if (response.data.success) {
        toast.success('Property deleted successfully!');
        fetchData();
      }
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete property');
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading properties...</p>
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
              {organisations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid View */}
        {filteredProperties.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-12 text-center">
            <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No properties found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => {
                const organisation = organisations.find(org => org.id === property.organisationId);
                return (
                  <div
                    key={property.id}
                    onClick={() => handleView(property.id)}
                    className="bg-white rounded-xl shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer section overflow-hidden"
                  >
                    {/* Header with Icon */}
                    <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6">
                      <div className="flex items-center justify-between">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <Home className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => handleEdit(property, e)}
                            className="w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Pencil className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(property.id);
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
                      <h3 className="text-xl font-bold text-slate-900 mb-2 section-hover:text-cyan-600 transition-colors">
                        {property.name}
                      </h3>
                      
                      {/* Organisation Badge */}
                      <div className="inline-flex items-center space-x-2 bg-teal-50 px-3 py-1 rounded-full mb-4">
                        <Building2 className="w-3 h-3 text-teal-600" />
                        <span className="text-xs font-medium text-teal-700">{organisation?.name || 'N/A'}</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-slate-600 break-all">{property.email}</p>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <Phone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-slate-600">{property.phone || 'N/A'}</p>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-slate-600 line-clamp-2">{property.address || 'N/A'}</p>
                        </div>
                      </div>

                      {/* View Details Link */}
                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between text-cyan-600 section-hover:text-cyan-700">
                          <span className="text-sm font-medium">View Details</span>
                          <Eye className="w-4 h-4 section-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="mt-6 text-sm text-slate-500">
              Showing {filteredProperties.length} of {properties.length} properties
            </div>
          </>
        )}
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