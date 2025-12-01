import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Activity } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const STATUS_OPTIONS = [
  { value: 'Allocated', label: 'Allocated', color: 'bg-blue-500', description: 'Seats assigned to guest' },
  { value: 'Active', label: 'Active', color: 'bg-green-500', description: 'Guest is using seats' },
  { value: 'Billing', label: 'Billing', color: 'bg-purple-500', description: 'Processing checkout' },
  { value: 'Clear', label: 'Clear', color: 'bg-teal-500', description: 'Cleaning in progress' },
  { value: 'Complete', label: 'Complete', color: 'bg-[#006400]', description: 'Fully completed' }
];

export const AllocationStatusDialog = ({ open, onOpenChange, allocation, onSave }) => {
  const [selectedStatus, setSelectedStatus] = useState(allocation?.status || 'Allocated');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (allocation) {
      setSelectedStatus(allocation.status);
    }
  }, [allocation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedStatus === allocation.status) {
      toast({
        title: "No Change",
        description: "Status is already set to " + selectedStatus
      });
      return;
    }

    setLoading(true);
    await onSave(selectedStatus);
    setLoading(false);
  };

  const getStatusColor = (status) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);
    return option ? option.color : 'bg-gray-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle>Update Allocation Status</DialogTitle>
              <DialogDescription>
                {allocation?.guestName} - Room {allocation?.roomNumber}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Current Status */}
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-2">Current Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(allocation?.status)}`}></div>
                <span className="font-semibold text-slate-900">{allocation?.status}</span>
              </div>
            </div>

            {/* New Status Selection */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">New Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${option.color}`}></div>
                        <div>
                          <p className="font-semibold">{option.label}</p>
                          <p className="text-xs text-slate-500">{option.description}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Info message */}
            {selectedStatus === 'Complete' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  ℹ️ Setting status to Complete will free up the allocated seats
                </p>
              </div>
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
              disabled={loading || selectedStatus === allocation?.status}
              className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
