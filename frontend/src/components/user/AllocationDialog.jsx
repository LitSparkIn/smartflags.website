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
import { MapPin, Users, Armchair, Calendar } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const AllocationDialog = ({ open, onOpenChange, onSave, propertyId, guests, staff, seats }) => {
  const [formData, setFormData] = useState({
    roomNumber: '',
    fbManagerId: '',
    seatIds: [],
    allocationDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [guestInfo, setGuestInfo] = useState(null);
  const [allocatedSeats, setAllocatedSeats] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setFormData({
        roomNumber: '',
        fbManagerId: '',
        seatIds: [],
        allocationDate: new Date().toISOString().split('T')[0]
      });
      setGuestInfo(null);
      setAllocatedSeats([]);
    } else {
      // Fetch allocated seats when dialog opens
      fetchAllocatedSeats(new Date().toISOString().split('T')[0]);
    }
  }, [open]);

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
      const seatIds = prev.seatIds.includes(seatId)
        ? prev.seatIds.filter(id => id !== seatId)
        : [...prev.seatIds, seatId];
      return { ...prev, seatIds };
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
    
    await onSave({
      propertyId,
      roomNumber: formData.roomNumber,
      fbManagerId: formData.fbManagerId,
      seatIds: formData.seatIds,
      allocationDate: formData.allocationDate
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
                  <p className="text-sm font-semibold text-green-900">{guestInfo.guestName}</p>
                  {guestInfo.category && (
                    <p className="text-xs text-green-700">Category: {guestInfo.category}</p>
                  )}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, allocationDate: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Seat Selection */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">
                Select Seats * ({formData.seatIds.length} selected)
              </Label>
              <div className="border border-slate-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                {seats.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No seats available</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {seats.map((seat) => (
                      <button
                        key={seat.id}
                        type="button"
                        onClick={() => handleSeatToggle(seat.id)}
                        className={`flex items-center justify-center space-x-1 px-3 py-2 rounded-lg border-2 transition-all ${
                          formData.seatIds.includes(seat.id)
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'bg-white border-slate-300 text-slate-700 hover:border-blue-300'
                        }`}
                      >
                        <Armchair className="w-4 h-4" />
                        <span className="text-sm font-semibold">{seat.seatNumber}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
