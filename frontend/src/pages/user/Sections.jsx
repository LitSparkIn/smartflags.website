import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/user/UserLayout';
import { Button } from '../../components/ui/button';
import { Plus, UsersRound, Search, Pencil, Trash2, Armchair } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { SectionDialog } from '../../components/user/SectionDialog';
import axios from 'axios';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || window.location.origin;

export const Sections = () => {
  const [sections, setSections] = useState([]);
  const [seats, setSeats] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchSeats(parsedUser.entityId);
      fetchSections(parsedUser.entityId);
    }
  }, []);

  const fetchSeats = async (propertyId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/seats/${propertyId}`);
      if (response.data.success) {
        setSeats(response.data.seats);
      }
    } catch (error) {
      console.error('Error fetching seats:', error);
    }
  };

  const fetchSections = async (propertyId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/sections/${propertyId}`);
      if (response.data.success) {
        setSections(response.data.sections);
        setFilteredSections(response.data.sections);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sections",
        variant: "destructive"
      });
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredSections(sections);
    } else {
      const filtered = sections.filter(section => 
        section.name.toLowerCase().includes(term)
      );
      setFilteredSections(filtered);
    }
  };

  const handleSave = async (data) => {
    try {
      if (selectedSection) {
        // Update existing
        const response = await axios.put(
          `${BACKEND_URL}/api/sections/${selectedSection.id}`,
          { name: data.name, seatIds: data.seatIds }
        );
        
        if (response.data.success) {
          toast({
            title: "Success",
            description: "Section updated successfully"
          });
          fetchSections(user.entityId);
        }
      } else {
        // Create new
        const response = await axios.post(`${BACKEND_URL}/api/sections`, data);
        
        if (response.data.success) {
          toast({
            title: "Success",
            description: "Section created successfully"
          });
          fetchSections(user.entityId);
        }
      }
      
      setIsDialogOpen(false);
      setSelectedSection(null);
    } catch (error) {
      console.error('Error saving section:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save section",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (section) => {
    setSelectedSection(section);
    setIsDialogOpen(true);
  };

  const handleDelete = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section?')) {
      return;
    }

    try {
      const response = await axios.delete(`${BACKEND_URL}/api/sections/${sectionId}`);
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Section deleted successfully"
        });
        fetchSections(user.entityId);
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive"
      });
    }
  };

  const handleAddNew = () => {
    setSelectedSection(null);
    setIsDialogOpen(true);
  };

  const getSeatNumber = (seatId) => {
    const seat = seats.find(s => s.id === seatId);
    return seat ? seat.seatNumber : seatId;
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Sections</h1>
            <p className="text-slate-600 mt-1">Organize seats into manageable sections</p>
          </div>
          <Button 
            onClick={handleAddNew}
            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
            disabled={seats.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>

        {/* No Seats Warning */}
        {seats.length === 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              ⚠️ Please add seats before creating sections.
            </p>
          </div>
        )}

        {/* Search Bar */}
        {sections.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search sections..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        )}

        {/* Sections Grid or Empty State */}
        {filteredSections.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UsersRound className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                {searchTerm ? 'No sections found' : 'No sections yet'}
              </h2>
              <p className="text-slate-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Create sections to organize seats by area, section, or any other criteria. Sections help in better crowd management.'}
              </p>
              {!searchTerm && seats.length > 0 && (
                <Button 
                  onClick={handleAddNew}
                  className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Section
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSections.map((section) => (
              <div
                key={section.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-slate-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                      <UsersRound className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{section.name}</h3>
                      <p className="text-sm text-slate-600">
                        {section.seatIds?.length || 0} seats
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(section)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(section.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Seat List Preview */}
                {section.seatIds && section.seatIds.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Armchair className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">Seats:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {section.seatIds.slice(0, 10).map((seatId) => (
                        <span
                          key={seatId}
                          className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded border border-orange-200"
                        >
                          {getSeatNumber(seatId)}
                        </span>
                      ))}
                      {section.seatIds.length > 10 && (
                        <span className="text-xs text-slate-500 px-2 py-1">
                          +{section.seatIds.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog */}
      <SectionDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedSection(null);
        }}
        section={selectedSection}
        onSave={handleSave}
        propertyId={user?.entityId}
        seats={seats}
      />
    </UserLayout>
  );
};
