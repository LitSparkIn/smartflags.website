import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Salad, Smile, ToggleLeft, ToggleRight } from 'lucide-react';

const PRESET_ICONS = [
  { emoji: '🌱', name: 'Vegetarian' },
  { emoji: '🥩', name: 'Non-Veg' },
  { emoji: '🌿', name: 'Vegan' },
  { emoji: '🌾', name: 'Gluten-Free' },
  { emoji: '🥛', name: 'Dairy-Free' },
  { emoji: '🥜', name: 'Nut-Free' },
  { emoji: '🍤', name: 'Seafood' },
  { emoji: '🌶️', name: 'Spicy' },
  { emoji: '🍽️', name: 'General' },
  { emoji: '🥗', name: 'Healthy' },
  { emoji: '🔥', name: 'Hot' },
  { emoji: '❄️', name: 'Cold' },
];

export const DietaryRestrictionDialog = ({ open, onOpenChange, restriction, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    icon: '🍽️',
    description: '',
    isActive: true
  });

  useEffect(() => {
    if (restriction) {
      setFormData({
        name: restriction.name,
        icon: restriction.icon || '🍽️',
        description: restriction.description || '',
        isActive: restriction.isActive !== undefined ? restriction.isActive : true
      });
    } else {
      setFormData({
        name: '',
        icon: '🍽️',
        description: '',
        isActive: true
      });
    }
  }, [restriction, open]);

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
      alert('Restriction name is required');
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Salad className="w-6 h-6 mr-2 text-green-600" />
            {restriction ? 'Edit Dietary Restriction' : 'Add New Dietary Restriction'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 font-medium">Restriction Name *</Label>
            <div className="relative">
              <Salad className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Vegetarian, Vegan, Gluten-Free" className="pl-10" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Icon/Emoji</Label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_ICONS.map((preset) => (
                <button
                  key={preset.emoji}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon: preset.emoji }))}
                  className={`h-12 text-2xl rounded-lg border-2 transition-all hover:bg-slate-50 ${
                    formData.icon === preset.emoji ? 'border-green-600 bg-green-50' : 'border-slate-200'
                  }`}
                  title={preset.name}
                >
                  {preset.emoji}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Label htmlFor="customIcon" className="text-sm text-slate-600">Custom:</Label>
              <Input id="customIcon" name="icon" value={formData.icon} onChange={handleChange} placeholder="Enter emoji" className="w-20 text-center text-xl" maxLength="2" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-700 font-medium">Description (Optional)</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Brief description of this dietary restriction..." rows={2} className="resize-none" />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-700">Status</p>
              <p className="text-sm text-slate-600">{formData.isActive ? 'Active and visible to guests' : 'Hidden from menu'}</p>
            </div>
            <button type="button" onClick={handleToggleActive} className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${formData.isActive ? 'bg-green-600' : 'bg-slate-300'}`}>
              <span className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform ${formData.isActive ? 'translate-x-11' : 'translate-x-1'}`} />
              {formData.isActive ? <ToggleRight className="absolute right-2 w-5 h-5 text-white" /> : <ToggleLeft className="absolute left-2 w-5 h-5 text-slate-500" />}
            </button>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">{restriction ? 'Update Restriction' : 'Create Restriction'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
