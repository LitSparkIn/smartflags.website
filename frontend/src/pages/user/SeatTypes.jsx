import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/user/UserLayout';
import { Button } from '../../components/ui/button';
import { Plus, Grid3x3, Search, Pencil, Trash2 } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { SeatTypeDialog } from '../../components/user/SeatTypeDialog';
import axios from 'axios';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const SeatTypes = () => {
  const [seatTypes, setSeatTypes] = useState([]);
  const [filteredSeatTypes, setFilteredSeatTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSeatType, setSelectedSeatType] = useState(null);
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchSeatTypes(parsedUser.entityId);
    }
  }, []);

  const fetchSeatTypes = async (propertyId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/seat-types/${propertyId}`);
      if (response.data.success) {
        setSeatTypes(response.data.seatTypes);
        setFilteredSeatTypes(response.data.seatTypes);
      }
    } catch (error) {
      console.error('Error fetching seat types:', error);
      toast({
        title: "Error",
        description: "Failed to fetch seat types",
        variant: "destructive"
      });
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredSeatTypes(seatTypes);
    } else {
      const filtered = seatTypes.filter(type => 
        type.name.toLowerCase().includes(term)
      );
      setFilteredSeatTypes(filtered);
    }
  };

  const handleSave = async (data) => {
    try {
      if (selectedSeatType) {
        // Update existing
        const response = await axios.put(
          `${BACKEND_URL}/api/seat-types/${selectedSeatType.id}`,
          { name: data.name, icon: data.icon }
        );
        
        if (response.data.success) {
          toast({
            title: "Success",
            description: "Seat type updated successfully"
          });
          fetchSeatTypes(user.entityId);
        }
      } else {
        // Create new
        const response = await axios.post(`${BACKEND_URL}/api/seat-types`, data);
        
        if (response.data) {
          toast({
            title: "Success",
            description: "Seat type created successfully"
          });
          fetchSeatTypes(user.entityId);
        }
      }
      
      setIsDialogOpen(false);
      setSelectedSeatType(null);
    } catch (error) {
      console.error('Error saving seat type:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save seat type",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (seatType) => {
    setSelectedSeatType(seatType);
    setIsDialogOpen(true);
  };

  const handleDelete = async (seatTypeId) => {
    if (!window.confirm('Are you sure you want to delete this seat type?')) {
      return;
    }

    try {
      const response = await axios.delete(`${BACKEND_URL}/api/seat-types/${seatTypeId}`);
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Seat type deleted successfully"
        });
        fetchSeatTypes(user.entityId);
      }
    } catch (error) {
      console.error('Error deleting seat type:', error);
      toast({
        title: "Error",
        description: "Failed to delete seat type",
        variant: "destructive"
      });
    }
  };

  const handleAddNew = () => {
    setSelectedSeatType(null);
    setIsDialogOpen(true);
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Seat Types</h1>
            <p className="text-slate-600 mt-1">Define different types of seats for your property</p>
          </div>
          <Button 
            onClick={handleAddNew}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Seat Type
          </Button>
        </div>

        {/* Search Bar */}
        {seatTypes.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search seat types..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        )}

        {/* Seat Types Grid or Empty State */}
        {filteredSeatTypes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Grid3x3 className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                {searchTerm ? 'No seat types found' : 'No seat types yet'}
              </h2>
              <p className="text-slate-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Create seat types like "Lounge Chair", "Cabana", "Beach Bed", etc. to categorize your seating arrangements.'}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={handleAddNew}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Seat Type
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSeatTypes.map((seatType) => (
              <div
                key={seatType.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-slate-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center border border-green-200 p-2">
                    <img 
                      src={seatType.icon} 
                      alt={seatType.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(seatType)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(seatType.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2">{seatType.name}</h3>
                <p className="text-xs text-slate-500">
                  Created {new Date(seatType.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog */}
      <SeatTypeDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedSeatType(null);
        }}
        seatType={selectedSeatType}
        onSave={handleSave}
        propertyId={user?.entityId}
      />
    </UserLayout>
  );
};
