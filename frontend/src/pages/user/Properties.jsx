import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/user/UserLayout';
import { Button } from '../../components/ui/button';
import { Plus, Building2, Search, MapPin, Mail, Phone } from 'lucide-react';
import { Input } from '../../components/ui/input';

export const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Get properties for this organisation
      if (parsedUser.entityType === 'organisation') {
        const storedProperties = localStorage.getItem('smartflags_properties');
        const allProperties = storedProperties ? JSON.parse(storedProperties) : [];
        const orgProperties = allProperties.filter(prop => prop.organisationId === parsedUser.entityId);
        setProperties(orgProperties);
        setFilteredProperties(orgProperties);
      }
    }
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredProperties(properties);
    } else {
      const filtered = properties.filter(prop => 
        prop.name.toLowerCase().includes(term) ||
        prop.email.toLowerCase().includes(term) ||
        prop.address.toLowerCase().includes(term)
      );
      setFilteredProperties(filtered);
    }
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Properties</h1>
            <p className="text-slate-600 mt-1">Manage and monitor all your properties</p>
          </div>
          <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>

        {/* Search Bar */}
        {properties.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search properties..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        )}

        {/* Properties List or Empty State */}
        {filteredProperties.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                {searchTerm ? 'No properties found' : 'No properties yet'}
              </h2>
              <p className="text-slate-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Get started by adding your first property. You\'ll be able to manage staff, seats, and monitor crowd levels.'}
              </p>
              {!searchTerm && (
                <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Property
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-slate-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-3">{property.name}</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail className="w-4 h-4 mr-2 text-slate-400" />
                    <span className="truncate">{property.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Phone className="w-4 h-4 mr-2 text-slate-400" />
                    <span>{property.phone}</span>
                  </div>
                  <div className="flex items-start text-sm text-slate-600">
                    <MapPin className="w-4 h-4 mr-2 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{property.address}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <Button 
                    variant="outline" 
                    className="w-full"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
};
