import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tag, Palette, ToggleLeft, ToggleRight } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Teal', value: '#14B8A6' },
];

export const MenuTagDialog = ({ open, onOpenChange, tag, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    isActive: true
  });

  useEffect(() => {
    if (tag) {
      setFormData({
        name: tag.name,
        color: tag.color || '#3B82F6',
        isActive: tag.isActive !== undefined ? tag.isActive : true
      });
    } else {
      setFormData({
        name: '',
        color: '#3B82F6',
        isActive: true
      });
    }
  }, [tag, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleActive = () => {
    setFormData(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Tag name is required');
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Tag className="w-6 h-6 mr-2 text-orange-600" />
            {tag ? 'Edit Tag' : 'Add New Tag'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 font-medium">Tag Name *</Label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Spicy, Popular, New" className="pl-10" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Tag Color</Label>
            <div className="grid grid-cols-4 gap-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  className={`h-12 rounded-lg border-2 transition-all ${
                    formData.color === color.value ? 'border-slate-900 ring-2 ring-slate-300' : 'border-slate-200 hover:border-slate-400'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {formData.color === color.value && (
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <Palette className="w-4 h-4 text-slate-900" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2 mt-3">
              <Label htmlFor="customColor" className="text-sm text-slate-600">Custom:</Label>
              <input type="color" id="customColor" value={formData.color} onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))} className="w-16 h-8 rounded border border-slate-300 cursor-pointer" />
              <code className="text-sm font-mono text-slate-600">{formData.color}</code>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-700">Tag Status</p>
              <p className="text-sm text-slate-600">{formData.isActive ? 'Active and visible' : 'Hidden from menu'}</p>
            </div>
            <button type="button" onClick={handleToggleActive} className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${formData.isActive ? 'bg-orange-600' : 'bg-slate-300'}`}>
              <span className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform ${formData.isActive ? 'translate-x-11' : 'translate-x-1'}`} />
              {formData.isActive ? <ToggleRight className="absolute right-2 w-5 h-5 text-white" /> : <ToggleLeft className="absolute left-2 w-5 h-5 text-slate-500" />}
            </button>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">{tag ? 'Update Tag' : 'Create Tag'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
