import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/user/UserLayout';
import { Button } from '../../components/ui/button';
import { Plus, Armchair, Search, Pencil, Trash2, Filter, Smartphone, Ban, CheckCircle } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { SeatDialog } from '../../components/user/SeatDialog';
import { AssignDeviceDialog } from '../../components/user/AssignDeviceDialog';
import axios from 'axios';
import { useToast } from '../../hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || window.location.origin;

export const Seats = () => {
  const [seats, setSeats] = useState([]);
  const [seatTypes, setSeatTypes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [devices, setDevices] = useState([]);
  const [filteredSeats, setFilteredSeats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeatType, setFilterSeatType] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeviceDialogOpen, setIsDeviceDialogOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [seatForDevice, setSeatForDevice] = useState(null);
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchSeatTypes(parsedUser.entityId);
      fetchSeats(parsedUser.entityId);
      fetchDevices(parsedUser.entityId);
      fetchGroups(parsedUser.entityId);
    }
  }, []);

  const fetchSeatTypes = async (propertyId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/seat-types/${propertyId}`);
      if (response.data.success) {
        setSeatTypes(response.data.seatTypes);
      }
    } catch (error) {
      console.error('Error fetching seat types:', error);
    }
  };

  const fetchGroups = async (propertyId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/groups/${propertyId}`);
      if (response.data.success) {
        setGroups(response.data.groups);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchSeats = async (propertyId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/seats/${propertyId}`);
      if (response.data.success) {
        setSeats(response.data.seats);
        setFilteredSeats(response.data.seats);
      }
    } catch (error) {
      console.error('Error fetching seats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch seats",
        variant: "destructive"
      });
    }
  };

  const fetchDevices = async (propertyId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/devices/${propertyId}`);
      if (response.data.success) {
        setDevices(response.data.devices.filter(d => d.enabled)); // Only enabled devices
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const handleAssignDevice = (seat) => {
    setSeatForDevice(seat);
    setIsDeviceDialogOpen(true);
  };

  const handleDeviceAssignment = async (deviceId) => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/seats/${seatForDevice.id}`,
        { staticDeviceId: deviceId }
      );
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: deviceId ? "Device assigned successfully" : "Device unassigned successfully"
        });
        fetchSeats(user.entityId);
        setIsDeviceDialogOpen(false);
      }
    } catch (error) {
      console.error('Error assigning device:', error);
      toast({
        title: "Error",
        description: "Failed to assign device",
        variant: "destructive"
      });
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    filterSeats(term, filterSeatType);
  };

  const handleFilterChange = (value) => {
    setFilterSeatType(value);
    filterSeats(searchTerm, value);
  };

  const filterSeats = (search, seatTypeFilter) => {
    let filtered = seats;

    // Filter by seat type
    if (seatTypeFilter !== 'all') {
      filtered = filtered.filter(seat => seat.seatTypeId === seatTypeFilter);
    }

    // Filter by search term
    if (search) {
      filtered = filtered.filter(seat => 
        seat.seatNumber.toLowerCase().includes(search)
      );
    }

    setFilteredSeats(filtered);
  };

  const handleSave = async (data) => {
    try {
      if (selectedSeat) {
        // Update existing
        const response = await axios.put(
          `${BACKEND_URL}/api/seats/${selectedSeat.id}`,
          { seatTypeId: data.seatTypeId, seatNumber: data.seatNumber }
        );
        
        if (response.data.success) {
          toast({
            title: "Success",
            description: "Seat updated successfully"
          });
          fetchSeats(user.entityId);
        }
      } else {
        // Create bulk
        const response = await axios.post(`${BACKEND_URL}/api/seats/bulk`, {
          propertyId: data.propertyId,
          seatTypeId: data.seatTypeId,
          prefix: data.prefix || "",
          suffix: data.suffix || "",
          startNumber: parseInt(data.startNumber),
          endNumber: parseInt(data.endNumber)
        });
        
        if (response.data.success) {
          toast({
            title: "Success",
            description: response.data.message
          });
          fetchSeats(user.entityId);
        }
      }
      
      setIsDialogOpen(false);
      setSelectedSeat(null);
    } catch (error) {
      console.error('Error saving seat:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save seat",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (seat) => {
    setSelectedSeat(seat);
    setIsDialogOpen(true);
  };

  const handleDelete = async (seatId) => {
    if (!window.confirm('Are you sure you want to delete this seat?')) {
      return;
    }

    try {
      const response = await axios.delete(`${BACKEND_URL}/api/seats/${seatId}`);
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Seat deleted successfully"
        });
        fetchSeats(user.entityId);
      }
    } catch (error) {
      console.error('Error deleting seat:', error);
      toast({
        title: "Error",
        description: "Failed to delete seat",
        variant: "destructive"
      });
    }
  };

  const handleAddNew = () => {
    setSelectedSeat(null);
    setIsDialogOpen(true);
  };

  const handleToggleBlock = async (seat) => {
    try {
      const response = await axios.patch(`${BACKEND_URL}/api/seats/${seat.id}/toggle-block`);
      
      if (response.data.success) {
        const newStatus = response.data.status;
        toast({
          title: "Success",
          description: `Seat ${newStatus === 'Blocked' ? 'blocked' : 'unblocked'} successfully`
        });
        fetchSeats(user.entityId);
      }
    } catch (error) {
      console.error('Error toggling seat block:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to toggle seat block",
        variant: "destructive"
      });
    }
  };

  const getSeatTypeName = (seatTypeId) => {
    const type = seatTypes.find(t => t.id === seatTypeId);
    return type ? type.name : 'Unknown';
  };

  const getSeatTypeIcon = (seatTypeId) => {
    const type = seatTypes.find(t => t.id === seatTypeId);
    return type ? type.icon : null;
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Seats</h1>
            <p className="text-slate-600 mt-1">Manage individual seats across your property</p>
          </div>
          <Button 
            onClick={handleAddNew}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            disabled={seatTypes.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Seats
          </Button>
        </div>

        {/* No Seat Types Warning */}
        {seatTypes.length === 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              ⚠️ Please create at least one seat type before adding seats.
            </p>
          </div>
        )}

        {/* Search and Filter Bar */}
        {seats.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by seat number..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
                <Select value={filterSeatType} onValueChange={handleFilterChange}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Filter by seat type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Seat Types</SelectItem>
                    {seatTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {seats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-sm text-slate-600 mb-1">Total Seats</h3>
              <p className="text-3xl font-bold text-slate-900">{seats.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-sm text-slate-600 mb-1">Seat Types</h3>
              <p className="text-3xl font-bold text-slate-900">{seatTypes.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-sm text-slate-600 mb-1">Filtered Results</h3>
              <p className="text-3xl font-bold text-slate-900">{filteredSeats.length}</p>
            </div>
          </div>
        )}

        {/* Seats Grid or Empty State */}
        {filteredSeats.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Armchair className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                {searchTerm || filterSeatType !== 'all' ? 'No seats found' : 'No seats yet'}
              </h2>
              <p className="text-slate-600 mb-6">
                {searchTerm || filterSeatType !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Add individual seats to your property. Each seat can be assigned to a group and monitored for occupancy.'}
              </p>
              {!searchTerm && filterSeatType === 'all' && seatTypes.length > 0 && (
                <Button 
                  onClick={handleAddNew}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Seats
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {filteredSeats.map((seat) => (
                <div
                  key={seat.id}
                  className="group relative bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col items-center space-y-2">
                    {getSeatTypeIcon(seat.seatTypeId) && (
                      <img 
                        src={getSeatTypeIcon(seat.seatTypeId)} 
                        alt={getSeatTypeName(seat.seatTypeId)}
                        className={`w-8 h-8 object-contain ${seat.status === 'Blocked' ? 'opacity-40' : ''}`}
                      />
                    )}
                    <p className={`font-bold text-center text-sm ${seat.status === 'Blocked' ? 'text-red-600' : 'text-slate-900'}`}>
                      {seat.seatNumber}
                    </p>
                    <p className="text-xs text-slate-600 text-center">{getSeatTypeName(seat.seatTypeId)}</p>
                    {seat.status === 'Blocked' && (
                      <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-semibold">
                        <Ban className="w-3 h-3" />
                        <span>Blocked</span>
                      </div>
                    )}
                    {seat.staticDeviceId && (
                      <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        <Smartphone className="w-3 h-3" />
                        <span>{devices.find(d => d.id === seat.staticDeviceId)?.deviceId || 'Device'}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-slate-900/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2 p-2">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white"
                        onClick={() => handleAssignDevice(seat)}
                        title="Assign Device"
                      >
                        <Smartphone className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={seat.status === 'Blocked' ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}
                        onClick={() => handleToggleBlock(seat)}
                        title={seat.status === 'Blocked' ? 'Unblock Seat' : 'Block Seat'}
                      >
                        {seat.status === 'Blocked' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Ban className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white"
                        onClick={() => handleEdit(seat)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(seat.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <SeatDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedSeat(null);
        }}
        seat={selectedSeat}
        onSave={handleSave}
        propertyId={user?.entityId}
        seatTypes={seatTypes}
        groups={groups}
      />

      <AssignDeviceDialog
        open={isDeviceDialogOpen}
        onOpenChange={setIsDeviceDialogOpen}
        seat={seatForDevice}
        devices={devices}
        onAssign={handleDeviceAssignment}
      />
    </UserLayout>
  );
};
