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
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Smartphone } from 'lucide-react';

export const AssignDeviceDialog = ({ open, onOpenChange, seat, devices, onAssign }) => {
  const [selectedDevice, setSelectedDevice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (seat && open) {
      setSelectedDevice(seat.staticDeviceId || '');
    }
  }, [seat, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onAssign(selectedDevice || null);
    setLoading(false);
  };

  const handleUnassign = async () => {
    setLoading(true);
    await onAssign(null);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle>Assign Device</DialogTitle>
              <DialogDescription>
                {seat && `Seat: ${seat.seatNumber}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {seat?.staticDeviceId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  Currently assigned: <strong>{devices.find(d => d.id === seat.staticDeviceId)?.deviceId || 'Unknown Device'}</strong>
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">
                Select Device
              </Label>
              {devices.length === 0 ? (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-800">
                    ⚠️ No devices available. Please add devices first.
                  </p>
                </div>
              ) : (
                <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a device" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">
                      <span className="text-slate-500">No device (unassign)</span>
                    </SelectItem>
                    {devices.map((device) => (
                      <SelectItem key={device.id} value={device.id}>
                        <div className="flex items-center space-x-2">
                          <Smartphone className="w-4 h-4" />
                          <span>{device.deviceId}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            {seat?.staticDeviceId && (
              <Button
                type="button"
                variant="outline"
                onClick={handleUnassign}
                disabled={loading}
                className="text-red-600 hover:text-red-700"
              >
                Unassign
              </Button>
            )}
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
              disabled={loading || devices.length === 0}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Assigning...
                </>
              ) : (
                'Assign Device'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
