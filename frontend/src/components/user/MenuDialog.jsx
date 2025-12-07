import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ChefHat, ToggleLeft, ToggleRight } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';

export const MenuDialog = ({ open, onOpenChange, menu, onSave, items }) => {
  const [formData, setFormData] = useState({
    name: '',
    itemIds: [],
    isActive: true
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (menu) {
      setFormData({
        name: menu.name || '',
        itemIds: menu.itemIds || [],
        isActive: menu.isActive !== undefined ? menu.isActive : true
      });
    } else {
      setFormData({
        name: '',
        itemIds: [],
        isActive: true
      });
    }
    setSearchTerm('');
  }, [menu, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleActive = () => {
    setFormData(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleItemToggle = (itemId) => {
    setFormData(prev => ({
      ...prev,
      itemIds: prev.itemIds.includes(itemId)
        ? prev.itemIds.filter(id => id !== itemId)
        : [...prev.itemIds, itemId]
    }));
  };

  const handleSelectAll = () => {
    const filteredItemIds = getFilteredItems().map(item => item.id);
    setFormData(prev => ({
      ...prev,
      itemIds: filteredItemIds
    }));
  };

  const handleDeselectAll = () => {
    setFormData(prev => ({
      ...prev,
      itemIds: []
    }));
  };

  const getFilteredItems = () => {
    if (!searchTerm.trim()) return items.filter(item => item.isActive);
    return items.filter(item => 
      item.isActive && item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Menu name is required');
      return;
    }

    onSave(formData);
  };

  const filteredItems = getFilteredItems();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <ChefHat className="w-6 h-6 mr-2 text-blue-600" />
            {menu ? 'Edit Menu' : 'Create New Menu'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 font-medium">Menu Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Breakfast Menu, Lunch Specials"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-slate-700 font-medium">Select Items</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs"
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  className="text-xs"
                >
                  Deselect All
                </Button>
              </div>
            </div>
            
            <Input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />

            <div className="border border-slate-200 rounded-lg p-4 max-h-80 overflow-y-auto bg-slate-50">
              {filteredItems.length === 0 ? (
                <p className="text-center text-slate-500 py-4">
                  {searchTerm ? 'No items found' : 'No active items available. Please create items first.'}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        formData.itemIds.includes(item.id)
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white border-slate-200 hover:border-blue-200'
                      }`}
                      onClick={() => handleItemToggle(item.id)}
                    >
                      <Checkbox
                        checked={formData.itemIds.includes(item.id)}
                        onCheckedChange={() => handleItemToggle(item.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">${item.price?.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <p className="text-xs text-slate-500 mt-2">
              {formData.itemIds.length} item(s) selected
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-700">Menu Status</p>
              <p className="text-sm text-slate-600">{formData.isActive ? 'Active and visible to guests' : 'Hidden from public'}</p>
            </div>
            <button
              type="button"
              onClick={handleToggleActive}
              className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${
                formData.isActive ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform ${
                formData.isActive ? 'translate-x-11' : 'translate-x-1'
              }`} />
              {formData.isActive ? (
                <ToggleRight className="absolute right-2 w-5 h-5 text-white" />
              ) : (
                <ToggleLeft className="absolute left-2 w-5 h-5 text-slate-500" />
              )}
            </button>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {menu ? 'Update Menu' : 'Create Menu'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
