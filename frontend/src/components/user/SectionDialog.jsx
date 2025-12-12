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
import { UsersRound, Check } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

export const GroupDialog = ({ open, onOpenChange, section, onSave, propertyId, seats }) => {
  const [formData, setFormData] = useState({
    name: '',
    seatIds: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (section) {
      setFormData({
        name: section.name,
        seatIds: section.seatIds || []
      });
    } else {
      setFormData({ name: '', seatIds: [] });
    }
    setSearchTerm('');
  }, [section, open]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleSeat = (seatId) => {
    setFormData(prev => ({
      ...prev,
      seatIds: prev.seatIds.includes(seatId)
        ? prev.seatIds.filter(id => id !== seatId)
        : [...prev.seatIds, seatId]
    }));
  };

  const selectAll = () => {
    const filteredSeats = getFilteredSeats();
    setFormData(prev => ({
      ...prev,
      seatIds: [...new Set([...prev.seatIds, ...filteredSeats.map(s => s.id)])]
    }));
  };

  const deselectAll = () => {
    const filteredSeats = getFilteredSeats();
    const filteredIds = filteredSeats.map(s => s.id);
    setFormData(prev => ({
      ...prev,
      seatIds: prev.seatIds.filter(id => !filteredIds.includes(id))
    }));
  };

  const getFilteredSeats = () => {
    if (!searchTerm) return seats;
    return seats.filter(seat => 
      seat.seatNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Group name is required",
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
    await onSave({ ...formData, propertyId });
    setLoading(false);
  };

  const filteredSeats = getFilteredSeats();
  const selectedCount = formData.seatIds.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
              <UsersRound className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle>{section ? 'Edit Group' : 'Add Group'}</DialogTitle>
              <DialogDescription>
                {section ? 'Update section details and seats' : 'Create a new section and assign seats'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="space-y-4 py-4 overflow-y-auto">
            {/* Group Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 font-medium">
                Group Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Pool Side, Beach Side, VIP Area"
                required
              />
            </div>

            {/* Seat Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-slate-700 font-medium">
                  Select Seats * ({selectedCount} selected)
                </Label>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={selectAll}
                    disabled={filteredSeats.length === 0}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={deselectAll}
                    disabled={selectedCount === 0}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>

              {/* Search */}
              <Input
                type="text"
                placeholder="Search seats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
              />

              {/* Seat Grid */}
              {seats.length === 0 ? (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-orange-800">
                    ⚠️ No seats available. Please add seats first.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {filteredSeats.map((seat) => {
                      const isSelected = formData.seatIds.includes(seat.id);
                      return (
                        <button
                          key={seat.id}
                          type="button"
                          onClick={() => toggleSeat(seat.id)}
                          className={`relative p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                            isSelected
                              ? 'bg-orange-500 border-orange-600 text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-orange-300'
                          }`}
                        >
                          {seat.seatNumber}
                          {isSelected && (
                            <Check className="w-4 h-4 absolute top-1 right-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {filteredSeats.length === 0 && searchTerm && (
                    <p className="text-center text-sm text-slate-500 py-4">
                      No seats found matching "{searchTerm}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4">
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
              disabled={loading || seats.length === 0}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : section ? (
                'Update'
              ) : (
                'Create Group'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
