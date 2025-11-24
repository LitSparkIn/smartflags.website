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
import { Smartphone } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

export const DeviceDialog = ({ open, onOpenChange, onSave, propertyId }) => {
  const [deviceId, setDeviceId] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setDeviceId('');
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!deviceId.trim()) {
      toast({
        title: "Validation Error",
        description: "Device ID is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    await onSave({
      propertyId,
      deviceId: deviceId.trim()
    });
    
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
              <DialogTitle>Add Device</DialogTitle>
              <DialogDescription>
                Enter the device ID for waiter calling
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deviceId" className="text-slate-700 font-medium">
                Device ID *
              </Label>
              <Input
                id="deviceId"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                placeholder="e.g., DEV-001, DEVICE-A1"
                required
              />
              <p className="text-xs text-slate-500">
                Enter a unique identifier for this device
              </p>
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
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Adding...
                </>
              ) : (
                'Add Device'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
