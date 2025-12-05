import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { UtensilsCrossed, Image as ImageIcon, DollarSign, Hash, ToggleLeft, ToggleRight } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';

export const MenuItemDialog = ({ open, onOpenChange, item, onSave, categories, tags, restrictions }) => {
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    image: '',
    price: '',
    description: '',
    isActive: true,
    tagIds: [],
    dietaryRestrictionIds: [],
    priority: 0
  });

  useEffect(() => {
    if (item) {
      setFormData({
        categoryId: item.categoryId || '',
        name: item.name || '',
        image: item.image || '',
        price: item.price || '',
        description: item.description || '',
        isActive: item.isActive !== undefined ? item.isActive : true,
        tagIds: item.tagIds || [],
        dietaryRestrictionIds: item.dietaryRestrictionIds || [],
        priority: item.priority || 0
      });
    } else {
      setFormData({
        categoryId: '',
        name: '',
        image: '',
        price: '',
        description: '',
        isActive: true,
        tagIds: [],
        dietaryRestrictionIds: [],
        priority: 0
      });
    }
  }, [item, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleActive = () => {
    setFormData(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleTagToggle = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId]
    }));
  };

  const handleRestrictionToggle = (restrictionId) => {
    setFormData(prev => ({
      ...prev,
      dietaryRestrictionIds: prev.dietaryRestrictionIds.includes(restrictionId)
        ? prev.dietaryRestrictionIds.filter(id => id !== restrictionId)
        : [...prev.dietaryRestrictionIds, restrictionId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Item name is required');
      return;
    }
    if (!formData.categoryId) {
      alert('Category is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Valid price is required');
      return;
    }

    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      priority: parseInt(formData.priority) || 0
    };

    onSave(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <UtensilsCrossed className="w-6 h-6 mr-2 text-blue-600" />
            {item ? 'Edit Menu Item' : 'Add New Menu Item'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 font-medium">Item Name *</Label>
              <div className="relative">
                <UtensilsCrossed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Caesar Salad" className="pl-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId" className="text-slate-700 font-medium">Category *</Label>
              <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.isActive).map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-slate-700 font-medium">Price *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input id="price" name="price" type="number" step="0.01" min="0" value={formData.price} onChange={handleChange} placeholder="0.00" className="pl-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-slate-700 font-medium">Priority</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input id="priority" name="priority" type="number" min="0" value={formData.priority} onChange={handleChange} placeholder="0" className="pl-10" />
              </div>
              <p className="text-xs text-slate-500">Higher priority items appear first</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-slate-700 font-medium">Item Image URL</Label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input id="image" name="image" value={formData.image} onChange={handleChange} placeholder="https://example.com/image.jpg" className="pl-10" />
            </div>
            {formData.image && (
              <div className="mt-2">
                <img src={formData.image} alt="Preview" className="w-full h-40 object-cover rounded-lg border-2 border-slate-200" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-700 font-medium">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Brief description of the menu item..." rows={3} className="resize-none" />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Tags (Optional)</Label>
            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
              {tags.filter(t => t.isActive).length === 0 ? (
                <p className="col-span-3 text-sm text-slate-500 text-center py-2">No tags available</p>
              ) : (
                tags.filter(t => t.isActive).map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      formData.tagIds.includes(tag.id)
                        ? 'text-white ring-2 ring-offset-2'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400'
                    }`}
                    style={formData.tagIds.includes(tag.id) ? { backgroundColor: tag.color, ringColor: tag.color } : {}}
                  >
                    {tag.name}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Dietary Restrictions (Optional)</Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
              {restrictions.filter(r => r.isActive).length === 0 ? (
                <p className="col-span-2 text-sm text-slate-500 text-center py-2">No dietary restrictions available</p>
              ) : (
                restrictions.filter(r => r.isActive).map((restriction) => (
                  <button
                    key={restriction.id}
                    type="button"
                    onClick={() => handleRestrictionToggle(restriction.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border-2 ${
                      formData.dietaryRestrictionIds.includes(restriction.id)
                        ? 'bg-green-100 border-green-600 text-green-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-green-300'
                    }`}
                  >
                    {restriction.icon} {restriction.name}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-700">Item Status</p>
              <p className="text-sm text-slate-600">{formData.isActive ? 'Active and visible to guests' : 'Hidden from menu'}</p>
            </div>
            <button type="button" onClick={handleToggleActive} className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${formData.isActive ? 'bg-blue-600' : 'bg-slate-300'}`}>
              <span className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform ${formData.isActive ? 'translate-x-11' : 'translate-x-1'}`} />
              {formData.isActive ? <ToggleRight className="absolute right-2 w-5 h-5 text-white" /> : <ToggleLeft className="absolute left-2 w-5 h-5 text-slate-500" />}
            </button>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">{item ? 'Update Item' : 'Create Item'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
