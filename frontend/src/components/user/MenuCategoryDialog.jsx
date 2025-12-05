import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { ChefHat, Hash, ToggleLeft, ToggleRight } from 'lucide-react';

export const MenuCategoryDialog = ({ open, onOpenChange, category, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: 0,
    isActive: true
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        displayOrder: category.displayOrder || 0,
        isActive: category.isActive !== undefined ? category.isActive : true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        displayOrder: 0,
        isActive: true
      });
    }
  }, [category, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'displayOrder' ? parseInt(value) || 0 : value
    }));
  };

  const handleToggleActive = () => {
    setFormData(prev => ({
      ...prev,
      isActive: !prev.isActive
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Category name is required');
      return;
    }

    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <ChefHat className="w-6 h-6 mr-2 text-teal-600" />
            {category ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 font-medium">
              Category Name *
            </Label>
            <div className="relative">
              <ChefHat className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Appetizers, Beverages, Main Course"
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-700 font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of this category..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="displayOrder" className="text-slate-700 font-medium">
              Display Order
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="displayOrder"
                name="displayOrder"
                type="number"
                min="0"
                value={formData.displayOrder}
                onChange={handleChange}
                placeholder="0"
                className="pl-10"
              />
            </div>
            <p className="text-xs text-slate-500">
              Lower numbers appear first in the menu
            </p>
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-700">Category Status</p>
              <p className="text-sm text-slate-600">
                {formData.isActive ? 'Active and visible to guests' : 'Hidden from menu'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleActive}
              className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${
                formData.isActive ? 'bg-teal-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform ${
                  formData.isActive ? 'translate-x-11' : 'translate-x-1'
                }`}
              />
              {formData.isActive ? (
                <ToggleRight className="absolute right-2 w-5 h-5 text-white" />
              ) : (
                <ToggleLeft className="absolute left-2 w-5 h-5 text-slate-500" />
              )}
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
            >
              {category ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
