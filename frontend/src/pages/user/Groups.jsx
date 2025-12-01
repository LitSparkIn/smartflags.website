import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/user/UserLayout';
import { Button } from '../../components/ui/button';
import { Plus, UsersRound, Search, Pencil, Trash2, Armchair } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { GroupDialog } from '../../components/user/GroupDialog';
import axios from 'axios';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || window.location.origin;

export const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [seats, setSeats] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchSeats(parsedUser.entityId);
      fetchGroups(parsedUser.entityId);
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

  const fetchGroups = async (propertyId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/groups/${propertyId}`);
      if (response.data.success) {
        setGroups(response.data.groups);
        setFilteredGroups(response.data.groups);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: "Error",
        description: "Failed to fetch groups",
        variant: "destructive"
      });
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredGroups(groups);
    } else {
      const filtered = groups.filter(group => 
        group.name.toLowerCase().includes(term)
      );
      setFilteredGroups(filtered);
    }
  };

  const handleSave = async (data) => {
    try {
      if (selectedGroup) {
        // Update existing
        const response = await axios.put(
          `${BACKEND_URL}/api/groups/${selectedGroup.id}`,
          { name: data.name, seatIds: data.seatIds }
        );
        
        if (response.data.success) {
          toast({
            title: "Success",
            description: "Group updated successfully"
          });
          fetchGroups(user.entityId);
        }
      } else {
        // Create new
        const response = await axios.post(`${BACKEND_URL}/api/groups`, data);
        
        if (response.data.success) {
          toast({
            title: "Success",
            description: "Group created successfully"
          });
          fetchGroups(user.entityId);
        }
      }
      
      setIsDialogOpen(false);
      setSelectedGroup(null);
    } catch (error) {
      console.error('Error saving group:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save group",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (group) => {
    setSelectedGroup(group);
    setIsDialogOpen(true);
  };

  const handleDelete = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group?')) {
      return;
    }

    try {
      const response = await axios.delete(`${BACKEND_URL}/api/groups/${groupId}`);
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Group deleted successfully"
        });
        fetchGroups(user.entityId);
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive"
      });
    }
  };

  const handleAddNew = () => {
    setSelectedGroup(null);
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
            <h1 className="text-2xl font-bold text-slate-800">Groups</h1>
            <p className="text-slate-600 mt-1">Organize seats into manageable groups</p>
          </div>
          <Button 
            onClick={handleAddNew}
            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
            disabled={seats.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Group
          </Button>
        </div>

        {/* No Seats Warning */}
        {seats.length === 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              ⚠️ Please add seats before creating groups.
            </p>
          </div>
        )}

        {/* Search Bar */}
        {groups.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search groups..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        )}

        {/* Groups Grid or Empty State */}
        {filteredGroups.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UsersRound className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                {searchTerm ? 'No groups found' : 'No groups yet'}
              </h2>
              <p className="text-slate-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Create groups to organize seats by area, section, or any other criteria. Groups help in better crowd management.'}
              </p>
              {!searchTerm && seats.length > 0 && (
                <Button 
                  onClick={handleAddNew}
                  className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Group
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-slate-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                      <UsersRound className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{group.name}</h3>
                      <p className="text-sm text-slate-600">
                        {group.seatIds?.length || 0} seats
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(group)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(group.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Seat List Preview */}
                {group.seatIds && group.seatIds.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Armchair className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">Seats:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {group.seatIds.slice(0, 10).map((seatId) => (
                        <span
                          key={seatId}
                          className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded border border-orange-200"
                        >
                          {getSeatNumber(seatId)}
                        </span>
                      ))}
                      {group.seatIds.length > 10 && (
                        <span className="text-xs text-slate-500 px-2 py-1">
                          +{group.seatIds.length - 10} more
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
      <GroupDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedGroup(null);
        }}
        group={selectedGroup}
        onSave={handleSave}
        propertyId={user?.entityId}
        seats={seats}
      />
    </UserLayout>
  );
};
