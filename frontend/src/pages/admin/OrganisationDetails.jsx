import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Calendar, Pencil, Home, UserPlus, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { getPropertiesByOrganisation } from '../../mockAdmin';
import { OrganisationDialog } from '../../components/admin/OrganisationDialog';
import { AdminLoginDialog } from '../../components/admin/AdminLoginDialog';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const OrganisationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAdminLoginDialogOpen, setIsAdminLoginDialogOpen] = useState(false);
  const [organisation, setOrganisation] = useState(null);
  const [properties, setProperties] = useState([]);
  const [admins, setAdmins] = useState([]);

  // Fetch admins for this organisation
  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/list/organisation/${id}`);
      if (response.data.success) {
        setAdmins(response.data.admins);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  // Get organisation and properties from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('smartflags_organisations');
      const organisations = stored ? JSON.parse(stored) : [];
      const foundOrg = organisations.find(org => org.id === id);
      setOrganisation(foundOrg);
      
      if (foundOrg) {
        const orgProperties = getPropertiesByOrganisation(id);
        setProperties(orgProperties);
        // Fetch admins for this organisation
        fetchAdmins();
      }
    } catch (error) {
      console.error('Error loading organisation:', error);
    }
  }, [id]);

  if (!organisation) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Organisation Not Found</h2>
            <p className="text-slate-600 mb-6">The organisation you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/admin/organisations')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Organisations
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const handleSave = (orgData) => {
    // Mock update - in real app, this would update the backend
    toast.success('Organisation updated successfully!');
    setIsEditDialogOpen(false);
  };

  const handleSendOTP = (adminData) => {
    // Mock OTP sending - in real app, this would call backend API
    toast.success(`OTP sent successfully to ${adminData.email}!`, {
      description: 'Admin login credentials have been emailed.'
    });
    setIsAdminLoginDialogOpen(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate('/admin/organisations')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Organisations
        </Button>

        {/* Organisation Header */}
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{organisation.name}</h1>
                <div className="flex items-center space-x-2 text-teal-50">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Created on {formatDate(organisation.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsAdminLoginDialogOpen(true)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Admin
              </Button>
              <Button
                onClick={() => setIsEditDialogOpen(true)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Organisation
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Email Address</p>
                    <p className="text-lg font-semibold text-slate-900">{organisation.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cyan-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Phone Number</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {organisation.phoneCountryCode && `+${organisation.phoneCountryCode} `}
                      {organisation.phone || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Address</p>
                    <p className="text-lg font-semibold text-slate-900">{organisation.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Total Properties</p>
                  <p className="text-3xl font-bold text-teal-600">{properties.length}</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Active Since</p>
                  <p className="text-lg font-bold text-cyan-600">{new Date(organisation.createdAt).getFullYear()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Properties</h2>
              <p className="text-slate-600">All properties under this organisation</p>
            </div>
            <Button
              onClick={() => navigate('/admin/properties')}
              className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
            >
              View All Properties
            </Button>
          </div>

          {properties.length === 0 ? (
            <div className="text-center py-12">
              <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No properties found for this organisation</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((property) => (
                <div
                  key={property.id}
                  onClick={() => navigate(`/admin/properties/${property.id}`)}
                  className="bg-slate-50 hover:bg-slate-100 rounded-lg p-4 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Home className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 group-hover:text-cyan-600 transition-colors">
                    {property.name}
                  </h3>
                  <p className="text-sm text-slate-600">{property.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admins Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Organisation Admins</h2>
              <p className="text-slate-600">Users who can manage this organisation</p>
            </div>
          </div>

          {admins.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">No admins added yet</p>
              <p className="text-sm text-slate-400">Click "Add Admin" button above to add your first admin</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-5 border border-teal-100"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserPlus className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 truncate">{admin.name}</h3>
                        <span className="bg-teal-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                          Org Admin
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 truncate">{admin.email}</p>
                      <p className="text-xs text-teal-600 mt-2">
                        Added {new Date(admin.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <OrganisationDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        organisation={organisation}
        onSave={handleSave}
      />

      {/* Admin Login Dialog */}
      <AdminLoginDialog
        open={isAdminLoginDialogOpen}
        onOpenChange={(open) => {
          setIsAdminLoginDialogOpen(open);
          // Refresh admins list when dialog closes
          if (!open) {
            fetchAdmins();
          }
        }}
        entityType="organisation"
        entityName={organisation.name}
        entityId={organisation.id}
      />
    </AdminLayout>
  );
};