import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ArrowLeft, Home, Mail, Phone, MapPin, Calendar, Pencil, Building2, UserPlus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { getOrganisationById } from '../../mockAdmin';
import { PropertyDialog } from '../../components/admin/PropertyDialog';
import { AdminLoginDialog } from '../../components/admin/AdminLoginDialog';
import { toast } from 'sonner';

export const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAdminLoginDialogOpen, setIsAdminLoginDialogOpen] = useState(false);
  const [property, setProperty] = useState(null);
  const [organisation, setOrganisation] = useState(null);

  // Get property and organisation from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('smartflags_properties');
      const properties = stored ? JSON.parse(stored) : [];
      const foundProperty = properties.find(prop => prop.id === id);
      setProperty(foundProperty);
      
      if (foundProperty) {
        const foundOrg = getOrganisationById(foundProperty.organisationId);
        setOrganisation(foundOrg);
      }
    } catch (error) {
      console.error('Error loading property:', error);
    }
  }, [id]);

  if (!property) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Property Not Found</h2>
            <p className="text-slate-600 mb-6">The property you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/admin/properties')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Properties
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const handleSave = (propertyData) => {
    // Mock update - in real app, this would update the backend
    toast.success('Property updated successfully!');
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
          onClick={() => navigate('/admin/properties')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Properties
        </Button>

        {/* Property Header */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Home className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{property.name}</h1>
                <div className="flex items-center space-x-2 text-cyan-50">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Created on {formatDate(property.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsAdminLoginDialogOpen(true)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create Admin Login
              </Button>
              <Button
                onClick={() => setIsEditDialogOpen(true)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Property
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cyan-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Email Address</p>
                    <p className="text-lg font-semibold text-slate-900">{property.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Phone Number</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {property.phoneCountryCode && `+${property.phoneCountryCode} `}
                      {property.phone || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Address</p>
                    <p className="text-lg font-semibold text-slate-900">{property.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Organisation Info */}
            {organisation && (
              <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Parent Organisation</h2>
                
                <div
                  onClick={() => navigate(`/admin/organisations/${organisation.id}`)}
                  className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 cursor-pointer hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-teal-600 transition-colors">
                        {organisation.name}
                      </h3>
                      <p className="text-sm text-slate-600">{organisation.email}</p>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-teal-600 transform rotate-180 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats & Quick Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Info</h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Active Since</p>
                  <p className="text-lg font-bold text-cyan-600">{new Date(property.createdAt).getFullYear()}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Property ID</p>
                  <p className="text-sm font-mono font-bold text-blue-600">{property.id}</p>
                </div>
              </div>
            </div>

            {/* Additional Stats Card */}
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Property Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-cyan-50">Status</span>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-cyan-50">Devices</span>
                  <span className="text-2xl font-bold">25</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-cyan-50">Daily Calls</span>
                  <span className="text-2xl font-bold">127</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <PropertyDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        property={property}
        onSave={handleSave}
      />

      {/* Admin Login Dialog */}
      <AdminLoginDialog
        open={isAdminLoginDialogOpen}
        onOpenChange={setIsAdminLoginDialogOpen}
        entityType="property"
        entityName={property.name}
        entityId={property.id}
      />
    </AdminLayout>
  );
};