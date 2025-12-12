import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/user/UserLayout';
import { Button } from '../../components/ui/button';
import { Plus, MapPin, Search, Trash2, Calendar, Activity, Armchair, Eye } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { AllocationDialog } from '../../components/user/AllocationDialog';
import { AllocationStatusDialog } from '../../components/user/AllocationStatusDialog';
import axios from 'axios';
import { useToast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const Allocation = () => {
  const [allocations, setAllocations] = useState([]);
  const [filteredAllocations, setFilteredAllocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllAllocations, setShowAllAllocations] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [user, setUser] = useState(null);
  const [guests, setGuests] = useState([]);
  const [staff, setStaff] = useState([]);
  const [seats, setSeats] = useState([]);
  const [seatTypes, setSeatTypes] = useState([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchAllData(parsedUser.entityId);
    }
  }, []);

  const fetchAllData = async (propertyId) => {
    try {
      // Fetch allocations
      const allocResponse = await axios.get(`${BACKEND_URL}/api/allocations/${propertyId}`);
      if (allocResponse.data.success) {
        setAllocations(allocResponse.data.allocations);
        setFilteredAllocations(allocResponse.data.allocations);
      }

      // Fetch guests
      const guestResponse = await axios.get(`${BACKEND_URL}/api/guests/${propertyId}`);
      if (guestResponse.data.success) {
        setGuests(guestResponse.data.guests);
      }

      // Fetch staff
      const staffResponse = await axios.get(`${BACKEND_URL}/api/staff/${propertyId}`);
      if (staffResponse.data.success) {
        setStaff(staffResponse.data.staff);
      }

      // Fetch seats
      const seatsResponse = await axios.get(`${BACKEND_URL}/api/seats/${propertyId}`);
      if (seatsResponse.data.success) {
        setSeats(seatsResponse.data.seats);
      }

      // Fetch seat types
      const seatTypesResponse = await axios.get(`${BACKEND_URL}/api/seat-types/${propertyId}`);
      if (seatTypesResponse.data.success) {
        setSeatTypes(seatTypesResponse.data.seatTypes);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Filter allocations based on toggle and search
  useEffect(() => {
    applyFilters();
  }, [allocations, showAllAllocations, searchTerm]);

  const applyFilters = () => {
    let filtered = [...allocations];

    // Filter by completion status
    if (!showAllAllocations) {
      filtered = filtered.filter(allocation => allocation.status !== 'Complete');
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(allocation => 
        allocation.guestName.toLowerCase().includes(term) ||
        allocation.roomNumber.toLowerCase().includes(term)
      );
    }

    setFilteredAllocations(filtered);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSave = async (data) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/allocations`, data);
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Allocation created successfully"
        });
        fetchAllData(user.entityId);
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving allocation:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create allocation",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (allocationId) => {
    if (!window.confirm('Are you sure you want to delete this allocation? This will free up the allocated seats.')) {
      return;
    }

    try {
      const response = await axios.delete(`${BACKEND_URL}/api/allocations/${allocationId}`);
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Allocation deleted successfully"
        });
        fetchAllData(user.entityId);
      }
    } catch (error) {
      console.error('Error deleting allocation:', error);
      toast({
        title: "Error",
        description: "Failed to delete allocation",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = (allocation) => {
    setSelectedAllocation(allocation);
    setIsStatusDialogOpen(true);
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await axios.patch(
        `${BACKEND_URL}/api/allocations/${selectedAllocation.id}/status`,
        { status: newStatus }
      );
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: `Status updated to ${newStatus}`
        });
        fetchAllData(user.entityId);
        setIsStatusDialogOpen(false);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const handleSetCalling = async (allocationId) => {
    try {
      const response = await axios.patch(
        `${BACKEND_URL}/api/allocations/${allocationId}/calling-flag`,
        { callingFlag: "Calling" }
      );
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Calling flag set - Guest needs service"
        });
        fetchAllData(user.entityId);
      }
    } catch (error) {
      console.error('Error setting calling flag:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to set calling flag",
        variant: "destructive"
      });
    }
  };

  const handleSetCallingForCheckout = async (allocationId) => {
    try {
      // First, set the calling flag
      const flagResponse = await axios.patch(
        `${BACKEND_URL}/api/allocations/${allocationId}/calling-flag`,
        { callingFlag: "Calling for Checkout" }
      );
      
      if (flagResponse.data.success) {
        // Then, automatically update status to Billing
        await axios.patch(
          `${BACKEND_URL}/api/allocations/${allocationId}/status`,
          { status: "Billing" }
        );
        
        toast({
          title: "Success",
          description: "Calling for Checkout set - Status changed to Billing"
        });
        fetchAllData(user.entityId);
      }
    } catch (error) {
      console.error('Error setting calling for checkout flag:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to set calling for checkout flag",
        variant: "destructive"
      });
    }
  };

  const handleClearCalling = async (allocationId) => {
    try {
      const response = await axios.patch(
        `${BACKEND_URL}/api/allocations/${allocationId}/calling-flag`,
        { callingFlag: "Non Calling" }
      );
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Calling flag cleared"
        });
        fetchAllData(user.entityId);
      }
    } catch (error) {
      console.error('Error clearing calling flag:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to clear calling flag",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Allocated': 'bg-blue-500',
      'Active': 'bg-green-500',
      'Billing': 'bg-purple-500',
      'Clear': 'bg-teal-500',
      'Complete': 'bg-[#006400]'
    };
    return colors[status] || 'bg-blue-500';
  };

  const getStaffName = (staffId) => {
    const staffMember = staff.find(s => s.id === staffId);
    return staffMember ? staffMember.name : 'Unknown';
  };

  const getSeatNumbers = (seatIds) => {
    return seatIds.map(seatId => {
      const seat = seats.find(s => s.id === seatId);
      return seat ? seat.seatNumber : seatId;
    }).join(', ');
  };

  const getSeatTypeIcons = (seatIds) => {
    // Get unique seat types from the allocated seats
    const seatTypeIds = new Set();
    seatIds.forEach(seatId => {
      const seat = seats.find(s => s.id === seatId);
      if (seat) {
        seatTypeIds.add(seat.seatTypeId);
      }
    });

    // Return array of seat type objects with icons
    return Array.from(seatTypeIds).map(typeId => {
      const seatType = seatTypes.find(st => st.id === typeId);
      return seatType;
    }).filter(Boolean);
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Seat Allocation</h1>
            <p className="text-slate-600 mt-1">Assign seats to guests with F&B Manager</p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            disabled={guests.length === 0 || staff.length === 0 || seats.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Allocation
          </Button>
        </div>

        {/* Warning Cards */}
        {guests.length === 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              ⚠️ Please add guests in Daily Guest List before creating allocations.
            </p>
          </div>
        )}
        
        {staff.length === 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              ⚠️ Please add staff members before creating allocations.
            </p>
          </div>
        )}

        {seats.length === 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              ⚠️ Please create seats before creating allocations.
            </p>
          </div>
        )}

        {/* Search Bar & Toggle */}
        {allocations.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by guest name or room number..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAllAllocations}
                    onChange={(e) => setShowAllAllocations(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                    Show All Allocations
                  </span>
                </label>
              </div>
            </div>
            {!showAllAllocations && (
              <p className="text-xs text-slate-500 mt-2">
                Showing only active allocations. Toggle to see completed ones.
              </p>
            )}
          </div>
        )}

        {/* Allocations List */}
        {filteredAllocations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                {searchTerm ? 'No allocations found' : 'No allocations yet'}
              </h2>
              <p className="text-slate-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Create your first seat allocation to assign seats to guests.'}
              </p>
              {!searchTerm && guests.length > 0 && staff.length > 0 && seats.length > 0 && (
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Allocation
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAllocations.map((allocation) => (
              <div
                key={allocation.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-slate-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    {/* Seat Type Icons */}
                    <div className="flex items-center">
                      {getSeatTypeIcons(allocation.seatIds).slice(0, 2).map((seatType, idx) => (
                        <div
                          key={seatType.id}
                          className="w-12 h-12 bg-white border-2 border-slate-200 rounded-lg flex items-center justify-center overflow-hidden"
                          style={{ marginLeft: idx > 0 ? '-8px' : '0', zIndex: getSeatTypeIcons(allocation.seatIds).length - idx }}
                        >
                          {seatType.icon ? (
                            <img 
                              src={seatType.icon} 
                              alt={seatType.name}
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <Armchair className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                      ))}
                      {getSeatTypeIcons(allocation.seatIds).length > 2 && (
                        <div
                          className="w-12 h-12 bg-slate-100 border-2 border-slate-200 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600"
                          style={{ marginLeft: '-8px', zIndex: 0 }}
                        >
                          +{getSeatTypeIcons(allocation.seatIds).length - 2}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900 truncate">{allocation.guestName}</h3>
                        {allocation.guestCategory && (
                          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0">
                            {allocation.guestCategory}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">Room {allocation.roomNumber}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                    onClick={() => handleDelete(allocation.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Status Badge */}
                <div className="mb-4">
                  <button
                    onClick={() => handleStatusChange(allocation)}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors section"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(allocation.status)}`}></div>
                      <span className="text-sm font-semibold text-slate-700">{allocation.status}</span>
                    </div>
                    <Activity className="w-4 h-4 text-slate-400 section-hover:text-slate-600" />
                  </button>
                </div>

                {/* Calling Buttons */}
                <div className="mb-4 space-y-2">
                  {allocation.callingFlag === "Non Calling" ? (
                    <>
                      <Button
                        size="sm"
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => handleSetCalling(allocation.id)}
                      >
                        🔔 Set Calling
                      </Button>
                      <Button
                        size="sm"
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                        onClick={() => handleSetCallingForCheckout(allocation.id)}
                      >
                        💳 Set Calling for Checkout
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <div className={`w-full p-3 rounded-lg border-2 flex items-center justify-center gap-2 ${
                        allocation.callingFlag === "Calling" 
                          ? "bg-orange-100 border-orange-500 text-orange-700" 
                          : "bg-purple-100 border-purple-500 text-purple-700"
                      }`}>
                        <span className="text-sm font-bold">
                          {allocation.callingFlag === "Calling" ? "🔔 Calling" : "💳 Calling for Checkout"}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleClearCalling(allocation.id)}
                      >
                        Clear Calling
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">F&B Manager</p>
                    <p className="text-sm font-semibold text-slate-900">{getStaffName(allocation.fbManagerId)}</p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 mb-1">Allocated Seats</p>
                    <p className="text-sm font-semibold text-blue-900">{getSeatNumbers(allocation.seatIds)}</p>
                  </div>

                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                    <span>{allocation.allocationDate}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Created {new Date(allocation.createdAt).toLocaleDateString()}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => navigate(`/user/allocation/${allocation.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AllocationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
        propertyId={user?.entityId}
        guests={guests}
        staff={staff}
        seats={seats}
      />

      <AllocationStatusDialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        allocation={selectedAllocation}
        onSave={handleStatusUpdate}
      />
    </UserLayout>
  );
};
