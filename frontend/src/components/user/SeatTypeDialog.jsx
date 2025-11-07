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
import { Grid3x3, Upload, X } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

export const SeatTypeDialog = ({ open, onOpenChange, seatType, onSave, propertyId }) => {
  const [formData, setFormData] = useState({
    name: '',
    icon: ''
  });
  const [iconPreview, setIconPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (seatType) {
      setFormData({
        name: seatType.name,
        icon: seatType.icon
      });
      setIconPreview(seatType.icon);
    } else {
      setFormData({ name: '', icon: '' });
      setIconPreview('');
    }
  }, [seatType, open]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/png')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PNG image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      toast({
        title: "File Too Large",
        description: "PNG file should be less than 500KB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target.result;
      setFormData({ ...formData, icon: base64Image });
      setIconPreview(base64Image);
    };
    reader.readAsDataURL(file);
  };

  const removeIcon = () => {
    setFormData({ ...formData, icon: '' });
    setIconPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Seat type name is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.icon) {
      toast({
        title: "Validation Error",
        description: "Please upload an icon",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    await onSave({ ...formData, propertyId });
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Grid3x3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle>{seatType ? 'Edit Seat Type' : 'Add Seat Type'}</DialogTitle>
              <DialogDescription>
                {seatType ? 'Update seat type details' : 'Create a new seat type'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Seat Type Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 font-medium">
                Seat Type Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Lounge Chair, Cabana, Beach Bed"
                required
              />
            </div>

            {/* PNG Icon Upload */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">
                Icon (PNG) *
              </Label>
              
              {iconPreview ? (
                <div className="relative">
                  <div className="border-2 border-slate-200 rounded-lg p-6 bg-slate-50 flex items-center justify-center">
                    <img 
                      src={iconPreview} 
                      alt="Icon preview"
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeIcon}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
                  <input
                    type="file"
                    accept="image/png"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="icon-upload"
                  />
                  <label htmlFor="icon-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 font-medium mb-1">
                      Click to upload PNG icon
                    </p>
                    <p className="text-xs text-slate-500">
                      Max file size: 500KB
                    </p>
                  </label>
                </div>
              )}
              <p className="text-xs text-slate-500">
                Upload a PNG icon to represent this seat type (transparent background recommended)
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
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : seatType ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
