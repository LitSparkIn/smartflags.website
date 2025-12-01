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
import { Armchair, AlertCircle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

export const SeatDialog = ({ open, onOpenChange, seat, onSave, propertyId, seatTypes, groups }) => {
  const [formData, setFormData] = useState({
    seatTypeId: '',
    groupId: '',
    prefix: '',
    suffix: '',
    startNumber: '',
    endNumber: '',
    seatNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [previewSeats, setPreviewSeats] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    if (seat) {
      // Edit mode
      setFormData({
        seatTypeId: seat.seatTypeId,
        groupId: seat.groupId || '',
        seatNumber: seat.seatNumber,
        prefix: '',
        suffix: '',
        startNumber: '',
        endNumber: ''
      });
      setPreviewSeats([]);
    } else {
      // Add mode
      setFormData({
        seatTypeId: '',
        groupId: '',
        prefix: '',
        suffix: '',
        startNumber: '',
        endNumber: '',
        seatNumber: ''
      });
      setPreviewSeats([]);
    }
  }, [seat, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Generate preview if in add mode
    if (!seat && name !== 'seatTypeId') {
      generatePreview({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, seatTypeId: value }));
  };

  const generatePreview = (data) => {
    const { prefix, suffix, startNumber, endNumber } = data;
    
    if (!startNumber || !endNumber) {
      setPreviewSeats([]);
      return;
    }

    const start = parseInt(startNumber);
    const end = parseInt(endNumber);

    if (isNaN(start) || isNaN(end) || start > end) {
      setPreviewSeats([]);
      return;
    }

    if (end - start > 20) {
      // Show only first 20 for preview
      const paddingLength = endNumber.length;
      const preview = [];
      for (let i = start; i < start + 20; i++) {
        const formatted = String(i).padStart(paddingLength, '0');
        preview.push(`${prefix}${formatted}${suffix}`);
      }
      preview.push(`... and ${end - start - 19} more`);
      setPreviewSeats(preview);
    } else {
      const paddingLength = endNumber.length;
      const preview = [];
      for (let i = start; i <= end; i++) {
        const formatted = String(i).padStart(paddingLength, '0');
        preview.push(`${prefix}${formatted}${suffix}`);
      }
      setPreviewSeats(preview);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.seatTypeId) {
      toast({
        title: "Validation Error",
        description: "Please select a seat type",
        variant: "destructive"
      });
      return;
    }

    if (seat) {
      // Edit mode - single seat
      if (!formData.seatNumber.trim()) {
        toast({
          title: "Validation Error",
          description: "Seat number is required",
          variant: "destructive"
        });
        return;
      }
    } else {
      // Add mode - bulk creation
      if (!formData.startNumber || !formData.endNumber) {
        toast({
          title: "Validation Error",
          description: "Start and End numbers are required",
          variant: "destructive"
        });
        return;
      }

      const start = parseInt(formData.startNumber);
      const end = parseInt(formData.endNumber);

      if (isNaN(start) || isNaN(end)) {
        toast({
          title: "Validation Error",
          description: "Start and End numbers must be valid numbers",
          variant: "destructive"
        });
        return;
      }

      if (start > end) {
        toast({
          title: "Validation Error",
          description: "Start number must be less than or equal to End number",
          variant: "destructive"
        });
        return;
      }

      if (end - start > 1000) {
        toast({
          title: "Too Many Seats",
          description: "Cannot create more than 1000 seats at once",
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);
    await onSave({ ...formData, propertyId });
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Armchair className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle>{seat ? 'Edit Seat' : 'Add Seats'}</DialogTitle>
              <DialogDescription>
                {seat ? 'Update seat details' : 'Create multiple seats at once'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Seat Type */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">
                Seat Type *
              </Label>
              <Select value={formData.seatTypeId} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select seat type" />
                </SelectTrigger>
                <SelectContent>
                  {seatTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center space-x-2">
                        <img src={type.icon} alt={type.name} className="w-5 h-5 object-contain" />
                        <span>{type.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {seat ? (
              // Edit mode - single seat number
              <div className="space-y-2">
                <Label htmlFor="seatNumber" className="text-slate-700 font-medium">
                  Seat Number *
                </Label>
                <Input
                  id="seatNumber"
                  name="seatNumber"
                  value={formData.seatNumber}
                  onChange={handleChange}
                  placeholder="e.g., A01, C15B"
                  required
                />
              </div>
            ) : (
              // Add mode - bulk creation fields
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prefix" className="text-slate-700 font-medium">
                      Prefix (Optional)
                    </Label>
                    <Input
                      id="prefix"
                      name="prefix"
                      value={formData.prefix}
                      onChange={handleChange}
                      placeholder="e.g., C, A, Pool"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="suffix" className="text-slate-700 font-medium">
                      Suffix (Optional)
                    </Label>
                    <Input
                      id="suffix"
                      name="suffix"
                      value={formData.suffix}
                      onChange={handleChange}
                      placeholder="e.g., Q, B, L"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startNumber" className="text-slate-700 font-medium">
                      Start Number *
                    </Label>
                    <Input
                      id="startNumber"
                      name="startNumber"
                      type="number"
                      value={formData.startNumber}
                      onChange={handleChange}
                      placeholder="e.g., 1, 001"
                      required
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endNumber" className="text-slate-700 font-medium">
                      End Number *
                    </Label>
                    <Input
                      id="endNumber"
                      name="endNumber"
                      type="number"
                      value={formData.endNumber}
                      onChange={handleChange}
                      placeholder="e.g., 10, 100"
                      required
                      min="0"
                    />
                  </div>
                </div>

                {/* Preview */}
                {previewSeats.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">
                      Preview ({previewSeats.length > 20 ? `First 20 of ${parseInt(formData.endNumber) - parseInt(formData.startNumber) + 1}` : previewSeats.length} seats)
                    </Label>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {previewSeats.map((seat, index) => (
                          <span
                            key={index}
                            className="bg-white border border-slate-300 px-3 py-1 rounded text-sm font-mono text-slate-700"
                          >
                            {seat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Numbers will be zero-padded based on the end number length. Example: If end number is 100, seats will be numbered as 001, 002, 003, etc.
                  </p>
                </div>
              </>
            )}
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
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {seat ? 'Updating...' : 'Creating...'}
                </>
              ) : seat ? (
                'Update'
              ) : (
                'Create Seats'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
