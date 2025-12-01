import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { MapPin, Users, Armchair, Calendar, Smartphone } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const AllocationDialog = ({ open, onOpenChange, onSave, propertyId, guests, staff, seats }) => {
  const [formData, setFormData] = useState({
    roomNumber: '',
    fbManagerId: '',
    seatIds: [],
    deviceIds: []
  });
  const [loading, setLoading] = useState(false);
  const [guestInfo, setGuestInfo] = useState(null);
  const [allocatedSeats, setAllocatedSeats] = useState([]);
  const [allocatedDevices, setAllocatedDevices] = useState([]);
  const [seatTypes, setSeatTypes] = useState([]);
  const [devices, setDevices] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setFormData({
        roomNumber: '',
        fbManagerId: '',
        seatIds: [],
        deviceIds: []
      });
      setGuestInfo(null);
      setAllocatedSeats([]);
      setAllocatedDevices([]);
    } else {
      // Fetch allocated seats/devices, seat types, and devices when dialog opens
      // Use current date for real-time allocation
      const currentDate = new Date().toISOString().split('T')[0];
      fetchAllocatedSeats(currentDate);
      fetchAllocatedDevices(currentDate);
      fetchSeatTypes();
      fetchDevices();
    }
  }, [open]);

  const fetchSeatTypes = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/seat-types/${propertyId}`);
      if (response.data.success) {
        setSeatTypes(response.data.seatTypes);
      }
    } catch (error) {
      console.error('Error fetching seat types:', error);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/devices/${propertyId}`);
      if (response.data.success) {
        setDevices(response.data.devices.filter(d => d.enabled)); // Only enabled devices
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const fetchAllocatedSeats = async (date) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/allocations/${propertyId}/allocated-seats?date=${date}`
      );
      if (response.data.success) {
        setAllocatedSeats(response.data.allocatedSeatIds);
      }
    } catch (error) {
      console.error('Error fetching allocated seats:', error);
    }
  };

  const fetchAllocatedDevices = async (date) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/allocations/${propertyId}/allocated-devices?date=${date}`
      );
      if (response.data.success) {
        setAllocatedDevices(response.data.allocatedDeviceIds);
      }
    } catch (error) {
      console.error('Error fetching allocated devices:', error);
    }
  };

  const handleRoomNumberChange = (e) => {
    const roomNum = e.target.value;
    setFormData(prev => ({ ...prev, roomNumber: roomNum }));

    // Find guest by room number
    const guest = guests.find(g => g.roomNumber === roomNum);
    if (guest) {
      setGuestInfo(guest);
    } else {
      setGuestInfo(null);
    }
  };

  const handleManagerChange = (value) => {
    setFormData(prev => ({ ...prev, fbManagerId: value }));
  };

  const handleSeatToggle = (seatId) => {
    setFormData(prev => {
      const isRemoving = prev.seatIds.includes(seatId);
      const seatIds = isRemoving
        ? prev.seatIds.filter(id => id !== seatId)
        : [...prev.seatIds, seatId];
      
      // Auto-add/remove device IDs from selected seats
      const seat = seats.find(s => s.id === seatId);
      let deviceIds = [...prev.deviceIds];
      
      if (seat && seat.staticDeviceId) {
        if (isRemoving) {
          // Remove device if no other selected seat uses it
          const otherSeatsWithDevice = seatIds
            .filter(id => id !== seatId)
            .some(id => {
              const s = seats.find(seat => seat.id === id);
              return s && s.staticDeviceId === seat.staticDeviceId;
            });
          
          if (!otherSeatsWithDevice) {
            deviceIds = deviceIds.filter(id => id !== seat.staticDeviceId);
          }
        } else {
          // Add device if not already in list
          if (!deviceIds.includes(seat.staticDeviceId)) {
            deviceIds = [...deviceIds, seat.staticDeviceId];
          }
        }
      }
      
      return { ...prev, seatIds, deviceIds };
    });
  };

  const handleDeviceToggle = (deviceId) => {
    setFormData(prev => {
      const deviceIds = prev.deviceIds.includes(deviceId)
        ? prev.deviceIds.filter(id => id !== deviceId)
        : [...prev.deviceIds, deviceId];
      return { ...prev, deviceIds };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.roomNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Room number is required",
        variant: "destructive"
      });
      return;
    }

    if (!guestInfo) {
      toast({
        title: "Validation Error",
        description: `No guest found in room number ${formData.roomNumber}`,
        variant: "destructive"
      });
      return;
    }

    if (!formData.fbManagerId) {
      toast({
        title: "Validation Error",
        description: "Please select a Food & Beverage Manager",
        variant: "destructive"
      });
      return;
    }

    if (formData.seatIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one seat",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Use current date/time for real-time allocation
    const currentDate = new Date().toISOString().split('T')[0];
    
    await onSave({
      propertyId,
      roomNumber: formData.roomNumber,
      fbManagerId: formData.fbManagerId,
      seatIds: formData.seatIds,
      deviceIds: formData.deviceIds,
      allocationDate: currentDate
    });
    
    setLoading(false);
  };

  // Filter staff to only show F&B managers (you can adjust role filtering as needed)
  const fbManagers = staff;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle>Add Allocation</DialogTitle>
              <DialogDescription>
                Assign seats to a guest with F&B Manager
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Room Number */}
            <div className="space-y-2">
              <Label htmlFor="roomNumber" className="text-slate-700 font-medium">
                Room Number *
              </Label>
              <Input
                id="roomNumber"
                value={formData.roomNumber}
                onChange={handleRoomNumberChange}
                placeholder="Enter room number"
                required
              />
              {guestInfo && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-green-900">{guestInfo.guestName}</p>
                    {guestInfo.category && (
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                        {guestInfo.category}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {formData.roomNumber && !guestInfo && (
                <p className="text-sm text-red-600">⚠️ No guest found in room {formData.roomNumber}</p>
              )}
            </div>

            {/* F&B Manager */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">
                Food & Beverage Manager *
              </Label>
              <Select value={formData.fbManagerId} onValueChange={handleManagerChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select F&B Manager" />
                </SelectTrigger>
                <SelectContent>
                  {fbManagers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{manager.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Allocation Date */}
            <div className="space-y-2">
              <Label htmlFor="allocationDate" className="text-slate-700 font-medium">
                Allocation Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="allocationDate"
                  type="date"
                  value={formData.allocationDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setFormData(prev => ({ ...prev, allocationDate: newDate }));
                    fetchAllocatedSeats(newDate);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Seat Selection */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">
                Select Seats * ({formData.seatIds.length} selected)
              </Label>
              {allocatedSeats.length > 0 && (
                <p className="text-xs text-orange-600">
                  ⚠️ {allocatedSeats.length} seats already allocated for {formData.allocationDate}
                </p>
              )}
              <div className="border border-slate-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                {seats.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No seats available</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {seats.map((seat) => {
                      const isAllocated = allocatedSeats.includes(seat.id);
                      const isSelected = formData.seatIds.includes(seat.id);
                      const seatType = seatTypes.find(st => st.id === seat.seatTypeId);
                      
                      return (
                        <button
                          key={seat.id}
                          type="button"
                          onClick={() => !isAllocated && handleSeatToggle(seat.id)}
                          disabled={isAllocated}
                          className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all min-h-[80px] ${
                            isSelected
                              ? 'bg-blue-500 border-blue-500 text-white'
                              : isAllocated
                              ? 'bg-red-100 border-red-300 text-red-400 cursor-not-allowed'
                              : 'bg-white border-slate-300 text-slate-700 hover:border-blue-300'
                          }`}
                        >
                          {seatType && seatType.icon ? (
                            <img 
                              src={seatType.icon} 
                              alt={seatType.name}
                              className={`w-8 h-8 object-contain mb-1 ${
                                isSelected ? 'brightness-0 invert' : isAllocated ? 'opacity-50' : ''
                              }`}
                            />
                          ) : (
                            <Armchair className="w-6 h-6 mb-1" />
                          )}
                          <span className="text-xs font-semibold">{seat.seatNumber}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                  <span>Already Allocated</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-white border border-slate-300 rounded"></div>
                  <span>Available</span>
                </div>
              </div>
            </div>

            {/* Device Selection */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">
                Assign Devices ({formData.deviceIds.length} selected)
              </Label>
              <p className="text-xs text-slate-500">
                Devices auto-selected from seats. You can add more or remove them.
              </p>
              {devices.length === 0 ? (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-800">
                    ⚠️ No devices available. Add devices first to assign them.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {devices.map((device) => {
                      const isSelected = formData.deviceIds.includes(device.id);
                      const isAutoSelected = formData.seatIds.some(seatId => {
                        const seat = seats.find(s => s.id === seatId);
                        return seat && seat.staticDeviceId === device.id;
                      });
                      
                      return (
                        <label
                          key={device.id}
                          className={`flex items-center space-x-3 p-2 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500'
                              : 'bg-white border-slate-300 hover:border-blue-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleDeviceToggle(device.id)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <Smartphone className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                          <div className="flex-1">
                            <span className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                              {device.deviceId}
                            </span>
                            {isAutoSelected && (
                              <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                Auto
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !guestInfo}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Allocation'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
